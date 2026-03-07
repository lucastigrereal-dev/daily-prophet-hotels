-- ============================================================
-- DAILY PROPHET HOTELS — MIGRATION SPRINT 2
-- Gamificacao, Missoes, Campanhas, Playbooks, Freemium
-- Execute no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. MISSOES
-- ============================================================
CREATE TABLE IF NOT EXISTS hotel_missoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN (
    'baixa_temporada', 'dependencia_ota', 'whatsapp_fraco',
    'nota_estagnada', 'quarto_ocioso', 'campanha_ferias',
    'prova_social', 'perfil_travado', 'calendario_mensal',
    'reativacao_hospedes', 'meio_semana', 'feriado'
  )),
  titulo TEXT NOT NULL,
  descricao TEXT,
  objetivo TEXT,
  status TEXT DEFAULT 'nao_iniciada' CHECK (status IN (
    'nao_iniciada', 'em_andamento', 'concluida', 'pausada'
  )),
  progresso INT DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  score_execucao INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotel_missoes_hotel ON hotel_missoes(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_missoes_status ON hotel_missoes(status);

-- ============================================================
-- 2. TAREFAS DA MISSAO
-- ============================================================
CREATE TABLE IF NOT EXISTS hotel_missao_tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  missao_id UUID REFERENCES hotel_missoes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT, -- 'post', 'story', 'reel', 'whatsapp', 'checklist', 'campanha'
  ordem INT,
  obrigatoria BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'em_andamento', 'concluida', 'pulada'
  )),
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. GAMIFICACAO
-- ============================================================
CREATE TABLE IF NOT EXISTS hotel_gamificacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  nivel TEXT DEFAULT 'travado' CHECK (nivel IN (
    'travado', 'organizado', 'ativo', 'estrategico', 'dominando'
  )),
  score_conteudo INT DEFAULT 0,
  score_execucao INT DEFAULT 0,
  score_sazonalidade INT DEFAULT 0,
  score_total INT DEFAULT 0,
  missoes_concluidas INT DEFAULT 0,
  dias_consecutivos INT DEFAULT 0,
  desbloqueios JSONB DEFAULT '[]',
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. DESBLOQUEIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS hotel_desbloqueios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'benchmark_premium', 'campanha_extra', 'pacote_stories', etc.
  nome TEXT NOT NULL,
  descricao TEXT,
  gatilho TEXT, -- 'onboarding_completo', 'missao_1_concluida', 'calendario_7d', etc.
  desbloqueado BOOLEAN DEFAULT FALSE,
  desbloqueado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. CAMPANHAS
-- ============================================================
CREATE TABLE IF NOT EXISTS campanhas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  tipo TEXT, -- 'ferias_julho', 'baixa_temporada', 'dia_maes', 'carnaval', etc.
  objetivo TEXT,
  publico TEXT,
  tipo_hotel TEXT[],
  antecedencia_dias INT,
  data_inicio DATE,
  data_fim DATE,
  formatos_sugeridos TEXT[],
  cta_principal TEXT,
  descricao TEXT,
  checklist JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campanhas_data ON campanhas(data_inicio);

-- ============================================================
-- 6. PLAYBOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  dor_principal TEXT,
  gatilho_ativacao TEXT,
  objetivo TEXT,
  checklist JSONB,
  scripts JSONB,
  benchmarks_ids UUID[],
  conteudos_recomendados JSONB,
  duracao_dias INT,
  dificuldade TEXT CHECK (dificuldade IN ('facil', 'medio', 'avancado')),
  metricas_acompanhamento JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. IMPRESSOES DE INSTAGRAM (onboarding)
-- ============================================================
CREATE TABLE IF NOT EXISTS hotel_instagram_prints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  tipo_print TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. SUBSCRIPTIONS (Freemium)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'pro', 'agency')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'trial', 'pausado', 'cancelado')),
  max_hoteis INT DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================================
-- 9. RLS POLICIES (tabelas filhas sem policies definidas)
-- ============================================================

-- hotel_estruturas
ALTER TABLE hotel_estruturas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_estruturas_select" ON hotel_estruturas;
DROP POLICY IF EXISTS "hotel_estruturas_insert" ON hotel_estruturas;
CREATE POLICY "hotel_estruturas_select" ON hotel_estruturas
  FOR SELECT USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
CREATE POLICY "hotel_estruturas_insert" ON hotel_estruturas
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- hotel_publico
ALTER TABLE hotel_publico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_publico_select" ON hotel_publico;
DROP POLICY IF EXISTS "hotel_publico_insert" ON hotel_publico;
CREATE POLICY "hotel_publico_select" ON hotel_publico
  FOR SELECT USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
CREATE POLICY "hotel_publico_insert" ON hotel_publico
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- hotel_digital
ALTER TABLE hotel_digital ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_digital_select" ON hotel_digital;
DROP POLICY IF EXISTS "hotel_digital_insert" ON hotel_digital;
CREATE POLICY "hotel_digital_select" ON hotel_digital
  FOR SELECT USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
CREATE POLICY "hotel_digital_insert" ON hotel_digital
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- hotel_posicionamento
ALTER TABLE hotel_posicionamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_posicionamento_select" ON hotel_posicionamento;
DROP POLICY IF EXISTS "hotel_posicionamento_insert" ON hotel_posicionamento;
CREATE POLICY "hotel_posicionamento_select" ON hotel_posicionamento
  FOR SELECT USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
CREATE POLICY "hotel_posicionamento_insert" ON hotel_posicionamento
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- hotel_metas
ALTER TABLE hotel_metas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_metas_select" ON hotel_metas;
DROP POLICY IF EXISTS "hotel_metas_insert" ON hotel_metas;
CREATE POLICY "hotel_metas_select" ON hotel_metas
  FOR SELECT USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
CREATE POLICY "hotel_metas_insert" ON hotel_metas
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- onboarding_respostas
ALTER TABLE onboarding_respostas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "onboarding_respostas_select" ON onboarding_respostas;
DROP POLICY IF EXISTS "onboarding_respostas_insert" ON onboarding_respostas;
DROP POLICY IF EXISTS "onboarding_respostas_upsert" ON onboarding_respostas;
CREATE POLICY "onboarding_respostas_select" ON onboarding_respostas
  FOR SELECT USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
CREATE POLICY "onboarding_respostas_insert" ON onboarding_respostas
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );
CREATE POLICY "onboarding_respostas_upsert" ON onboarding_respostas
  FOR UPDATE USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );

-- novas tabelas
ALTER TABLE hotel_missoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_missoes_all" ON hotel_missoes
  FOR ALL USING (hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid()));

ALTER TABLE hotel_gamificacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_gamificacao_all" ON hotel_gamificacao
  FOR ALL USING (hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid()));

ALTER TABLE hotel_desbloqueios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_desbloqueios_all" ON hotel_desbloqueios
  FOR ALL USING (hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid()));

ALTER TABLE hotel_instagram_prints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotel_instagram_prints_all" ON hotel_instagram_prints
  FOR ALL USING (hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid()));

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own" ON subscriptions
  FOR ALL USING (owner_id = auth.uid());

-- ============================================================
-- 10. SEED: 12 Playbooks iniciais
-- ============================================================
INSERT INTO playbooks (nome, dor_principal, objetivo, duracao_dias, dificuldade, ativo) VALUES
  ('Reserva Direta: Adeus OTA', 'dependencia_ota', 'Reduzir comissao de OTA em 20% em 60 dias', 60, 'medio', true),
  ('Calendário Editorial Básico', 'falta_consistencia', 'Publicar 3x por semana por 30 dias', 30, 'facil', true),
  ('Coleta de Depoimentos', 'falta_prova_social', '10 depoimentos em video ou print', 14, 'facil', true),
  ('Bio e Perfil Profissional', 'perfil_fraco', 'Perfil que converte visitante em seguidor', 7, 'facil', true),
  ('Campanha Baixa Temporada', 'baixa_ocupacao', 'Aumentar ocupacao 15% no periodo fraco', 21, 'medio', true),
  ('Reativacao de Hospedes', 'cliente_sumido', '5 reservas de retorno via WhatsApp + Instagram', 21, 'medio', true),
  ('Meios de Semana', 'quarto_ocioso', 'Ocupacao Ter-Qua acima de 50%', 14, 'facil', true),
  ('Campanha Feriado Proximo', 'feriado_vazio', 'Lotacao total no proximo feriado', 10, 'facil', true),
  ('Instagram para Corporativo', 'dependencia_lazer', 'Captar hospedes de negocios via IG', 30, 'medio', true),
  ('Pacote Romantico', 'publico_restrito', 'Atrair casais com pacotes de experiencia', 21, 'facil', true),
  ('Lancamento Novo Produto', 'produto_sem_visibilidade', 'Gerar 50+ reservas para nova acomodacao', 14, 'medio', true),
  ('Estrategia de Reels', 'baixo_alcance', 'Dobrar alcance organico em 30 dias com Reels', 30, 'avancado', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. SEED: Campanhas sazonais 2026
-- ============================================================
INSERT INTO campanhas (nome, tipo, objetivo, antecedencia_dias, data_inicio, data_fim, formatos_sugeridos, cta_principal, ativo) VALUES
  ('Pascoa 2026', 'feriado', 'Lotacao total no feriado', 14, '2026-04-02', '2026-04-05', ARRAY['reel','story','carrossel'], 'Reserve agora com desconto de Pascoa', true),
  ('Dia das Maes 2026', 'data_comemorativa', 'Pacotes romanticos e familiares', 21, '2026-05-10', '2026-05-11', ARRAY['reel','story'], 'Presente que ela vai amar', true),
  ('Dia dos Namorados 2026', 'data_comemorativa', 'Pacotes romanticos para casais', 21, '2026-06-12', '2026-06-14', ARRAY['reel','story','carrossel'], 'A noite perfeita para voces dois', true),
  ('Ferias de Julho 2026', 'ferias_escolares', 'Ocupacao maxima nas ferias', 30, '2026-07-01', '2026-07-31', ARRAY['reel','carrossel','story'], 'Julho ja tem data — garanta o seu', true),
  ('Dia dos Pais 2026', 'data_comemorativa', 'Pacotes para pais e familias', 21, '2026-08-09', '2026-08-10', ARRAY['reel','story'], 'O melhor presente pra ele', true),
  ('Baixa Temporada Maio-Junho', 'baixa_temporada', 'Aumentar ocupacao no periodo fraco', 7, '2026-05-15', '2026-06-30', ARRAY['post','story'], 'Preco especial so para quem reservar agora', true),
  ('Setembro de Lazer', 'baixa_temporada', 'Outubro de Roses — periodo dourado', 14, '2026-09-01', '2026-09-30', ARRAY['reel','carrossel'], 'Setembro e tempo de viajar', true),
  ('Dia das Criancas 2026', 'data_comemorativa', 'Pacotes familia com criancas', 14, '2026-10-12', '2026-10-12', ARRAY['reel','carrossel','story'], 'Eles merecem essa viagem', true),
  ('Finados e Feriado Nov', 'feriado', 'Aproveitar feriado prolongado', 14, '2026-11-02', '2026-11-04', ARRAY['story','post'], 'Feriado prolongado — aproveite!', true),
  ('Black Friday Hospedagem', 'promocao', 'Reservas antecipadas com desconto', 7, '2026-11-27', '2026-11-27', ARRAY['story','carrossel','reel'], 'Black Friday: desconto real na diaria', true),
  ('Natal e Reveillon 2026', 'feriado', 'Pacotes de fim de ano completos', 45, '2026-12-24', '2027-01-01', ARRAY['reel','carrossel','story'], 'Natal e Ano Novo do jeito certo', true),
  ('Carnaval 2027', 'feriado', 'Ocupacao maxima no carnaval', 30, '2027-02-13', '2027-02-16', ARRAY['reel','story'], 'Carnaval ja esgotando — garanta o seu', true)
ON CONFLICT DO NOTHING;
