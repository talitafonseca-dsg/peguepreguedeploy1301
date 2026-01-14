import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ASSINY_WEBHOOK_TOKEN = Deno.env.get("ASSINY_WEBHOOK_TOKEN");

serve(async (req) => {
    try {
        // 1. Verificação básica de segurança
        const authHeader = req.headers.get("Authorization");

        // DEBUG: Logar todos os headers para entender o que está chegando
        console.log("=== DEBUG HEADERS ===");
        console.log(JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
        console.log("=====================");

        if (ASSINY_WEBHOOK_TOKEN && authHeader !== `Bearer ${ASSINY_WEBHOOK_TOKEN}`) {
            console.error("Unauthorized webhook attempt. Mismatch detected.");

            // Permitir temporariamente para teste se o token estiver na URL (fallback)
            const urlToken = new URL(req.url).searchParams.get("token");
            if (urlToken !== ASSINY_WEBHOOK_TOKEN) {
                return new Response(JSON.stringify({ error: "Unauthorized", received: authHeader }), { status: 401 });
            }
            console.log("Authorized via URL param fallback");
        }

        const payload = await req.json();
        console.log("Webhook Assiny Received:", JSON.stringify(payload));

        // Adaptar conforme a estrutura real enviada pelo Assiny
        // Estrutura detectada: { event: "approved_purchase", data: { ... } }
        let status = payload.status || payload.event;
        // ATUALIZAÇÃO FINAL: O email real no webhook da Assiny vem em data.client.email
        let email = payload.customer?.email || payload.email || payload.data?.client?.email || payload.data?.customer?.email || payload.data?.buyer?.email;
        let transactionId = payload.transaction_id || payload.id || payload.data?.transaction_id || payload.data?.payment?.id;

        // Log para debug dos campos extraídos
        console.log(`Extracted: Status=${status}, Email=${email}, TransID=${transactionId}`);

        if (!email) {
            console.error("Email not found in payload");
            // Não retornar erro 400 para não travar a Assiny, apenas logar aviso
            return new Response(JSON.stringify({ message: "Email not found in payload, ignored" }), { status: 200 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Determinar novo status
        let purchaseStatus = 'pending';
        // Normalizar status para letras minúsculas e checar
        const s = String(status).toLowerCase();

        if (s.includes('approved') || s.includes('paid') || s === 'completed') {
            purchaseStatus = 'approved';
        } else if (s.includes('refunded') || s.includes('chargeback')) {
            purchaseStatus = 'refunded';
        } else {
            console.log(`Status '${s}' ignored.`);
            return new Response(JSON.stringify({ message: "Status ignored", status: s }), { status: 200 });
        }

        // 2. Atualizar perfil do usuário
        // IMPORTANTE: Assume que o usuário já criou conta no App com este email.
        // Se o usuário comprou ANTES de criar conta, este update não encontrará ninguém.
        // O ideal seria ter uma tabela separada de 'compras' se esse fluxo for comum.

        const { data: profiles, error: selectError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email);

        if (selectError) {
            throw selectError;
        }

        if (profiles && profiles.length > 0) {
            // Usuário já existe, apenas atualizar o perfil
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    purchase_status: purchaseStatus,
                    purchase_platform: 'assiny',
                    purchase_transaction_id: transactionId,
                    purchase_date: new Date().toISOString()
                })
                .eq('email', email);

            if (updateError) {
                throw updateError;
            }
            console.log(`Profile updated for ${email}: ${purchaseStatus}`);
            return new Response(JSON.stringify({ message: "Profile updated successfully" }), { status: 200 });
        } else {
            // Usuário NÃO existe - Criar automaticamente com senha padrão
            console.log(`User with email ${email} not found. Creating user automatically...`);

            const DEFAULT_PASSWORD = "123456";

            // 1. Criar o usuário no Supabase Auth usando Admin API
            const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: email,
                password: DEFAULT_PASSWORD,
                email_confirm: true, // Marcar email como confirmado automaticamente
            });

            if (createUserError) {
                console.error(`Error creating user ${email}:`, createUserError);
                throw createUserError;
            }

            console.log(`User created successfully: ${email} (ID: ${newUser.user?.id})`);

            // 2. Criar o perfil do usuário com os dados da compra
            const { error: insertProfileError } = await supabase
                .from('profiles')
                .insert({
                    id: newUser.user?.id,
                    email: email,
                    purchase_status: purchaseStatus,
                    purchase_platform: 'assiny',
                    purchase_transaction_id: transactionId,
                    purchase_date: new Date().toISOString()
                });

            if (insertProfileError) {
                console.error(`Error creating profile for ${email}:`, insertProfileError);
                // Tentar atualizar caso o perfil já exista (trigger automático pode ter criado)
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        purchase_status: purchaseStatus,
                        purchase_platform: 'assiny',
                        purchase_transaction_id: transactionId,
                        purchase_date: new Date().toISOString()
                    })
                    .eq('id', newUser.user?.id);

                if (updateError) {
                    throw updateError;
                }
            }

            console.log(`Profile created/updated for new user ${email}: ${purchaseStatus}`);
            return new Response(JSON.stringify({
                message: "User created and profile configured successfully",
                email: email,
                userId: newUser.user?.id
            }), { status: 200 });
        }

    } catch (err: any) {
        console.error("Error processing webhook:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});
