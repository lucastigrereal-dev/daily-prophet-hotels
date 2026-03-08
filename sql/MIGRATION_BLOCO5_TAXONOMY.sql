-- ============================================================
-- BLOCO 5A — Enriquecimento de metadados nas tabelas de conteudo
-- Executar no Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. HOOKS — adicionar metadados faltantes
-- ─────────────────────────────────────────────
ALTER TABLE hooks
  ADD COLUMN IF NOT EXISTS formato TEXT,
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS tipo_hotel TEXT[],
  ADD COLUMN IF NOT EXISTS sazonalidade TEXT DEFAULT 'o_ano_todo',
  ADD COLUMN IF NOT EXISTS subtema TEXT,
  ADD COLUMN IF NOT EXISTS quando_usar TEXT,
  ADD COLUMN IF NOT EXISTS score_qualidade INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_hooks_formato ON hooks(formato);
CREATE INDEX IF NOT EXISTS idx_hooks_objetivo ON hooks(objetivo);
CREATE INDEX IF NOT EXISTS idx_hooks_sazonalidade ON hooks(sazonalidade);
CREATE INDEX IF NOT EXISTS idx_hooks_ativo ON hooks(ativo);
CREATE INDEX IF NOT EXISTS idx_hooks_score ON hooks(score_qualidade);

-- ─────────────────────────────────────────────
-- 2. BENCHMARKS_POSTS — adicionar metadados faltantes
--    Ja tem: formato, publico, intencao, tema, cta, qualidade_score, ativo, categoria_hotel
-- ─────────────────────────────────────────────
ALTER TABLE benchmarks_posts
  ADD COLUMN IF NOT EXISTS tipo_hotel TEXT[],
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS sazonalidade TEXT DEFAULT 'o_ano_todo',
  ADD COLUMN IF NOT EXISTS subtema TEXT,
  ADD COLUMN IF NOT EXISTS quando_usar TEXT;

CREATE INDEX IF NOT EXISTS idx_benchmarks_objetivo ON benchmarks_posts(objetivo);
CREATE INDEX IF NOT EXISTS idx_benchmarks_sazonalidade ON benchmarks_posts(sazonalidade);
CREATE INDEX IF NOT EXISTS idx_benchmarks_tipo_hotel ON benchmarks_posts USING GIN(tipo_hotel);

-- ─────────────────────────────────────────────
-- 3. CAPTION_TEMPLATES — adicionar metadados faltantes
--    Ja tem: objetivo, ativo
-- ─────────────────────────────────────────────
ALTER TABLE caption_templates
  ADD COLUMN IF NOT EXISTS tipo_hotel TEXT[],
  ADD COLUMN IF NOT EXISTS publico TEXT,
  ADD COLUMN IF NOT EXISTS formato TEXT,
  ADD COLUMN IF NOT EXISTS sazonalidade TEXT DEFAULT 'o_ano_todo',
  ADD COLUMN IF NOT EXISTS tema TEXT,
  ADD COLUMN IF NOT EXISTS subtema TEXT,
  ADD COLUMN IF NOT EXISTS quando_usar TEXT,
  ADD COLUMN IF NOT EXISTS score_qualidade INT DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_templates_tema ON caption_templates(tema);
CREATE INDEX IF NOT EXISTS idx_templates_formato ON caption_templates(formato);

-- ─────────────────────────────────────────────
-- 4. KNOWLEDGE_BASE — adicionar metadados faltantes
--    Ja tem: categoria, subcategoria, relevancia, ativo
-- ─────────────────────────────────────────────
ALTER TABLE knowledge_base
  ADD COLUMN IF NOT EXISTS tipo_hotel TEXT[],
  ADD COLUMN IF NOT EXISTS publico TEXT,
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS sazonalidade TEXT DEFAULT 'o_ano_todo',
  ADD COLUMN IF NOT EXISTS quando_usar TEXT;

CREATE INDEX IF NOT EXISTS idx_kb_tipo_hotel ON knowledge_base USING GIN(tipo_hotel);

-- ─────────────────────────────────────────────
-- 5. HASHTAG_COMBOS — adicionar metadados faltantes
--    Ja tem: nicho, regiao, tipo_hotel (varchar), ativo
-- ─────────────────────────────────────────────
ALTER TABLE hashtag_combos
  ADD COLUMN IF NOT EXISTS publico TEXT,
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS formato TEXT,
  ADD COLUMN IF NOT EXISTS sazonalidade TEXT DEFAULT 'o_ano_todo',
  ADD COLUMN IF NOT EXISTS tema TEXT,
  ADD COLUMN IF NOT EXISTS subtema TEXT,
  ADD COLUMN IF NOT EXISTS quando_usar TEXT,
  ADD COLUMN IF NOT EXISTS score_qualidade INT DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_hashtags_tema ON hashtag_combos(tema);
CREATE INDEX IF NOT EXISTS idx_hashtags_publico ON hashtag_combos(publico);

-- ─────────────────────────────────────────────
-- 6. CAMPANHAS — adicionar sazonalidade e subtema
--    Ja tem: tipo, objetivo, publico, tipo_hotel[]
-- ─────────────────────────────────────────────
ALTER TABLE campanhas
  ADD COLUMN IF NOT EXISTS sazonalidade TEXT,
  ADD COLUMN IF NOT EXISTS subtema TEXT;
