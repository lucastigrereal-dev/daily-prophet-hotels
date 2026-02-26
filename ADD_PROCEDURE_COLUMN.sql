-- =====================================================
-- SQL PARA ADICIONAR COLUNAS NA TABELA POSTPACKS
-- Rodar no Supabase SQL Editor
-- =====================================================

-- Adicionar coluna 'procedure' se não existir
ALTER TABLE postpacks 
ADD COLUMN IF NOT EXISTS procedure TEXT;

-- Garantir que as outras colunas existem
ALTER TABLE postpacks 
ADD COLUMN IF NOT EXISTS format TEXT;

ALTER TABLE postpacks 
ADD COLUMN IF NOT EXISTS objective TEXT;

ALTER TABLE postpacks 
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE postpacks 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Verificar estrutura atual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'postpacks';
