-- ============================================
-- MIGRATION: 002_create_checklist_system
-- DATA: 2026-01-11
-- PROJETO: Daily Prophet - Instituto Rodovansky
-- DESCRICAO: Cria sistema completo de checklist para producao de conteudo
-- ============================================

-- ============================================
-- TABELA: checklist_itens
-- Armazena itens de checklist para cada formato
-- ============================================

CREATE TABLE IF NOT EXISTS checklist_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    formato VARCHAR(50) NOT NULL, -- 'reels', 'carrossel', 'stories', 'foto'
    fase VARCHAR(50) NOT NULL, -- 'pre_producao', 'gravacao', 'edicao', 'publicacao', 'pos_publicacao'
    ordem INTEGER NOT NULL,
    obrigatorio BOOLEAN DEFAULT true,
    dica TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_checklist_formato ON checklist_itens(formato);
CREATE INDEX IF NOT EXISTS idx_checklist_fase ON checklist_itens(fase);
CREATE INDEX IF NOT EXISTS idx_checklist_ordem ON checklist_itens(ordem);
CREATE INDEX IF NOT EXISTS idx_checklist_active ON checklist_itens(is_active);

-- ============================================
-- TABELA: postpack_checklist
-- Tracking de checklist para cada postpack
-- ============================================

CREATE TABLE IF NOT EXISTS postpack_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    postpack_id UUID NOT NULL, -- FK para postpacks (se existir)
    checklist_item_id UUID NOT NULL REFERENCES checklist_itens(id) ON DELETE CASCADE,
    concluido BOOLEAN DEFAULT false,
    data_conclusao TIMESTAMPTZ,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_postpack_checklist_postpack ON postpack_checklist(postpack_id);
CREATE INDEX IF NOT EXISTS idx_postpack_checklist_item ON postpack_checklist(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_postpack_checklist_concluido ON postpack_checklist(concluido);

-- ============================================
-- POPULAR: CHECKLIST REELS
-- 20+ itens para producao de Reels
-- ============================================

-- PRE-PRODUCAO REELS
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Definir objetivo do Reels', 'Escolher objetivo principal (engajamento, autoridade, vendas, educação)', 'reels', 'pre_producao', 1, true, 'O objetivo define todo o tom e estrutura do conteúdo'),
('Selecionar ideia de conteúdo', 'Escolher ideia do banco de dados compatível com objetivo', 'reels', 'pre_producao', 2, true, 'Use o filtro de formato recomendado'),
('Definir gancho inicial', 'Escolher ou criar gancho que prende nos primeiros 3 segundos', 'reels', 'pre_producao', 3, true, 'Ganchos de pergunta ou estatística funcionam bem'),
('Estruturar roteiro', 'Definir introdução, desenvolvimento e conclusão', 'reels', 'pre_producao', 4, true, 'Reels idealmente tem 15-30 segundos'),
('Escolher música/áudio', 'Selecionar trending audio ou música adequada', 'reels', 'pre_producao', 5, false, 'Audios em alta aumentam alcance'),
('Planejar takes necessários', 'Listar cenas e ângulos que serão gravados', 'reels', 'pre_producao', 6, true, 'Previna regravações planejando bem');

-- GRAVACAO REELS
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Configurar iluminação', 'Verificar luz natural ou artificial adequada', 'reels', 'gravacao', 7, true, 'Luz suave no rosto, sem sombras fortes'),
('Configurar enquadramento', 'Posicionar câmera na altura dos olhos, fundo limpo', 'reels', 'gravacao', 8, true, 'Regra dos terços para composição'),
('Testar áudio', 'Verificar qualidade do microfone e eliminar ruídos', 'reels', 'gravacao', 9, true, 'Áudio ruim derruba retenção'),
('Gravar gancho (3x)', 'Gravar gancho inicial pelo menos 3 vezes', 'reels', 'gravacao', 10, true, 'Primeiros 3 segundos são críticos'),
('Gravar conteúdo principal', 'Capturar todo desenvolvimento do roteiro', 'reels', 'gravacao', 11, true, 'Grave múltiplas takes para ter opções'),
('Gravar B-rolls', 'Capturar cenas de apoio e cutaways', 'reels', 'gravacao', 12, false, 'B-rolls aumentam retenção');

-- EDICAO REELS
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Importar e organizar takes', 'Organizar todos os clipes gravados', 'reels', 'edicao', 13, true, 'Separe boas takes das ruins logo no início'),
('Editar para 15-30s', 'Ajustar duração ideal mantendo ritmo dinâmico', 'reels', 'edicao', 14, true, 'Reels curtos performam melhor'),
('Adicionar legendas', 'Inserir legendas sincronizadas com áudio', 'reels', 'edicao', 15, true, '70% assistem sem som'),
('Aplicar transições', 'Adicionar cortes e transições dinâmicas', 'reels', 'edicao', 16, true, 'Cortes a cada 2-3 segundos mantêm atenção'),
('Inserir CTA visual', 'Adicionar call-to-action na tela (se aplicável)', 'reels', 'edicao', 17, false, 'Setas e textos chamam atenção'),
('Ajustar cores/filtros', 'Aplicar correção de cor e filtros sutis', 'reels', 'edicao', 18, false, 'Mantenha identidade visual da marca'),
('Sincronizar com música', 'Garantir que cortes casam com beat da música', 'reels', 'edicao', 19, false, 'Sincronia aumenta profissionalismo');

-- PUBLICACAO REELS
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Escrever legenda completa', 'Criar legenda com gancho, meio e CTA', 'reels', 'publicacao', 20, true, 'Use quebras de linha para facilitar leitura'),
('Adicionar hashtags', 'Incluir 5-10 hashtags relevantes', 'reels', 'publicacao', 21, true, 'Mix de alcance: pequenas, médias e grandes'),
('Marcar localização', 'Adicionar localização da clínica', 'reels', 'publicacao', 22, true, 'Aumenta alcance local'),
('Criar capa atrativa', 'Escolher frame de capa que chame atenção', 'reels', 'publicacao', 23, true, 'Capa aparece no grid e perfil'),
('Agendar horário ideal', 'Publicar nos horários de maior engajamento', 'reels', 'publicacao', 24, true, 'Consulte analytics para melhor horário'),
('Compartilhar nos Stories', 'Repostar Reels nos Stories após publicação', 'reels', 'publicacao', 25, false, 'Aumenta visualizações iniciais');

-- POS-PUBLICACAO REELS
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Responder primeiros comentários', 'Engajar com comentários na primeira hora', 'reels', 'pos_publicacao', 26, true, 'Engajamento inicial impulsiona alcance'),
('Monitorar métricas (24h)', 'Verificar views, curtidas, saves e shares', 'reels', 'pos_publicacao', 27, true, 'Primeiras 24h definem performance'),
('Responder DMs relacionados', 'Responder mensagens diretas sobre o conteúdo', 'reels', 'pos_publicacao', 28, false, 'Oportunidade de conversão');

-- ============================================
-- POPULAR: CHECKLIST CARROSSEL
-- 15+ itens para producao de Carrossel
-- ============================================

-- PRE-PRODUCAO CARROSSEL
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Definir tema do carrossel', 'Escolher tema educativo ou informativo', 'carrossel', 'pre_producao', 1, true, 'Carrosséis educativos performam melhor'),
('Estruturar conteúdo em slides', 'Dividir conteúdo em 5-10 slides', 'carrossel', 'pre_producao', 2, true, 'Máximo 10 slides para não cansar'),
('Criar gancho no slide 1', 'Primeiro slide deve despertar curiosidade', 'carrossel', 'pre_producao', 3, true, 'Use perguntas ou promessas'),
('Definir paleta de cores', 'Escolher 2-3 cores principais do carrossel', 'carrossel', 'pre_producao', 4, true, 'Consistência visual é crucial'),
('Planejar hierarquia de texto', 'Definir tamanhos de título, subtítulo e corpo', 'carrossel', 'pre_producao', 5, true, 'Facilita leitura rápida');

-- GRAVACAO/CRIACAO CARROSSEL
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Criar template no Canva/Figma', 'Configurar template padrão para todos os slides', 'carrossel', 'gravacao', 6, true, 'Template acelera criação'),
('Produzir slide 1 (gancho)', 'Criar capa chamativa com gancho forte', 'carrossel', 'gravacao', 7, true, 'Capa define se vão deslizar'),
('Desenvolver slides 2-9', 'Criar conteúdo principal com informações', 'carrossel', 'gravacao', 8, true, 'Um tópico por slide'),
('Criar slide final (CTA)', 'Último slide com call-to-action claro', 'carrossel', 'gravacao', 9, true, 'CTA deve ser objetivo e direto'),
('Adicionar imagens/ícones', 'Inserir elementos visuais relevantes', 'carrossel', 'gravacao', 10, false, 'Quebra monotonia de só texto');

-- EDICAO CARROSSEL
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Revisar ortografia em todos os slides', 'Corrigir erros de português', 'carrossel', 'edicao', 11, true, 'Erros matam credibilidade'),
('Verificar legibilidade', 'Testar contraste texto/fundo em mobile', 'carrossel', 'edicao', 12, true, 'A maioria vê pelo celular'),
('Adicionar numeração de slides', 'Mostrar "1/7", "2/7" etc', 'carrossel', 'edicao', 13, false, 'Indica progresso ao leitor');

-- PUBLICACAO CARROSSEL
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Escrever legenda educativa', 'Complementar informação dos slides', 'carrossel', 'publicacao', 14, true, 'Legenda pode aprofundar conteúdo'),
('Adicionar hashtags estratégicas', 'Usar hashtags do nicho + educacionais', 'carrossel', 'publicacao', 15, true, 'Carrosséis chegam em Explorar com facilidade'),
('Publicar em horário nobre', 'Postar quando público está mais ativo', 'carrossel', 'publicacao', 16, true, 'Salves e shares são cruciais');

-- POS-PUBLICACAO CARROSSEL
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Responder comentários', 'Engajar ativamente nos comentários', 'carrossel', 'pos_publicacao', 17, true, 'Carrosséis educativos geram muitas dúvidas'),
('Monitorar saves e shares', 'Verificar taxa de salvamento', 'carrossel', 'pos_publicacao', 18, true, 'Saves indicam valor percebido');

-- ============================================
-- POPULAR: CHECKLIST STORIES
-- 12+ itens para producao de Stories
-- ============================================

-- PRE-PRODUCAO STORIES
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Definir objetivo do story', 'Engajamento, direcionamento, bastidores, etc', 'stories', 'pre_producao', 1, true, 'Stories são mais informais que feed'),
('Planejar sequência de stories', 'Definir quantos stories e ordem lógica', 'stories', 'pre_producao', 2, true, '3-7 stories mantêm atenção');

-- GRAVACAO STORIES
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Gravar em formato vertical', 'Garantir proporção 9:16 (tela cheia)', 'stories', 'gravacao', 3, true, 'Stories horizontais perdem impacto'),
('Falar diretamente com câmera', 'Criar conexão olhando para lente', 'stories', 'gravacao', 4, false, 'Aumenta intimidade e engajamento'),
('Capturar em boa iluminação', 'Usar luz natural ou ring light', 'stories', 'gravacao', 5, true, 'Qualidade visual importa'),
('Gravar áudio limpo', 'Evitar ruídos de fundo', 'stories', 'gravacao', 6, true, 'Muitos assistem com som em stories');

-- EDICAO STORIES
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Adicionar texto/legendas', 'Inserir textos curtos e diretos', 'stories', 'edicao', 7, true, 'Facilita compreensão rápida'),
('Inserir stickers interativos', 'Usar enquetes, quizzes, perguntas', 'stories', 'edicao', 8, false, 'Aumenta engajamento em até 30%'),
('Adicionar localização', 'Marcar localização da clínica', 'stories', 'edicao', 9, true, 'Aumenta descoberta local'),
('Inserir link (se disponível)', 'Adicionar link para bio, site ou WhatsApp', 'stories', 'edicao', 10, false, 'Aproveite função de links');

-- PUBLICACAO STORIES
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Publicar em sequência lógica', 'Postar stories em ordem narrativa', 'stories', 'publicacao', 11, true, 'Conta uma história coesa'),
('Destacar stories importantes', 'Salvar em destaques organizados', 'stories', 'publicacao', 12, false, 'Destaques são mini portfólio permanente');

-- POS-PUBLICACAO STORIES
INSERT INTO checklist_itens (titulo, descricao, formato, fase, ordem, obrigatorio, dica) VALUES
('Responder interações', 'Responder enquetes, perguntas e reações', 'stories', 'pos_publicacao', 13, true, 'Stories são canal direto com audiência'),
('Analisar visualizações', 'Verificar queda de retenção entre stories', 'stories', 'pos_publicacao', 14, true, 'Identifica onde público perde interesse');

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- Verificar quantos itens foram criados
DO $$
DECLARE
    total_reels INTEGER;
    total_carrossel INTEGER;
    total_stories INTEGER;
    total_geral INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_reels FROM checklist_itens WHERE formato = 'reels';
    SELECT COUNT(*) INTO total_carrossel FROM checklist_itens WHERE formato = 'carrossel';
    SELECT COUNT(*) INTO total_stories FROM checklist_itens WHERE formato = 'stories';
    SELECT COUNT(*) INTO total_geral FROM checklist_itens;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKLIST CRIADO COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'REELS: % itens', total_reels;
    RAISE NOTICE 'CARROSSEL: % itens', total_carrossel;
    RAISE NOTICE 'STORIES: % itens', total_stories;
    RAISE NOTICE 'TOTAL: % itens de checklist', total_geral;
    RAISE NOTICE '========================================';
END $$;
