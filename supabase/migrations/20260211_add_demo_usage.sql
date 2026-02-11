-- Adiciona colunas para controle de uso da chave de cortesia (Demo)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS demo_usage_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_demo_usage_date DATE DEFAULT CURRENT_DATE;

-- Garante que as colunas de compra existam (caso não tenham sido executadas antes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_status TEXT DEFAULT 'pending';

-- Comentários para documentação
COMMENT ON COLUMN profiles.demo_usage_count IS 'Número de histórias geradas usando a chave demo no dia atual';
COMMENT ON COLUMN profiles.last_demo_usage_date IS 'Data do último uso da chave demo, para resetar o contador diário';
