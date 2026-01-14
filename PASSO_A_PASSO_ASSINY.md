# Guia de Deploy - Integração Assiny

Sua integração já está codificada! Agora siga estes passos para colocar no ar.

## ✨ Funcionalidade de Criação Automática de Usuário

Quando uma compra é aprovada na Assiny, o sistema **cria automaticamente** uma conta para o cliente:
- **Email**: O email informado na compra
- **Senha padrão**: `123456`
- **Acesso**: Liberado imediatamente após a compra

> **Importante**: Recomende aos clientes que alterem a senha após o primeiro login!

## 1. Atualizar Banco de Dados (Supabase)

Acesse o **SQL Editor** no painel do Supabase e execute o seguinte comando para criar as colunas de controle de compra:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_status TEXT DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_platform TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_transaction_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ;

-- (Opcional) Liberar acesso para você mesmo imediatamente:
-- UPDATE profiles SET purchase_status = 'approved' WHERE email = 'seu@email.com';
```

## 2. Configurar Variáveis de Ambiente (Supabase)

Vá em **Project Settings** > **Edge Functions** > **Secrets** e adicione:

*   `ASSINY_WEBHOOK_TOKEN` = (Crie um token seguro, ex: `segredo123`, ou use o que a Assiny fornecer e coloque aqui)

## 3. Deploy da Edge Function

No seu terminal (na pasta do projeto), execute:

```bash
npx supabase functions deploy assiny-webhook --no-verify-jwt
```

*(Se não tiver o Supabase CLI instalado, você pode copiar o conteúdo do arquivo `supabase/functions/assiny-webhook/index.ts` e colar manualmente no painel do Supabase em Edge Functions).*

## 4. Configurar Webhook na Assiny

1.  Acesse seu produto na [Assiny](https://assiny.com.br).
2.  Vá em **Entrega do Produto** (ou Webhooks).
3.  Adicione o Webhook:
    *   **URL**: `https://[SEU-REF-DO-PROJETO].supabase.co/functions/v1/assiny-webhook`
    *   **Eventos**: `Compra Aprovada` (ou equivalent)
    *   **Token/Headers**: Se possível, configure para enviar o header `Authorization: Bearer SEU_TOKEN` ou `X-Token: SEU_TOKEN`.

## 5. Testar

1.  Abra o app. Você deve ver a **tela de bloqueio** pedindo para comprar.
2.  Faça uma compra de teste na Assiny (ou use a opção "Testar Webhook" no painel deles).
3.  Após o webhook ser disparado, atualize a página do app. O acesso deve ser liberado!
