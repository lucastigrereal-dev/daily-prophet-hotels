-- ============================================================
-- DAILY PROPHET HOTELS — WAVE 1: Content DNA + Infra
-- 6 novas tabelas para personalizar conteudo por hotel
-- ============================================================

-- 1. HOTEL_CONTENT_PREFERENCES (DNA de Conteudo — JSONB unificado)
-- Tom, publico, frequencia, restricoes, temas preferidos
CREATE TABLE IF NOT EXISTS hotel_content_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Tom e voz
  tom VARCHAR(50) DEFAULT 'acolhedor'
    CHECK (tom IN ('acolhedor','sofisticado','aventureiro','rustico','moderno','luxuoso','despojado','familiar')),
  voz VARCHAR(50) DEFAULT 'primeira_pessoa'
    CHECK (voz IN ('primeira_pessoa','terceira_pessoa','institucional')),

  -- Publico alvo
  publico_primario VARCHAR(50) DEFAULT 'casais'
    CHECK (publico_primario IN ('casais','familias','negocios','aventureiros','luxo','mochileiros','idosos','pets')),
  publico_secundario VARCHAR(50),

  -- Frequencia
  posts_por_semana INT DEFAULT 3 CHECK (posts_por_semana BETWEEN 1 AND 14),
  stories_por_dia INT DEFAULT 2 CHECK (stories_por_dia BETWEEN 0 AND 10),
  melhor_horario_post VARCHAR(10) DEFAULT '18:00',

  -- Temas preferidos (array de strings)
  temas_preferidos TEXT[] DEFAULT ARRAY['experiencia', 'cafe_manha', 'piscina', 'quarto'],
  temas_evitar TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Formatos preferidos
  formatos_preferidos TEXT[] DEFAULT ARRAY['carrossel', 'reel', 'foto'],

  -- Restricoes
  palavras_evitar TEXT[] DEFAULT ARRAY[]::TEXT[],
  concorrentes_nao_mencionar TEXT[] DEFAULT ARRAY[]::TEXT[],
  regras_extras JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_hotel_content_pref_hotel ON hotel_content_preferences(hotel_id);

-- RLS
ALTER TABLE hotel_content_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_content_preferences_owner" ON hotel_content_preferences
  FOR ALL USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- 2. HOTEL_WEEKLY_TASKS (Tarefas da semana — substitui localStorage)
CREATE TABLE IF NOT EXISTS hotel_weekly_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  semana_inicio DATE NOT NULL,
  task_key VARCHAR(50) NOT NULL,
  label TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  done_at TIMESTAMPTZ,

  UNIQUE(hotel_id, semana_inicio, task_key)
);

CREATE INDEX idx_hotel_weekly_tasks_hotel ON hotel_weekly_tasks(hotel_id, semana_inicio);

ALTER TABLE hotel_weekly_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_weekly_tasks_owner" ON hotel_weekly_tasks
  FOR ALL USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- 3. HOTEL_EXECUTION_LOG (Log de acoes do hotel)
CREATE TABLE IF NOT EXISTS hotel_execution_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  acao VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL
    CHECK (categoria IN ('conteudo','engajamento','planejamento','analise','perfil','campanha','missao')),
  detalhes JSONB DEFAULT '{}'::JSONB,
  pontos INT DEFAULT 1
);

CREATE INDEX idx_hotel_exec_log_hotel ON hotel_execution_log(hotel_id, created_at DESC);

ALTER TABLE hotel_execution_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_execution_log_owner" ON hotel_execution_log
  FOR ALL USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- 4. HOTEL_CONTENT_HISTORY (Anti-repeticao — registra conteudo usado)
CREATE TABLE IF NOT EXISTS hotel_content_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  content_type VARCHAR(30) NOT NULL
    CHECK (content_type IN ('hook','legenda','hashtag','benchmark','campanha')),
  content_id UUID NOT NULL,
  usado_em DATE DEFAULT CURRENT_DATE,

  UNIQUE(hotel_id, content_type, content_id)
);

CREATE INDEX idx_hotel_content_hist_hotel ON hotel_content_history(hotel_id, content_type);

ALTER TABLE hotel_content_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_content_history_owner" ON hotel_content_history
  FOR ALL USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- 5. HOTEL_POST_IDEAS_GENERATED (Ideias geradas pelo sistema)
CREATE TABLE IF NOT EXISTS hotel_post_ideas_generated (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  hook_id UUID,
  benchmark_id UUID,
  hashtag_combo_id UUID,
  tema VARCHAR(50),
  formato VARCHAR(30),
  data_sugerida DATE,
  aceita BOOLEAN DEFAULT FALSE,
  descartada BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_hotel_ideas_hotel ON hotel_post_ideas_generated(hotel_id, created_at DESC);

ALTER TABLE hotel_post_ideas_generated ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_post_ideas_owner" ON hotel_post_ideas_generated
  FOR ALL USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- 6. CAMPAIGN_HOTEL_STATUS (Inscricao em campanhas)
CREATE TABLE IF NOT EXISTS campaign_hotel_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  campanha_id UUID REFERENCES campanhas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  status VARCHAR(30) DEFAULT 'inscrito'
    CHECK (status IN ('inscrito','em_andamento','concluida','ignorada')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progresso INT DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  notas TEXT,

  UNIQUE(hotel_id, campanha_id)
);

CREATE INDEX idx_campaign_hotel_status ON campaign_hotel_status(hotel_id, campanha_id);

ALTER TABLE campaign_hotel_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_hotel_status_owner" ON campaign_hotel_status
  FOR ALL USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
