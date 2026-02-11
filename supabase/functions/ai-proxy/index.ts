import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MASTER_GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No authorization header" }), { status: 401, headers: corsHeaders });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Invalid user" }), { status: 401, headers: corsHeaders });
        }

        // 1. Verificar elegibilidade e Limites
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("purchase_date, demo_usage_count, last_demo_usage_date, gemini_api_key")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });
        }

        // Se o usuário já tem sua própria chave, ele não deve estar usando o proxy (ou pelo menos não conta contra o limite demo)
        // Mas o frontend só chamaria isso se não tivesse a chave.

        const purchaseDate = profile.purchase_date ? new Date(profile.purchase_date) : null;
        if (!purchaseDate) {
            return new Response(JSON.stringify({ error: "Acesso cortesia requer uma compra confirmada." }), { status: 403, headers: corsHeaders });
        }

        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > 10) {
            return new Response(JSON.stringify({
                error: "Seu período de cortesia de 10 dias expirou. Por favor, configure sua própria chave de API para continuar.",
                code: "GRACE_PERIOD_EXPIRED"
            }), { status: 403, headers: corsHeaders });
        }

        // Verificar limite diário (3 por dia)
        const today = new Date().toISOString().split("T")[0];
        let usageCount = profile.demo_usage_count || 0;
        const lastUsageDate = profile.last_demo_usage_date || "";

        if (lastUsageDate !== today) {
            usageCount = 0;
        }

        if (usageCount >= 3) {
            return new Response(JSON.stringify({
                error: "Limite diário de cortesia atingido (3 histórias/dia). Configure sua própria chave para uso ilimitado.",
                code: "DAILY_LIMIT_REACHED"
            }), { status: 429, headers: corsHeaders });
        }

        // 2. Chamar a API do Gemini
        const { type, payload } = await req.json();

        // Só incrementamos o contador para gerações de estrutura de história (o início do processo)
        // Isso evita que o limite seja consumido por imagens ou atividades individuais da mesma história.
        const shouldIncrement = type === "story";

        let endpoint = "";
        let body = {};

        if (type === "story" || type === "activity") {
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${MASTER_GEMINI_KEY}`;
            body = payload;
        } else if (type === "image") {
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${MASTER_GEMINI_KEY}`;
            body = payload;
        } else {
            return new Response(JSON.stringify({ error: "Invalid request type" }), { status: 400, headers: corsHeaders });
        }

        const geminiResponse = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const result = await geminiResponse.json();

        // 3. Atualizar contador se necessário
        if (shouldIncrement && geminiResponse.ok) {
            await supabase
                .from("profiles")
                .update({
                    demo_usage_count: usageCount + 1,
                    last_demo_usage_date: today
                })
                .eq("id", user.id);
        }

        return new Response(JSON.stringify(result), {
            status: geminiResponse.status,
            headers: corsHeaders
        });

    } catch (err: any) {
        console.error("Proxy error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
