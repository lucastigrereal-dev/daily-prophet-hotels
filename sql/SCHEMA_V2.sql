-- ============================================================
-- DAILY PROPHET HOTELS — SCHEMA V2 DEFINITIVO
-- Alinhado com documento de arquitetura
-- 18 tabelas | Multi-tenant | RLS | Functions | Views
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS (Sistema multi-usuário)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome_completo VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'hotel_owner'
    CHECK (role IN ('admin','comercial','hotel_owner','assistente')),
  hotel_ids UUID[],
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  idioma VARCHAR(10) DEFAULT 'pt-BR',
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMPTZ
);

-- ============================================================
-- 2. HOTELS (Cadastro base + CRM)
-- ============================================================
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES users(id),

  -- Identificação
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL
    CHECK (tipo IN ('resort','pousada','boutique','fazenda','urbano','hostel','eco_resort','glamping','apart_hotel')),
  classificacao INT CHECK (classificacao BETWEEN 2 AND 5),

  -- Localização
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  regiao VARCHAR(50),
  endereco_completo TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Operação
  tempo_operacao INT,
  numero_quartos INT,
  taxa_ocupacao_media DECIMAL(5,2),
  ticket_medio_diaria DECIMAL(10,2),

  -- Digital
  instagram VARCHAR(100),
  facebook VARCHAR(255),
  tiktok VARCHAR(100),
  youtube VARCHAR(255),
  site VARCHAR(255),
  email_comercial VARCHAR(255),
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),

  -- Status CRM
  status VARCHAR(20) DEFAULT 'lead'
    CHECK (status IN ('lead','onboarding','ativo','pausado','cancelado')),
  plano VARCHAR(50),
  valor_mensalidade DECIMAL(10,2),
  data_inicio_contrato DATE,
  origem_lead VARCHAR(100),
  responsavel_comercial UUID REFERENCES users(id),
  observacoes TEXT,

  -- Onboarding
  onboarding_completo BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_hotels_cidade ON hotels(cidade);
CREATE INDEX idx_hotels_tipo ON hotels(tipo);
CREATE INDEX idx_hotels_status ON hotels(status);
CREATE INDEX idx_hotels_owner ON hotels(owner_id);

-- ============================================================
-- 3. HOTEL_ESTRUTURAS (Infraestrutura física — 70+ booleans)
-- ============================================================
CREATE TABLE hotel_estruturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Piscinas
  tem_piscina_adulto_descoberta BOOLEAN DEFAULT FALSE,
  tem_piscina_adulto_coberta BOOLEAN DEFAULT FALSE,
  tem_piscina_infantil BOOLEAN DEFAULT FALSE,
  tem_piscina_aquecida BOOLEAN DEFAULT FALSE,
  tem_tobogua BOOLEAN DEFAULT FALSE,
  tem_borda_infinita BOOLEAN DEFAULT FALSE,
  tem_bar_molhado BOOLEAN DEFAULT FALSE,
  tem_piscina_termal BOOLEAN DEFAULT FALSE,
  tem_hidromassagem BOOLEAN DEFAULT FALSE,
  tem_piscina_semiolimpica BOOLEAN DEFAULT FALSE,
  tem_praia_artificial BOOLEAN DEFAULT FALSE,

  -- Alimentação
  cafe_incluso BOOLEAN DEFAULT FALSE,
  tipo_cafe VARCHAR(50),
  tem_restaurante BOOLEAN DEFAULT FALSE,
  tem_room_service BOOLEAN DEFAULT FALSE,
  tem_bar BOOLEAN DEFAULT FALSE,
  tem_lanchonete BOOLEAN DEFAULT FALSE,
  tem_area_gourmet BOOLEAN DEFAULT FALSE,
  tem_cozinha_compartilhada BOOLEAN DEFAULT FALSE,
  tem_frigobar BOOLEAN DEFAULT FALSE,
  all_inclusive BOOLEAN DEFAULT FALSE,

  -- Lazer Infantil
  tem_playground BOOLEAN DEFAULT FALSE,
  tem_brinquedoteca BOOLEAN DEFAULT FALSE,
  tem_kids_club_monitores BOOLEAN DEFAULT FALSE,
  tem_recreacao BOOLEAN DEFAULT FALSE,
  tem_espaco_teen BOOLEAN DEFAULT FALSE,
  tem_cama_elastica BOOLEAN DEFAULT FALSE,

  -- Esportes / Bem-estar
  tem_academia BOOLEAN DEFAULT FALSE,
  tem_spa BOOLEAN DEFAULT FALSE,
  tem_sauna BOOLEAN DEFAULT FALSE,
  tem_quadra_tenis BOOLEAN DEFAULT FALSE,
  tem_quadra_poliesportiva BOOLEAN DEFAULT FALSE,
  tem_campo_futebol BOOLEAN DEFAULT FALSE,
  tem_trilhas BOOLEAN DEFAULT FALSE,
  tem_yoga BOOLEAN DEFAULT FALSE,
  tem_beach_tennis BOOLEAN DEFAULT FALSE,
  tem_stand_up_paddle BOOLEAN DEFAULT FALSE,

  -- Corporativo
  tem_sala_reuniao BOOLEAN DEFAULT FALSE,
  tem_auditorio BOOLEAN DEFAULT FALSE,
  tem_wifi_alta_velocidade BOOLEAN DEFAULT FALSE,
  tem_coworking BOOLEAN DEFAULT FALSE,

  -- Outros
  tem_estacionamento BOOLEAN DEFAULT FALSE,
  estacionamento_gratuito BOOLEAN DEFAULT FALSE,
  tem_transfer BOOLEAN DEFAULT FALSE,
  pet_friendly BOOLEAN DEFAULT FALSE,
  tem_acessibilidade BOOLEAN DEFAULT FALSE,
  tem_elevador BOOLEAN DEFAULT FALSE,

  -- Sustentabilidade
  tem_energia_solar BOOLEAN DEFAULT FALSE,
  tem_captacao_agua_chuva BOOLEAN DEFAULT FALSE,
  tem_programa_reciclagem BOOLEAN DEFAULT FALSE,
  tem_horta_organica BOOLEAN DEFAULT FALSE,

  -- Natureza / Localização
  proximo_praia BOOLEAN DEFAULT FALSE,
  beira_mar BOOLEAN DEFAULT FALSE,
  vista_montanhas BOOLEAN DEFAULT FALSE,
  tem_cachoeira BOOLEAN DEFAULT FALSE,
  tem_lago BOOLEAN DEFAULT FALSE,

  diferencial_unico TEXT
);

-- ============================================================
-- 4. HOTEL_PUBLICO (Segmentação detalhada)
-- ============================================================
CREATE TABLE hotel_publico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Público (booleans)
  familias_criancas_0_6 BOOLEAN DEFAULT FALSE,
  familias_criancas_7_12 BOOLEAN DEFAULT FALSE,
  familias_adolescentes BOOLEAN DEFAULT FALSE,
  casais_jovens BOOLEAN DEFAULT FALSE,
  casais_maduros BOOLEAN DEFAULT FALSE,
  casais_lua_mel BOOLEAN DEFAULT FALSE,
  grupos_amigos BOOLEAN DEFAULT FALSE,
  viajantes_solo BOOLEAN DEFAULT FALSE,
  executivos_negocios BOOLEAN DEFAULT FALSE,
  terceira_idade BOOLEAN DEFAULT FALSE,

  -- Origem geográfica (%)
  origem_local INT,
  origem_regiao INT,
  origem_estado INT,
  origem_outros_estados INT,
  origem_estrangeiros INT,
  principais_cidades_origem TEXT[],

  -- Motivação (%)
  motivo_lazer_ferias INT,
  motivo_fim_semana INT,
  motivo_comemoracao INT,
  motivo_negocios INT,
  motivo_aventura INT,
  motivo_termas INT,

  -- Sazonalidade
  estacao_mais_movimentada VARCHAR(50),
  meses_alta_temporada VARCHAR(100),

  -- Como descobrem (%)
  encontra_instagram INT,
  encontra_google INT,
  encontra_booking INT,
  encontra_indicacao INT,
  encontra_anuncios INT,
  encontra_agencias INT
);

-- ============================================================
-- 5. HOTEL_DIGITAL (Presença online completa)
-- ============================================================
CREATE TABLE hotel_digital (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Instagram
  instagram_handle VARCHAR(100),
  instagram_seguidores INT,
  instagram_posts_semana INT,
  instagram_quem_posta VARCHAR(100),
  instagram_engajamento_medio DECIMAL(5,2),

  -- Facebook
  facebook_url VARCHAR(255),
  facebook_curtidas INT,

  -- TikTok
  tiktok_handle VARCHAR(100),
  tiktok_seguidores INT,

  -- YouTube
  youtube_canal VARCHAR(255),
  youtube_inscritos INT,

  -- Site
  tem_site BOOLEAN DEFAULT FALSE,
  site_url VARCHAR(255),
  site_permite_reserva BOOLEAN DEFAULT FALSE,

  -- Google
  google_business_avaliacao DECIMAL(3,2),
  google_business_num_reviews INT,

  -- OTAs
  booking_nota DECIMAL(3,2),
  booking_num_avaliacoes INT,
  airbnb_nota DECIMAL(3,2),
  tripadvisor_nota DECIMAL(3,2),
  tripadvisor_num_avaliacoes INT,
  tripadvisor_ranking_cidade INT,
  decolar_nota DECIMAL(3,2),

  -- Estratégia
  investimento_trafego_pago DECIMAL(10,2),
  problema_atual_redes TEXT
);

-- ============================================================
-- 6. HOTEL_POSICIONAMENTO (Como quer ser visto)
-- ============================================================
CREATE TABLE hotel_posicionamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Posicionamento (múltipla escolha)
  posicionamento_luxuoso BOOLEAN DEFAULT FALSE,
  posicionamento_custo_beneficio BOOLEAN DEFAULT FALSE,
  posicionamento_familia BOOLEAN DEFAULT FALSE,
  posicionamento_romantico BOOLEAN DEFAULT FALSE,
  posicionamento_aventureiro BOOLEAN DEFAULT FALSE,
  posicionamento_aconchegante BOOLEAN DEFAULT FALSE,
  posicionamento_exclusivo BOOLEAN DEFAULT FALSE,
  posicionamento_sustentavel BOOLEAN DEFAULT FALSE,

  -- Concorrência
  concorrente_direto VARCHAR(255),
  diferencial_vs_concorrente TEXT,

  -- Cases
  case_sucesso_marcante TEXT,
  hospede_famoso_influencer TEXT,
  prato_estrela TEXT,
  momento_uau TEXT,
  se_pudesse_mudar_1_coisa TEXT
);

-- ============================================================
-- 7. HOTEL_METAS (Objetivos)
-- ============================================================
CREATE TABLE hotel_metas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  meta_principal VARCHAR(100),
  meta_crescimento_12m VARCHAR(50),
  investimento_mensal_marketing DECIMAL(10,2),
  faixa_investimento VARCHAR(50),
  principal_dor_hoje TEXT,
  se_daily_prophet_resolvesse TEXT
);

-- ============================================================
-- 8. ONBOARDING_RESPOSTAS (JSONB flexível)
-- ============================================================
CREATE TABLE onboarding_respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completado BOOLEAN DEFAULT FALSE,
  respostas JSONB NOT NULL DEFAULT '{}',
  progresso_percent INT DEFAULT 0,
  ultima_secao_completada INT,
  tempo_total_preenchimento_minutos INT
);

-- ============================================================
-- 9. HOOKS (1.000 hooks categorizados)
-- ============================================================
CREATE TABLE hooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero INT NOT NULL,
  publico VARCHAR(20) NOT NULL
    CHECK (publico IN ('familia','casais','solo','corporativo','misto')),
  intencao VARCHAR(20) NOT NULL
    CHECK (intencao IN ('desejo','curiosidade','identificacao','urgencia','autoridade','prova_social')),
  tema VARCHAR(50) NOT NULL,
  hook TEXT NOT NULL
);

CREATE INDEX idx_hooks_publico ON hooks(publico);
CREATE INDEX idx_hooks_intencao ON hooks(intencao);
CREATE INDEX idx_hooks_tema ON hooks(tema);

-- ============================================================
-- 10. BENCHMARKS_POSTS (2.080+ legendas prontas — nível POST)
-- ============================================================
CREATE TABLE benchmarks_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Origem
  hotel_origem VARCHAR(255),
  instagram_origem VARCHAR(100),
  categoria_hotel VARCHAR(50),
  biblioteca_origem VARCHAR(50),

  -- Classificação
  numero_legenda INT,
  formato VARCHAR(50)
    CHECK (formato IN ('foto','carrossel','reel','story','video')),
  publico VARCHAR(20),
  intencao VARCHAR(30),
  tema VARCHAR(100),

  -- Copy
  hook TEXT,
  legenda_completa TEXT NOT NULL,
  cta TEXT,
  hashtags TEXT[],

  -- Visual
  descricao_visual TEXT,

  -- Reel (se aplicável)
  roteiro_reel JSONB,
  duracao_segundos INT,

  -- Contexto
  melhor_horario VARCHAR(50),
  estrutura_necessaria TEXT[],
  engagement_esperado DECIMAL(5,2),
  nota_adaptacao TEXT,

  -- Metadados
  qualidade_score INT CHECK (qualidade_score BETWEEN 1 AND 10),
  ativo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_benchmarks_tema ON benchmarks_posts(tema);
CREATE INDEX idx_benchmarks_formato ON benchmarks_posts(formato);
CREATE INDEX idx_benchmarks_publico ON benchmarks_posts(publico);
CREATE INDEX idx_benchmarks_categoria ON benchmarks_posts(categoria_hotel);
CREATE INDEX idx_benchmarks_biblioteca ON benchmarks_posts(biblioteca_origem);

-- ============================================================
-- 11. HASHTAG_COMBOS (Combos prontos)
-- ============================================================
CREATE TABLE hashtag_combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  nicho VARCHAR(100),
  regiao VARCHAR(50),
  tipo_hotel VARCHAR(50),
  hashtags TEXT[] NOT NULL,
  amplas TEXT[],
  medias TEXT[],
  nicho_pequenas TEXT[],
  engajamento_medio DECIMAL(5,2),
  ativo BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 12. CAPTION_TEMPLATES (Frameworks de legenda)
-- ============================================================
CREATE TABLE caption_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  estrutura VARCHAR(50),
  objetivo VARCHAR(50),
  template_hook TEXT,
  template_legenda TEXT,
  template_cta TEXT,
  placeholders TEXT[],
  instrucoes TEXT,
  exemplo_preenchido TEXT,
  performance_media VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 13. KNOWLEDGE_BASE (Guia operacional)
-- ============================================================
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  categoria VARCHAR(50) NOT NULL,
  subcategoria VARCHAR(100),
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  fonte VARCHAR(255),
  relevancia INT DEFAULT 5 CHECK (relevancia BETWEEN 1 AND 10),
  ativo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_knowledge_categoria ON knowledge_base(categoria);

-- ============================================================
-- 14. CALENDARIOS_GERADOS (Posts por hotel)
-- ============================================================
CREATE TABLE calendarios_gerados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Agendamento
  data_post DATE NOT NULL,
  horario_sugerido TIME,
  dia_semana VARCHAR(20),

  -- Tipo
  tipo VARCHAR(50) CHECK (tipo IN ('feed','story','reel')),
  categoria VARCHAR(100),
  objetivo VARCHAR(50),
  tema_especifico VARCHAR(255),

  -- Copy
  hook TEXT,
  legenda_completa TEXT,
  cta TEXT,
  hashtags TEXT[],

  -- Visual
  descricao_visual_sugerida TEXT,
  formato VARCHAR(50),

  -- Origem
  baseado_em_benchmark_id UUID REFERENCES benchmarks_posts(id),
  personalizado BOOLEAN DEFAULT TRUE,

  -- Status
  status VARCHAR(50) DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','agendado','aprovado','publicado','reprovado','expirado')),
  aprovado_em TIMESTAMPTZ,
  publicado_em TIMESTAMPTZ,
  url_publicacao VARCHAR(500),

  -- Performance pós-publicação
  likes_real INT,
  comentarios_real INT,
  alcance_real INT,
  saves_real INT,

  -- Campanha
  mes_campanha VARCHAR(20),
  semana_mes INT,
  e_sazonal BOOLEAN DEFAULT FALSE,
  tag_campanha VARCHAR(100),

  observacoes TEXT
);

CREATE INDEX idx_cal_hotel ON calendarios_gerados(hotel_id);
CREATE INDEX idx_cal_data ON calendarios_gerados(data_post);
CREATE INDEX idx_cal_status ON calendarios_gerados(status);

-- ============================================================
-- 15. INSTAGRAM_ANALYSIS (Análise do perfil)
-- ============================================================
CREATE TABLE instagram_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  total_posts INT,
  total_seguidores INT,
  media_likes DECIMAL(10,2),
  media_comentarios DECIMAL(10,2),
  taxa_engajamento DECIMAL(5,2),

  temas_recorrentes JSONB,
  formatos_usados JSONB,
  tom_comunicacao VARCHAR(50),
  top_hashtags TEXT[],

  melhor_horario_post TIME,
  melhor_dia_semana VARCHAR(20),
  publico_detectado TEXT[],
  frequencia_posts_semana INT,

  gaps JSONB,
  recomendacoes TEXT[],
  analise_completa BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- 16. COLLABS (Parcerias)
-- ============================================================
CREATE TABLE collabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  tipo_pacote VARCHAR(50),
  valor_mensal DECIMAL(10,2),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status VARCHAR(50) DEFAULT 'ativo'
    CHECK (status IN ('ativo','pausado','cancelado','pendente_aprovacao')),

  perfis_instagram TEXT[],
  posts_mes_contratados INT,
  stories_semana_contratados INT,
  posts_realizados_mes_atual INT DEFAULT 0,

  -- Pagamento
  dia_vencimento INT,
  forma_pagamento VARCHAR(50),
  ultimo_pagamento_em DATE,
  proximo_pagamento_em DATE,
  status_pagamento VARCHAR(50) DEFAULT 'em_dia'
    CHECK (status_pagamento IN ('em_dia','pendente','atrasado')),

  -- Contato
  responsavel_hotel_nome VARCHAR(255),
  responsavel_hotel_whatsapp VARCHAR(20),

  -- Performance
  total_alcance_mes INT,
  crescimento_seguidores_hotel INT,

  observacoes TEXT,
  motivo_cancelamento TEXT
);

CREATE INDEX idx_collabs_status ON collabs(status);
CREATE INDEX idx_collabs_pagamento ON collabs(proximo_pagamento_em);

-- ============================================================
-- 17. PORTFOLIO_PROFILES (6 perfis)
-- ============================================================
CREATE TABLE portfolio_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  handle VARCHAR(100) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  seguidores INT NOT NULL,
  nicho VARCHAR(100),
  quando_usar TEXT,
  cor VARCHAR(7)
);

-- ============================================================
-- 18. ACTIVITY_LOG (Auditoria)
-- ============================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  acao VARCHAR(100) NOT NULL,
  entidade_tipo VARCHAR(50),
  entidade_id UUID,
  detalhes JSONB
);

CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hotels_updated BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_digital_updated BEFORE UPDATE ON hotel_digital
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_collabs_updated BEFORE UPDATE ON collabs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Check onboarding complete
CREATE OR REPLACE FUNCTION check_onboarding_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completado = TRUE AND NEW.progresso_percent = 100 THEN
    UPDATE hotels SET onboarding_completo = TRUE WHERE id = NEW.hotel_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_onboarding_check AFTER UPDATE ON onboarding_respostas
  FOR EACH ROW EXECUTE FUNCTION check_onboarding_complete();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW v_hotels_completo AS
SELECT
  h.*,
  hd.instagram_handle, hd.instagram_seguidores, hd.instagram_engajamento_medio,
  hd.google_business_avaliacao, hd.booking_nota, hd.tripadvisor_nota,
  hp.familias_criancas_0_6, hp.casais_jovens, hp.casais_lua_mel,
  hpos.momento_uau, hpos.prato_estrela,
  hm.meta_principal, hm.principal_dor_hoje,
  o.progresso_percent AS onboarding_progresso
FROM hotels h
LEFT JOIN hotel_digital hd ON h.id = hd.hotel_id
LEFT JOIN hotel_publico hp ON h.id = hp.hotel_id
LEFT JOIN hotel_posicionamento hpos ON h.id = hpos.hotel_id
LEFT JOIN hotel_metas hm ON h.id = hm.hotel_id
LEFT JOIN onboarding_respostas o ON h.id = o.hotel_id;

CREATE VIEW v_collabs_ativas AS
SELECT
  c.*, h.nome AS hotel_nome, h.cidade, h.estado, h.instagram,
  hd.instagram_seguidores
FROM collabs c
JOIN hotels h ON c.hotel_id = h.id
LEFT JOIN hotel_digital hd ON h.id = hd.hotel_id
WHERE c.status = 'ativo';

CREATE VIEW v_calendario_mes AS
SELECT
  cg.*, h.nome AS hotel_nome, h.instagram
FROM calendarios_gerados cg
JOIN hotels h ON cg.hotel_id = h.id
WHERE DATE_TRUNC('month', cg.data_post) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY cg.data_post, cg.horario_sugerido;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_estruturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_publico ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_digital ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_posicionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendarios_gerados ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE collabs ENABLE ROW LEVEL SECURITY;

-- Hotel owner vê seus próprios hotéis
CREATE POLICY hotel_owner_select ON hotels FOR SELECT
  USING (owner_id = auth.uid());
CREATE POLICY hotel_owner_all ON hotels FOR ALL
  USING (owner_id = auth.uid());

-- Tabelas de conhecimento: leitura pública
ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY hooks_read ON hooks FOR SELECT TO authenticated USING (true);

ALTER TABLE benchmarks_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY benchmarks_read ON benchmarks_posts FOR SELECT TO authenticated USING (true);

ALTER TABLE hashtag_combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY combos_read ON hashtag_combos FOR SELECT TO authenticated USING (true);

ALTER TABLE caption_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_read ON caption_templates FOR SELECT TO authenticated USING (true);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_read ON knowledge_base FOR SELECT TO authenticated USING (true);

ALTER TABLE portfolio_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY portfolio_read ON portfolio_profiles FOR SELECT TO authenticated USING (true);

-- ============================================================
-- SEED: Portfolio Profiles (estático)
-- ============================================================
INSERT INTO portfolio_profiles (handle, nome, seguidores, nicho, quando_usar, cor) VALUES
('@lucastigrereal', 'Lucas Tigre Real', 690000, 'Persona principal', 'Sempre - maior alcance, 85% família', '#d4a053'),
('@oinatalrn', 'O Natal RN', 630000, 'Natal/RN', 'Hotéis RN e Nordeste', '#3b82f6'),
('@agenteviajabrasil', 'A Gente Viaja Brasil', 440000, 'Viagens', 'Qualquer hotel, foco viagem', '#10b981'),
('@afamiliatigrereal', 'A Família Tigre Real', 320000, 'Família', 'Resorts, fazenda, parque aquático', '#f59e0b'),
('@oquecomeremnatal', 'O Que Comer em Natal', 220000, 'Gastronomia', 'Foco café/restaurante', '#ef4444'),
('@resolutes', 'Resolutes', 120000, 'Lifestyle', 'Boutique, urbano', '#8b5cf6');

-- ============================================================
-- SEED: Caption Templates (8 frameworks)
-- ============================================================
INSERT INTO caption_templates (nome, estrutura, objetivo, template_hook, template_legenda, template_cta, placeholders, instrucoes) VALUES
('Hook Pergunta → Lista → CTA', 'pergunta_lista', 'engajar',
 '[PERGUNTA que gera identificação]?',
 '[PERGUNTA]?\n\n✅ [Benefício 1]\n✅ [Benefício 2]\n✅ [Benefício 3]\n✅ [Benefício 4]\n\n📍 [HOTEL] — [CIDADE]/[ESTADO]',
 'Marca quem [AÇÃO SOCIAL]! 👇',
 ARRAY['HOTEL','CIDADE','ESTADO','PERGUNTA','BENEFICIOS','AÇÃO_SOCIAL'],
 'Ideal para posts de estrutura e experiências. A pergunta no hook gera 3x mais comentários.'),

('Frase Emocional → Cenário → CTA Suave', 'emocional', 'inspirar',
 '[FRASE EMOCIONAL curta e forte] ✨',
 '[FRASE EMOCIONAL].\n\n[Descrição sensorial do cenário em 2-3 linhas, usando detalhes que ativem visão, tato, olfato]\n\n📍 [HOTEL]\n🔗 Link na bio',
 'Salva pra quando precisar de uma pausa 💛',
 ARRAY['HOTEL','FRASE_EMOCIONAL','CENARIO'],
 'Funciona muito bem para pôr do sol, quartos e momentos de calma. Tom íntimo.'),

('Storytelling Curto → Revelação → CTA', 'storytelling', 'viralizar',
 '[INÍCIO de uma mini-história em 1 linha]',
 '[HISTÓRIA em 3-4 linhas com tensão ou curiosidade]\n\nO resultado? [REVELAÇÃO surpreendente ou emocional]\n\n📍 [HOTEL] — [CIDADE]',
 'Já viveu algo parecido? Conta aqui 👇',
 ARRAY['HOTEL','CIDADE','HISTORIA','REVELACAO'],
 'Ideal para depoimentos, bastidores e experiências de hóspedes.'),

('Dado/Número → Contexto → CTA', 'dado_numero', 'autoridade',
 '[NÚMERO impactante] [sobre o hotel/destino]',
 '[NÚMERO + contexto].\n\n[Explicação em 2-3 linhas do que esse número significa na prática para o hóspede]\n\n📍 [HOTEL]',
 'Salva esse dado pra planejar sua viagem 🔖',
 ARRAY['HOTEL','NUMERO','CONTEXTO'],
 'Funciona para reviews, prêmios, capacidade, anos de operação.'),

('Comparação → Benefício → CTA', 'comparacao', 'converter',
 'Tem [OPÇÃO COMUM], e tem [OPÇÃO HOTEL] 😏',
 'Tem [OPÇÃO COMUM].\nE tem [OPÇÃO HOTEL].\n\nA diferença? [BENEFÍCIO CLARO em 1-2 linhas]\n\n📍 [HOTEL] — [CIDADE]/[ESTADO]\n💬 Reserve: link na bio',
 'Qual você escolheria? Comenta! 👇',
 ARRAY['HOTEL','CIDADE','ESTADO','OPCAO_COMUM','OPCAO_HOTEL','BENEFICIO'],
 'Ótimo para destacar diferenciais vs concorrência ou vs rotina.'),

('Checklist / Roteiro → CTA de Save', 'checklist', 'educar',
 '[NÚMERO] coisas para [AÇÃO] em [DESTINO] 📋',
 '[TÍTULO]\n\n1️⃣ [Item 1]\n2️⃣ [Item 2]\n3️⃣ [Item 3]\n4️⃣ [Item 4]\n5️⃣ [Item 5]\n\n📍 Base: [HOTEL]\n🔗 Reservas no link da bio',
 'Salva pra não esquecer! 🔖',
 ARRAY['HOTEL','DESTINO','ITEMS'],
 'Ideal para carrosséis educativos. Gera MUITOS saves.'),

('UGC / Repost → Agradecimento → Convite', 'ugc', 'prova_social',
 'Quando os hóspedes registram assim... 📸❤️',
 'Quando os hóspedes registram assim, a gente sabe que tá no caminho certo 📸\n\n[CONTEXTO do repost ou depoimento]\n\nObrigado, @[HOSPEDE]! Vocês são demais 💛\n\n📍 [HOTEL]',
 'Marque o @ do hotel nas suas fotos e apareça aqui também! 📸',
 ARRAY['HOTEL','HOSPEDE','CONTEXTO'],
 'Repost de UGC gera 40-60% mais comentários. Sempre creditar o hóspede.'),

('Promoção → Urgência → CTA Direto', 'promocao', 'converter',
 '⚡ [OFERTA PRINCIPAL] — só até [DATA]',
 '⚡ [OFERTA]\n\n✅ [Inclusão 1]\n✅ [Inclusão 2]\n✅ [Inclusão 3]\n\n⏰ Válido até [DATA]\n📞 Reserve: [CANAL]\n\n⚠️ [ESCASSEZ: últimas X vagas / só para os primeiros X]',
 'Mande "QUERO" no DM que a gente explica tudo! 💬',
 ARRAY['HOTEL','OFERTA','DATA','INCLUSOES','CANAL','ESCASSEZ'],
 'Sempre incluir prazo + escassez. Promoção 45-60 dias antes vende 2x mais.');

-- FIM DO SCHEMA V2
