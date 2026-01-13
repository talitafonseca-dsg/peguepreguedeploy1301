-- Adiciona colunas para controle de compras
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_status TEXT DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_platform TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_transaction_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ;

-- Opcional: Criar índex para busca rápida por status
CREATE INDEX IF NOT EXISTS idx_profiles_purchase_status ON profiles(purchase_status);
