import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HOTMART_WEBHOOK_TOKEN = Deno.env.get("HOTMART_WEBHOOK_TOKEN");

serve(async (req) => {
    // CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Hotmart-Hottok",
    };

    // Handle preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        // 1. Verificação de segurança - Hotmart usa o header X-Hotmart-Hottok
        const hottok = req.headers.get("X-Hotmart-Hottok") || req.headers.get("x-hotmart-hottok");

        // DEBUG: Logar todos os headers
        console.log("=== DEBUG HOTMART HEADERS ===");
        console.log(JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
        console.log("=============================");

        // Verificar token se configurado
        if (HOTMART_WEBHOOK_TOKEN && hottok !== HOTMART_WEBHOOK_TOKEN) {
            // Fallback: verificar na query string
            const urlToken = new URL(req.url).searchParams.get("token");
            if (urlToken !== HOTMART_WEBHOOK_TOKEN) {
                console.error("Unauthorized Hotmart webhook attempt. Token mismatch.");
                return new Response(JSON.stringify({ error: "Unauthorized" }), {
                    status: 401,
                    headers: corsHeaders
                });
            }
            console.log("Authorized via URL param fallback");
        }

        const payload = await req.json();
        console.log("Webhook Hotmart Received:", JSON.stringify(payload));

        /*
         * Estrutura do webhook da Hotmart:
         * {
         *   "event": "PURCHASE_APPROVED" | "PURCHASE_COMPLETE" | "PURCHASE_REFUNDED" | "PURCHASE_CHARGEBACK" | etc,
         *   "data": {
         *     "buyer": {
         *       "email": "cliente@email.com",
         *       "name": "Nome do Cliente"
         *     },
         *     "purchase": {
         *       "transaction": "HP12345678",
         *       "status": "approved"
         *     }
         *   }
         * }
         */

        // Extrair dados do payload da Hotmart
        const event = payload.event || "";
        const email = payload.data?.buyer?.email || payload.data?.customer?.email || payload.buyer?.email;
        const buyerName = payload.data?.buyer?.name || payload.data?.customer?.name || "";
        const transactionId = payload.data?.purchase?.transaction || payload.data?.purchase?.order_date || payload.transaction;

        console.log(`Hotmart Extracted: Event=${event}, Email=${email}, Name=${buyerName}, TransID=${transactionId}`);

        if (!email) {
            console.error("Email not found in Hotmart payload");
            return new Response(JSON.stringify({ message: "Email not found in payload, ignored" }), {
                status: 200,
                headers: corsHeaders
            });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Determinar status baseado no evento da Hotmart
        let purchaseStatus = 'pending';
        const eventLower = String(event).toLowerCase();

        if (eventLower.includes('approved') || eventLower.includes('complete') || eventLower === 'purchase_approved' || eventLower === 'purchase_complete') {
            purchaseStatus = 'approved';
        } else if (eventLower.includes('refunded') || eventLower.includes('chargeback') || eventLower.includes('canceled')) {
            purchaseStatus = 'refunded';
        } else if (eventLower.includes('billet_printed') || eventLower.includes('waiting_payment')) {
            // Boleto gerado ou aguardando pagamento - não criar usuário ainda
            console.log(`Event '${event}' is pending payment, ignoring for now.`);
            return new Response(JSON.stringify({ message: "Pending payment event ignored", event }), {
                status: 200,
                headers: corsHeaders
            });
        } else {
            console.log(`Event '${event}' ignored.`);
            return new Response(JSON.stringify({ message: "Event ignored", event }), {
                status: 200,
                headers: corsHeaders
            });
        }

        // Normalizar email para lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Buscar usuário existente
        const { data: profiles, error: selectError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', normalizedEmail);

        if (selectError) {
            throw selectError;
        }

        if (profiles && profiles.length > 0) {
            // Usuário já existe - atualizar perfil
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    purchase_status: purchaseStatus,
                    purchase_platform: 'hotmart',
                    purchase_transaction_id: transactionId,
                    purchase_date: new Date().toISOString()
                })
                .eq('email', normalizedEmail);

            if (updateError) {
                throw updateError;
            }
            console.log(`Profile updated for ${normalizedEmail}: ${purchaseStatus}`);
            return new Response(JSON.stringify({ message: "Profile updated successfully" }), {
                status: 200,
                headers: corsHeaders
            });
        } else {
            // Usuário NÃO existe - Criar automaticamente com senha padrão
            console.log(`User with email ${normalizedEmail} not found. Creating user automatically...`);

            const DEFAULT_PASSWORD = "123456";

            // 1. Criar usuário no Supabase Auth
            const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: normalizedEmail,
                password: DEFAULT_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    name: buyerName,
                    platform: 'hotmart'
                }
            });

            if (createUserError) {
                console.error(`Error creating user ${normalizedEmail}:`, createUserError);
                throw createUserError;
            }

            console.log(`User created successfully: ${normalizedEmail} (ID: ${newUser.user?.id})`);

            // 2. Criar perfil do usuário
            const { error: insertProfileError } = await supabase
                .from('profiles')
                .insert({
                    id: newUser.user?.id,
                    email: normalizedEmail,
                    purchase_status: purchaseStatus,
                    purchase_platform: 'hotmart',
                    purchase_transaction_id: transactionId,
                    purchase_date: new Date().toISOString()
                });

            if (insertProfileError) {
                console.error(`Error creating profile for ${normalizedEmail}:`, insertProfileError);
                // Tentar atualizar caso trigger tenha criado
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        purchase_status: purchaseStatus,
                        purchase_platform: 'hotmart',
                        purchase_transaction_id: transactionId,
                        purchase_date: new Date().toISOString()
                    })
                    .eq('id', newUser.user?.id);

                if (updateError) {
                    throw updateError;
                }
            }

            console.log(`Profile created/updated for new user ${normalizedEmail}: ${purchaseStatus}`);
            return new Response(JSON.stringify({
                message: "User created and profile configured successfully",
                email: normalizedEmail,
                userId: newUser.user?.id
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

    } catch (err: any) {
        console.error("Error processing Hotmart webhook:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        });
    }
});
