# Guia de Deploy - Integração Hotmart

Sua integração com a Hotmart já está codificada! Siga estes passos para configurar.

## ✨ Funcionalidade de Criação Automática de Usuário

Quando uma compra é aprovada na Hotmart, o sistema **cria automaticamente** uma conta para o cliente:
- **Email**: O email informado na compra
- **Senha padrão**: `123456`
- **Acesso**: Liberado imediatamente após a compra

> **Importante**: Recomende aos clientes que alterem a senha após o primeiro login!

---

## 1. Configurar Variáveis de Ambiente (Supabase)

Vá em **Project Settings** > **Edge Functions** > **Secrets** e adicione:

- `HOTMART_WEBHOOK_TOKEN` = (Copie o **Hottok** que você vai encontrar nas configurações do produto na Hotmart)

---

## 2. Deploy da Edge Function

No seu terminal (na pasta do projeto), execute:

```bash
npx supabase functions deploy hotmart-webhook --no-verify-jwt
```

*(Ou copie o conteúdo de `supabase/functions/hotmart-webhook/index.ts` no painel do Supabase em Edge Functions)*

---

## 3. Configurar Webhook na Hotmart

1. Acesse seu produto na [Hotmart](https://hotmart.com).
2. Vá em **Configurações do Produto** > **Webhooks (Postback)**.
3. Clique em **Criar Webhook** e configure:
   - **URL**: `https://[SEU-REF-DO-PROJETO].supabase.co/functions/v1/hotmart-webhook`
   - **Eventos a disparar**:
     - ✅ `PURCHASE_APPROVED` (Compra aprovada)
     - ✅ `PURCHASE_COMPLETE` (Compra completa)
     - ✅ `PURCHASE_REFUNDED` (Reembolso)
     - ✅ `PURCHASE_CHARGEBACK` (Estorno)
4. Copie o **Hottok** gerado e cole na variável de ambiente `HOTMART_WEBHOOK_TOKEN` no Supabase.

---

## 4. Encontrar a URL do Supabase

A URL do webhook será algo como:
```
https://abc123xyz.supabase.co/functions/v1/hotmart-webhook
```

Para encontrar seu `project-ref`, vá em:
- Supabase Dashboard > Seu Projeto > Settings > API > Project URL

---

## 5. Testar

1. Na Hotmart, você pode fazer uma **compra de teste** ou usar o botão **"Testar Webhook"**.
2. Verifique os logs no Supabase em **Edge Functions** > **hotmart-webhook** > **Logs**.
3. Após o webhook disparar, o usuário deve conseguir fazer login no app!

---

## Eventos Suportados

| Evento Hotmart | Ação no Sistema |
|----------------|-----------------|
| `PURCHASE_APPROVED` | Cria usuário e libera acesso |
| `PURCHASE_COMPLETE` | Cria usuário e libera acesso |
| `PURCHASE_REFUNDED` | Bloqueia acesso (status = refunded) |
| `PURCHASE_CHARGEBACK` | Bloqueia acesso (status = refunded) |
| Outros eventos | Ignorados |

---

## Solução de Problemas

### Webhook não está funcionando
1. Verifique se a Edge Function foi deployada
2. Confira os logs no Supabase
3. Verifique se o Hottok está correto nas duas pontas

### Usuário não consegue logar
1. Verifique na tabela `profiles` se o email foi criado
2. Verifique se `purchase_status` está como `approved`
3. A senha padrão é `123456`
