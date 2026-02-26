-- Migration 004: Add missing columns to legendas table

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_legenda VARCHAR(50) DEFAULT 'legenda';

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_post VARCHAR(50);

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS procedimento VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_legendas_tipo_legenda ON legendas(tipo_legenda);
CREATE INDEX IF NOT EXISTS idx_legendas_tipo_post ON legendas(tipo_post);
CREATE INDEX IF NOT EXISTS idx_legendas_procedimento ON legendas(procedimento);

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'legendas'
AND column_name IN ('tipo_legenda', 'tipo_post', 'procedimento')
ORDER BY column_name;
