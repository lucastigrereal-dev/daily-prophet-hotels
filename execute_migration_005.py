#!/usr/bin/env python3
"""
Execute Migration 005: Fix legendas and ganchos tables
Run this to apply the database migration to Supabase
"""

import os

def show_instructions():
    migration_sql = """
-- MIGRATION 005: Fix legendas and ganchos tables

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_legenda TEXT DEFAULT 'legenda';

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_post TEXT;

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS procedimento TEXT;

CREATE TABLE IF NOT EXISTS ganchos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    texto TEXT NOT NULL,
    tipo_legenda TEXT DEFAULT 'gancho',
    tipo_post TEXT,
    procedimento TEXT,
    pilar TEXT,
    objetivo TEXT,
    ativo BOOLEAN DEFAULT true,
    uso_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legendas_tipo_legenda ON legendas(tipo_legenda);
CREATE INDEX IF NOT EXISTS idx_legendas_tipo_post ON legendas(tipo_post);
CREATE INDEX IF NOT EXISTS idx_legendas_procedimento ON legendas(procedimento);
CREATE INDEX IF NOT EXISTS idx_legendas_created_at ON legendas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ganchos_tipo_legenda ON ganchos(tipo_legenda);
CREATE INDEX IF NOT EXISTS idx_ganchos_tipo_post ON ganchos(tipo_post);
CREATE INDEX IF NOT EXISTS idx_ganchos_procedimento ON ganchos(procedimento);
CREATE INDEX IF NOT EXISTS idx_ganchos_created_at ON ganchos(created_at DESC);

-- Test queries after migration
SELECT COUNT(*) FROM legendas;
SELECT COUNT(*) FROM ganchos;
"""

    print("="*70)
    print("[MIGRATION 005] Fix legendas and ganchos tables")
    print("="*70)
    print()
    print("INSTRUCOES PARA EXECUTAR NO SUPABASE DASHBOARD:")
    print()
    print("1. Abra: https://supabase.com/dashboard")
    print("2. Projeto: daily-prophet-gamified")
    print("3. SQL Editor -> New Query")
    print("4. Copie e cole o SQL abaixo:")
    print()
    print("-"*70)
    print(migration_sql)
    print("-"*70)
    print()
    print("5. Clique em [Run]")
    print("6. Aguarde conclusao (1-2 segundos)")
    print()
    print("VERIFICACAO POS-EXECUCAO:")
    print("  - Devera retornar 0 linhas para ambas as queries")
    print("    (tabelas vazias no inicio)")
    print()
    print("="*70)
    print()

if __name__ == "__main__":
    show_instructions()
