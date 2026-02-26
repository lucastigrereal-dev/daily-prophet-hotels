-- ============================================================
-- DAILY PROPHET HOTELS — SCHEMA V2.1 (EXPANSÃO)
-- Novas tabelas + seed das 20 features + calendário 3 meses
-- Rodar APÓS o SCHEMA_V2.sql
-- ============================================================

-- ============================================================
-- 19. FEATURES_ROADMAP (20 features priorizadas)
-- ============================================================
CREATE TABLE IF NOT EXISTS features_roadmap (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero INT NOT NULL,
  grupo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  dor TEXT NOT NULL,
  solucao TEXT NOT NULL,
  roi TEXT NOT NULL,
  fase INT NOT NULL CHECK (fase BETWEEN 1 AND 4),
  status VARCHAR(20) DEFAULT 'planejado'
    CHECK (status IN ('planejado','em_desenvolvimento','beta','ativo','descontinuado')),
  prioridade INT DEFAULT 5 CHECK (prioridade BETWEEN 1 AND 10),
  economia_mensal DECIMAL(10,2),
  aumento_receita_pct DECIMAL(5,2)
);

-- ============================================================
-- 20. BUSINESS_IDEAS (20 ideias de monetização)
-- ============================================================
CREATE TABLE IF NOT EXISTS business_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero INT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  conceito TEXT NOT NULL,
  modelo_receita JSONB,
  mrr_projetado DECIMAL(10,2),
  setup_price DECIMAL(10,2),
  ltv_12_meses DECIMAL(10,2),
  fase VARCHAR(20) DEFAULT 'ideia',
  prioridade INT DEFAULT 5
);

-- ============================================================
-- SEED: 20 Features com DOR→SOLUÇÃO→ROI
-- ============================================================
INSERT INTO features_roadmap (numero, grupo, nome, dor, solucao, roi, fase, status, prioridade, economia_mensal, aumento_receita_pct) VALUES

-- GRUPO 1: AUTOMAÇÃO DE VENDAS
(1, 'vendas', 'Auto-Responder DMs com IA',
 'Perco reservas porque demoro para responder DMs',
 'Resposta automática em 30seg + IA identifica intenção + envia link de reserva',
 'Taxa conversão DM→Reserva de 15% → 60% (+300%)', 1, 'planejado', 10, 8000, 300),

(2, 'vendas', 'Monitor de Promoções de Concorrentes',
 'Concorrente baixa preço e eu nem fico sabendo',
 'Alerta em 5min + sugere contra-ação + histórico de promoções',
 'Evita perda de 20-30% de reservas em períodos promocionais', 3, 'planejado', 8, NULL, 25),

(3, 'vendas', 'Gerador de Stories Profissionais',
 'Gasto R$ 500-1.500/mês com designer',
 '50+ templates prontos + logo automático + exporta em 30seg',
 'Economia de R$ 6.000-18.000/ano', 2, 'planejado', 7, 1500, NULL),

(4, 'vendas', 'Repost Automático de UGC',
 'Hóspedes postam fotos lindas mas nunca repost',
 'Detecta menções + pede permissão + reposta com créditos',
 '+60% engajamento (UGC tem 4x mais engajamento)', 2, 'planejado', 7, NULL, 60),

(5, 'vendas', 'Preditor de Melhor Horário (ML)',
 'Não sei quando minha audiência está online',
 'Machine Learning analisa 90 dias + prevê com 85% acurácia',
 '+40% engajamento apenas postando no horário certo', 1, 'ativo', 9, NULL, 40),

-- GRUPO 2: INTELIGÊNCIA COMPETITIVA
(6, 'inteligencia', 'Otimizador de Hashtags',
 'Uso hashtags genéricas que ninguém vê',
 'Mix ideal: 30% alta + 40% média + 30% baixa competição',
 '+35% alcance orgânico', 2, 'ativo', 8, NULL, 35),

(7, 'inteligencia', 'Detector de Seguidores Falsos',
 'Concorrente tem 50k mas será que são reais?',
 'IA detecta bots com 92% precisão + relatório comparativo',
 'Evita copiar estratégias de audiência falsa', 3, 'planejado', 5, NULL, NULL),

(8, 'inteligencia', 'Localizador de Micro-Influencers',
 'Quero parcerias mas não sei quem contratar',
 'Influencers 5-50k + eng >4% + audiência local',
 'Parcerias 10x mais baratas com conversão similar', 3, 'planejado', 6, NULL, NULL),

(9, 'inteligencia', 'Analisador de Sentimento',
 'Posso estar perdendo reclamações',
 'IA classifica positivo/negativo/urgente + alerta',
 'Responde reclamações 12x mais rápido', 4, 'planejado', 4, NULL, NULL),

(10, 'inteligencia', 'Preditor de Intenção de Reserva',
 'Não sei quais seguidores estão mais perto de reservar',
 'Score 0-100 baseado em interações (salvou, visitou, interagiu)',
 'Remarketing direcionado aumenta conversão 3x', 4, 'planejado', 6, NULL, 200),

-- GRUPO 3: PRODUTIVIDADE
(11, 'produtividade', 'Detector de Crise de Reputação',
 'Comentário negativo viraliza e descubro tarde',
 'Detecta crescimento anormal negativo + alerta SMS',
 'Contém crise em 4h vs 48h manual', 4, 'planejado', 5, NULL, NULL),

(12, 'produtividade', 'Voice-to-Caption (Áudio→Legenda)',
 'Perco 30min escrevendo cada legenda',
 'Grave 1min de áudio + IA transcreve + formata pro Instagram',
 '93% mais rápido (30min → 2min)', 1, 'planejado', 8, 750, NULL),

(13, 'produtividade', 'Teste A/B de Legendas',
 'Não sei qual legenda funciona melhor',
 'Testa nos Stories + republica vencedora no Feed',
 '+25% engajamento sempre usando melhor versão', 3, 'planejado', 6, NULL, 25),

(14, 'produtividade', 'Targeting de Seguidores de Concorrentes',
 'Concorrente tem audiência perfeita pra mim',
 'Lista quem curtiu últimos posts + engaja estrategicamente',
 'Crescimento orgânico 5x mais rápido', 3, 'planejado', 5, NULL, NULL),

(15, 'produtividade', 'Editor Automático de Vídeos/Reels',
 'Editor custa R$ 200/reel',
 'Upload bruto + IA corta + música + legendas + transições',
 'Economia R$ 2.400/mês + 2x mais alcance', 3, 'planejado', 7, 2400, NULL),

-- GRUPO 4: MAXIMIZAÇÃO DE RECEITA
(16, 'receita', 'Rastreador de Funil de Conversão',
 'Não sei quantas reservas vieram do Instagram',
 'UTM tracking + pixel + dashboard completo',
 'Descobre que Instagram gera 35% das reservas', 2, 'planejado', 9, NULL, NULL),

(17, 'receita', 'Planejador Sazonal Inteligente',
 'Esqueço datas comerciais importantes',
 '200+ datas + conteúdo automático 7 dias antes',
 'Aproveita 100% das oportunidades (vs 20%)', 1, 'ativo', 9, NULL, NULL),

(18, 'receita', 'Employee Advocacy (Funcionários postam)',
 'Tenho 20 funcionários mas só eu posto',
 'App mobile + compartilhamento + gamificação',
 'Alcance 20x maior (20 pessoas vs 1)', 4, 'planejado', 4, NULL, NULL),

(19, 'receita', 'Inteligência de Preços',
 'Meu preço está competitivo?',
 'Scraping de 10 concorrentes + alertas + sugestões dinâmicas',
 'Taxa de ocupação 15% maior', 4, 'planejado', 5, NULL, 15),

(20, 'receita', 'Engine de Predição de Viralização',
 'Não sei qual post tem potencial viral',
 'Score 0-100 (15 fatores: horário, tema, trend) + impulsiona top 10%',
 'Posts score >80 têm 12x mais chance de viralizar', 3, 'planejado', 7, NULL, NULL);

-- ============================================================
-- SEED: 5 Business Ideas (top prioridade)
-- ============================================================
INSERT INTO business_ideas (numero, categoria, nome, conceito, modelo_receita, mrr_projetado, setup_price, ltv_12_meses, fase, prioridade) VALUES

(1, 'core_saas', 'Instagram Autopilot — 90 Dias Plug & Play',
 'Cliente faz onboarding 63 perguntas → IA gera 90 dias completos de posts + legendas + hashtags + Canva',
 '{"setup": 497, "mensal": 297, "upsell_reels": 197}'::jsonb,
 297, 497, 6425, 'mvp', 10),

(2, 'core_saas', 'Crisis Pack — Conteúdo Emergencial',
 'Pacotes prontos para datas (Carnaval, Natal, Black Friday) com 15-30 posts completos por data',
 '{"pack_basico": 97, "pack_premium": 197, "assinatura_anual": 997}'::jsonb,
 NULL, 97, 997, 'ideia', 7),

(3, 'core_saas', 'Benchmark Competitor — Espionagem',
 'Relatório automático comparando perfil do hotel com 5 concorrentes + insights + recomendações',
 '{"relatorio_unico": 297, "mensal": 197}'::jsonb,
 197, 297, 2661, 'ideia', 8),

(6, 'monetizacao_perfis', 'Hotel do Mês — Clube de Parcerias',
 'Cada mês destaca 1 hotel nos 6 perfis (2.42M alcance) com pacote de conteúdo exclusivo',
 '{"mensal_hotel": 4000, "trimestral": 10000}'::jsonb,
 4000, NULL, 48000, 'ativo', 9),

(20, 'tech_expansion', 'White Label SaaS — Revenda para Agências',
 'Agências de marketing compram licença e revendem o sistema com marca própria',
 '{"licenca_mensal": 997, "setup_agencia": 2497}'::jsonb,
 997, 2497, 14461, 'ideia', 6);

-- ============================================================
-- SEED: Calendário 3 Meses (Mar-Mai 2026) — 65 posts
-- ============================================================
-- Baseado no calendario_editorial_3meses.csv

INSERT INTO calendarios_gerados (hotel_id, data_post, horario_sugerido, dia_semana, tipo, categoria, tema_especifico, status)
SELECT
  NULL as hotel_id,
  d::date,
  t::time,
  to_char(d::date, 'FMDay'),
  tipo,
  tema,
  tema,
  'rascunho'
FROM (VALUES
  ('2026-03-01', '18:00', 'feed', 'paisagem'),
  ('2026-03-02', '14:00', 'reel', 'piscina'),
  ('2026-03-04', '08:00', 'feed', 'gastronomia'),
  ('2026-03-05', '20:00', 'feed', 'quarto'),
  ('2026-03-06', '19:00', 'reel', 'familia'),
  ('2026-03-08', '18:00', 'feed', 'paisagem'),
  ('2026-03-09', '14:00', 'reel', 'piscina'),
  ('2026-03-11', '08:00', 'feed', 'gastronomia'),
  ('2026-03-12', '20:00', 'feed', 'quarto'),
  ('2026-03-13', '19:00', 'reel', 'familia'),
  ('2026-03-15', '18:00', 'feed', 'paisagem'),
  ('2026-03-16', '14:00', 'reel', 'piscina'),
  ('2026-03-18', '08:00', 'feed', 'gastronomia'),
  ('2026-03-19', '20:00', 'feed', 'quarto'),
  ('2026-03-20', '19:00', 'reel', 'familia'),
  ('2026-03-22', '18:00', 'feed', 'paisagem'),
  ('2026-03-23', '14:00', 'reel', 'piscina'),
  ('2026-03-25', '08:00', 'feed', 'gastronomia'),
  ('2026-03-26', '20:00', 'feed', 'quarto'),
  ('2026-03-27', '19:00', 'reel', 'familia'),
  ('2026-03-29', '18:00', 'feed', 'paisagem'),
  ('2026-03-30', '14:00', 'reel', 'piscina'),
  ('2026-04-01', '08:00', 'feed', 'gastronomia'),
  ('2026-04-02', '20:00', 'feed', 'quarto'),
  ('2026-04-03', '19:00', 'reel', 'familia'),
  ('2026-04-05', '18:00', 'feed', 'paisagem'),
  ('2026-04-06', '14:00', 'reel', 'piscina'),
  ('2026-04-08', '08:00', 'feed', 'gastronomia'),
  ('2026-04-09', '20:00', 'feed', 'quarto'),
  ('2026-04-10', '19:00', 'reel', 'familia'),
  ('2026-04-12', '18:00', 'feed', 'paisagem'),
  ('2026-04-13', '14:00', 'reel', 'piscina'),
  ('2026-04-15', '08:00', 'feed', 'gastronomia'),
  ('2026-04-16', '20:00', 'feed', 'quarto'),
  ('2026-04-17', '19:00', 'reel', 'familia'),
  ('2026-04-19', '18:00', 'feed', 'paisagem'),
  ('2026-04-20', '14:00', 'reel', 'piscina'),
  ('2026-04-22', '08:00', 'feed', 'gastronomia'),
  ('2026-04-23', '20:00', 'feed', 'quarto'),
  ('2026-04-24', '19:00', 'reel', 'familia'),
  ('2026-04-26', '18:00', 'feed', 'paisagem'),
  ('2026-04-27', '14:00', 'reel', 'piscina'),
  ('2026-04-29', '08:00', 'feed', 'gastronomia'),
  ('2026-04-30', '20:00', 'feed', 'quarto'),
  ('2026-05-01', '19:00', 'reel', 'familia'),
  ('2026-05-03', '18:00', 'feed', 'paisagem'),
  ('2026-05-04', '14:00', 'reel', 'piscina'),
  ('2026-05-06', '08:00', 'feed', 'gastronomia'),
  ('2026-05-07', '20:00', 'feed', 'quarto'),
  ('2026-05-08', '19:00', 'reel', 'familia'),
  ('2026-05-10', '18:00', 'feed', 'paisagem'),
  ('2026-05-11', '14:00', 'reel', 'piscina'),
  ('2026-05-13', '08:00', 'feed', 'gastronomia'),
  ('2026-05-14', '20:00', 'feed', 'quarto'),
  ('2026-05-15', '19:00', 'reel', 'familia'),
  ('2026-05-17', '18:00', 'feed', 'paisagem'),
  ('2026-05-18', '14:00', 'reel', 'piscina'),
  ('2026-05-20', '08:00', 'feed', 'gastronomia'),
  ('2026-05-21', '20:00', 'feed', 'quarto'),
  ('2026-05-22', '19:00', 'reel', 'familia'),
  ('2026-05-24', '18:00', 'feed', 'paisagem'),
  ('2026-05-25', '14:00', 'reel', 'piscina'),
  ('2026-05-27', '08:00', 'feed', 'gastronomia'),
  ('2026-05-28', '20:00', 'feed', 'quarto'),
  ('2026-05-29', '19:00', 'reel', 'familia')
) AS v(d, t, tipo, tema);

-- FIM DA EXPANSÃO V2.1
