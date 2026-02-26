-- Migration: 001_create_postpack_workflow
-- Data: 2026-01-08
-- Projeto: Daily Prophet - Instituto Rodovansky
-- Descricao: Cria tabela de workflow para gerenciar fases dos postpacks

-- ============================================
-- PRE-REQUISITO: Tabela postpacks deve existir
-- ============================================

-- Criar tabela postpacks se nao existir
CREATE TABLE IF NOT EXISTS postpacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA PRINCIPAL: postpack_workflow
-- ============================================

CREATE TABLE IF NOT EXISTS postpack_workflow (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    postpack_id UUID NOT NULL REFERENCES postpacks(id) ON DELETE CASCADE,
    
    -- Status geral
    status VARCHAR(20) DEFAULT 'fase_1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Responsaveis
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    
    -- Fase 1: Criacao
    fase_1_status VARCHAR(20) DEFAULT 'pendente',
    fase_1_completed_at TIMESTAMPTZ,
    fase_1_checklist JSONB DEFAULT '{}'::jsonb,
    
    -- Fase 2: Revisao
    fase_2_status VARCHAR(20) DEFAULT 'pendente',
    fase_2_completed_at TIMESTAMPTZ,
    fase_2_checklist JSONB DEFAULT '{}'::jsonb,
    fase_2_feedback TEXT,
    
    -- Fase 3: Aprovacao
    fase_3_status VARCHAR(20) DEFAULT 'pendente',
    fase_3_completed_at TIMESTAMPTZ,
    fase_3_checklist JSONB DEFAULT '{}'::jsonb,
    
    -- Fase 4: Publicacao
    fase_4_status VARCHAR(20) DEFAULT 'pendente',
    fase_4_completed_at TIMESTAMPTZ,
    fase_4_checklist JSONB DEFAULT '{}'::jsonb,
    fase_4_published_url TEXT,
    fase_4_published_at TIMESTAMPTZ,
    
    -- Fase 5: Metricas
    fase_5_status VARCHAR(20) DEFAULT 'pendente',
    fase_5_completed_at TIMESTAMPTZ,
    fase_5_checklist JSONB DEFAULT '{}'::jsonb,
    metricas_24h JSONB DEFAULT NULL,
    metricas_7d JSONB DEFAULT NULL,
    
    -- Notas gerais
    notas TEXT
);

-- ============================================
-- INDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_workflow_postpack ON postpack_workflow(postpack_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON postpack_workflow(status);
CREATE INDEX IF NOT EXISTS idx_workflow_created_at ON postpack_workflow(created_at);

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE postpack_workflow IS 'Gerencia o workflow de 5 fases dos postpacks';
COMMENT ON COLUMN postpack_workflow.status IS 'Fase atual: fase_1, fase_2, fase_3, fase_4, fase_5, concluido';
COMMENT ON COLUMN postpack_workflow.fase_1_checklist IS 'JSON com itens do checklist da fase 1';
COMMENT ON COLUMN postpack_workflow.metricas_24h IS 'JSON com metricas coletadas apos 24h da publicacao';
COMMENT ON COLUMN postpack_workflow.metricas_7d IS 'JSON com metricas coletadas apos 7 dias da publicacao';

-- ============================================
-- VERIFICACAO
-- ============================================

-- Verificar se a tabela foi criada
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'postpack_workflow'
ORDER BY ordinal_position;
