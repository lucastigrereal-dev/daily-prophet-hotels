-- ============================================
-- EXEMPLOS DE DADOS PARA TESTES
-- Caso de Sucesso - Daily Prophet
-- ============================================

-- EXEMPLO 1: Case de Sucesso - Reel com Alto Engajamento
UPDATE workflows
SET
  case_sucesso = true,
  metricas = jsonb_build_object(
    '7d', jsonb_build_object(
      'views', 45600,
      'likes', 2340,
      'comments', 580,
      'saves', 1200,
      'shares', 450,
      'reach', 38000,
      'new_followers', 850
    ),
    '24h', jsonb_build_object(
      'views', 12300,
      'likes', 890,
      'comments', 250,
      'saves', 480,
      'shares', 180,
      'reach', 15000,
      'new_followers', 340
    ),
    '30min', jsonb_build_object(
      'views', 2500,
      'likes', 150,
      'comments', 45,
      'saves', 85,
      'shares', 35,
      'reach', 3200,
      'new_followers', 65
    )
  ),
  analise_causal = 'Sucesso gerado pela combinação de:
1. Timing perfeito de publicação (horário de pico)
2. Conteúdo altamente relevante para audiência
3. Uso de trending audio/música
4. CTA claro e chamada para ação
5. Qualidade visual excepcional da thumbnail

O padrão de engajamento mostrou que 63% das interações ocorreram nas primeiras 24h, indicando algoritmo favorável.',
  format = 'reel',
  objetivo = 'Aumentar seguidores e engajamento',
  procedimento = 'Reel curto com música trending',
  gancho_data = '{"texto": "Você não vai acreditar nessa transformação em apenas 7 dias..."}',
  legenda_data = '{"texto": "A jornada de transformação que mudarão sua vida 💪\n\n✅ Dieta otimizada\n✅ Treino intenso\n✅ Suplementação correta\n\nVocê quer saber como conquistar esse resultado?\n\nComenta 👇 QUERO!"}',
  cta_data = '{"texto": "Comente QUERO para receber meu e-book de transformação"}',
  url_publicado = 'https://instagram.com/p/ABC123XYZ456',
  criado_em = NOW() - INTERVAL '10 days',
  aprovado_em = NOW() - INTERVAL '9 days',
  publicado_em = NOW() - INTERVAL '7 days',
  metricas_7d_em = NOW()
WHERE id = 'seu-id-workflow-aqui-1';

-- ============================================
-- EXEMPLO 2: Case de Sucesso - Post com Alta Conversão
UPDATE workflows
SET
  case_sucesso = true,
  metricas = jsonb_build_object(
    '7d', jsonb_build_object(
      'views', 28900,
      'likes', 1520,
      'comments', 380,
      'saves', 890,
      'shares', 230,
      'reach', 24500,
      'new_followers', 620
    ),
    '24h', jsonb_build_object(
      'views', 8200,
      'likes', 580,
      'comments', 180,
      'saves', 340,
      'shares', 95,
      'reach', 10800,
      'new_followers', 280
    ),
    '30min', jsonb_build_object(
      'views', 1600,
      'likes', 95,
      'comments', 30,
      'saves', 65,
      'shares', 20,
      'reach', 2100,
      'new_followers': 45
    )
  ),
  analise_causal = 'Case bem-sucedido. Fatores determinantes:
1. Carrossel com 5 slides de alta qualidade
2. Legenda educativa e inspiradora
3. Comunidade engajada respondendo comentários
4. Colaboração com 2 outras contas grandes
5. Uso de hashtags relevantes e trending

Taxa de salvamentos excepcionalmente alta (3.6% do alcance) indica conteúdo com valor duradouro.',
  formato = 'carrossel',
  objetivo = 'Educação e engajamento comunitário',
  procedimento = 'Carrossel com dicas práticas',
  gancho_data = '{"texto": "5 hábitos que mudaram minha vida em 2025"}',
  legenda_data = '{"texto": "Slide 1: Acordar cedo ⏰\nSlide 2: Meditar 🧘\nSlide 3: Exercício 💪\nSlide 4: Leitura 📚\nSlide 5: Dormir bem 😴\n\nQual é seu hábito favorito? Comenta aqui 👇"}',
  cta_data = '{"texto": "Salve este post para não perder!"}',
  url_publicado = 'https://instagram.com/p/XYZ789ABC456',
  criado_em = NOW() - INTERVAL '8 days',
  aprovado_em = NOW() - INTERVAL '7 days',
  publicado_em = NOW() - INTERVAL '5 days',
  metricas_7d_em = NOW()
WHERE id = 'seu-id-workflow-aqui-2';

-- ============================================
-- EXEMPLO 3: Case de Sucesso - Story com Alta Visualização
UPDATE workflows
SET
  case_sucesso = true,
  metricas = jsonb_build_object(
    '7d', jsonb_build_object(
      'views', 62000,
      'likes', 1200,
      'comments', 150,
      'saves', 300,
      'shares', 800,
      'reach', 55000,
      'new_followers', 420
    ),
    '24h', jsonb_build_object(
      'views', 42000,
      'likes', 850,
      'comments', 100,
      'saves', 200,
      'shares': 550,
      'reach': 38000,
      'new_followers': 280
    ),
    '30min', jsonb_build_object(
      'views', 18000,
      'likes', 320,
      'comments', 35,
      'saves', 70,
      'shares': 220,
      'reach': 16500,
      'new_followers': 95
    )
  ),
  analise_causal = 'Sucesso viral em Stories. Razões principais:
1. Resposta rápida a um trending topic
2. 8 stories em sequência mantendo atenção
3. Uso de stickers interativos (polls, quiz)
4. Stories com movimento e animação
5. Chamada urgente para ação (24h apenas)

Taxa de compartilhamento extremamente alta (1.45%) sugere conteúdo muito compartilhável.',
  formato = 'story',
  objetivo = 'Viralizar conteúdo e gerar buzz',
  procedimento = 'Story sequence com interação',
  gancho_data = '{"texto": "Você NÃO vai acreditar no que aconteceu hoje..."}',
  legenda_data = '{"texto": "Story 1: Setup (o que aconteceu)\nStory 2: Reação (minha reação)\nStory 3: Poll (o que você faria?)\nStory 4: Votação ao vivo\nStory 5: Resultado\nStory 6: Consequência\nStory 7: Lição\nStory 8: CTA"}',
  cta_data = '{"texto": "Me segue para ver a conclusão em 24h!"}',
  url_publicado = 'https://instagram.com/stories/seu-usuario/123456789',
  criado_em = NOW() - INTERVAL '2 days',
  aprovado_em = NOW() - INTERVAL '2 days',
  publicado_em = NOW() - INTERVAL '1 day',
  metricas_7d_em = NOW()
WHERE id = 'seu-id-workflow-aqui-3';

-- ============================================
-- EXEMPLO 4: Case de Sucesso - Combo Post + Stories
UPDATE workflows
SET
  case_sucesso = true,
  metricas = jsonb_build_object(
    '7d', jsonb_build_object(
      'views', 95400,
      'likes', 4200,
      'comments', 920,
      'saves', 2100,
      'shares', 650,
      'reach', 78000,
      'new_followers', 1450
    ),
    '24h', jsonb_build_object(
      'views', 48200,
      'likes', 2100,
      'comments': 450,
      'saves': 1050,
      'shares': 320,
      'reach': 42000,
      'new_followers': 680
    ),
    '30min', jsonb_build_object(
      'views': 12600,
      'likes': 580,
      'comments': 120,
      'saves': 280,
      'shares': 95,
      'reach': 11000,
      'new_followers': 185
    )
  ),
  analise_causal = 'CASE DE SUCESSO EXCEPCIONAL - Estratégia integrada:

FASE 1 (Stories): Teaser com cliffhanger
FASE 2 (Post): Conteúdo principal com carrossel
FASE 3 (Stories): Reações e engagement
FASE 4 (Stories): CTA para link na bio

Fatores de sucesso:
1. Planejamento estratégico sequenciado
2. Conteúdo de qualidade premium
3. Copy persuasivo e relevante
4. Timing perfeitamente coordenado
5. Comunidade altamente engajada
6. Colaborações estratégicas
7. Uso de trending hashtags e áudio

RESULTADO: Taxa de engajamento de 5.4% (extremamente alta)
Novos seguidores: 1.45k (crescimento significativo)
Alcance orgânico: 78k (distribuição excelente)',
  formato = 'combo',
  objetivo = 'Lançamento de produto premium',
  procedimento = 'Stories + Post + Stories sequenciados',
  gancho_data = '{"texto": "Após 6 meses de desenvolvimento... finalmente está pronto!"}',
  legenda_data = '{"texto": "🚀 LANÇAMENTO OFICIAL 🚀\n\nApresentamos: [Produto Premium]\n\n✨ Desenvolvido por 6 meses\n✨ Testado por 500+ beta testers\n✨ Resultados comprovados\n✨ Garantia 100% satisfação\n\n📊 Números:\n• Eficiência: +340%\n• Satisfação: 9.8/10\n• Retenção: 94%\n\n🎁 PRÉ-VENDA ESPECIAL\nPrimeiros 100: 50% OFF\nLink na bio!"}',
  cta_data = '{"texto": "Clique no link da bio e garanta seu acesso com 50% OFF"}',
  url_publicado = 'https://instagram.com/p/PREMIUM123XYZ',
  criado_em = NOW() - INTERVAL '14 days',
  aprovado_em = NOW() - INTERVAL '12 days',
  publicado_em = NOW() - INTERVAL '7 days',
  metricas_7d_em = NOW()
WHERE id = 'seu-id-workflow-aqui-4';

-- ============================================
-- EXEMPLO 5: Case de Sucesso - Educação/Tutorial
UPDATE workflows
SET
  case_sucesso = true,
  metricas = jsonb_build_object(
    '7d', jsonb_build_object(
      'views', 152000,
      'likes', 3800,
      'comments', 1250,
      'saves', 8900,
      'shares', 2200,
      'reach', 125000,
      'new_followers', 2600
    ),
    '24h', jsonb_build_object(
      'views', 85000,
      'likes', 2100,
      'comments': 680,
      'saves': 5200,
      'shares': 1200,
      'reach': 72000,
      'new_followers': 1450
    ),
    '30min', jsonb_build_object(
      'views': 28000,
      'likes': 720,
      'comments': 230,
      'saves': 1800,
      'shares': 420,
      'reach': 24000,
      'new_followers': 485
    )
  ),
  analise_causal = 'CONTEÚDO EDUCATIVO DE ALTÍSSIMO IMPACTO

Estratégia: Tutorial passo-a-passo com foco em valor

Segredos do sucesso:
1. Conteúdo é genuinamente útil
2. Explicação clara e progressiva
3. Visuais de alta qualidade
4. Código/exemplo prático incluído
5. Resultados imediatos
6. Comunidade pode aplicar hoje

Métricas notáveis:
- Taxa de saves de 7.1% (EXCEPCIONAL)
- Indicando: "vou voltar nisso depois"
- Engajamento de 9.7% (premium)
- Compartilhamentos de 1.76% (viral)

Conclusão: Conteúdo educativo bem feito gera ALTO engajamento
e builds comunidade leal.',
  formato = 'video',
  objetivo = 'Educação e posicionamento de autoridade',
  procedimento = 'Video tutorial passo-a-passo',
  gancho_data = '{"texto": "Ninguém te ensinou isso na escola... mas deveria ter ensinado"}',
  legenda_data = '{"texto": "TUTORIAL COMPLETO: [Assunto]\n\n⏱️ 0:00 - Introdução\n⏱️ 1:30 - Fundamentação\n⏱️ 4:20 - Passo 1\n⏱️ 7:15 - Passo 2\n⏱️ 10:05 - Passo 3\n⏱️ 12:40 - Resultado\n⏱️ 14:20 - Dicas extras\n\n✅ Esse método funciona 100%\n✅ Testado por +5000 pessoas\n✅ Resultado garantido em 7 dias\n\nSalve este video para aplicar hoje mesmo! 📌"}',
  cta_data = '{"texto": "Comente FEITO! quando terminar de assistir e aplicar"}',
  url_publicado = 'https://instagram.com/p/TUTORIAL789ABC',
  criado_em = NOW() - INTERVAL '9 days',
  aprovado_em = NOW() - INTERVAL '8 days',
  publicado_em = NOW() - INTERVAL '7 days',
  metricas_7d_em = NOW()
WHERE id = 'seu-id-workflow-aqui-5';

-- ============================================
-- QUERIES DE VERIFICAÇÃO
-- ============================================

-- Para ver todos os cases marcados como sucesso:
SELECT
  id,
  formato,
  objetivo,
  case_sucesso,
  metricas -> '7d' -> 'views' as views_7d,
  metricas -> '7d' -> 'likes' as likes_7d,
  metricas -> '7d' -> 'reach' as reach_7d,
  criado_em,
  publicado_em
FROM workflows
WHERE case_sucesso = true
ORDER BY publicado_em DESC;

-- Para ver engajamento de um case específico:
SELECT
  id,
  metricas -> '7d' -> 'views' as views,
  metricas -> '7d' -> 'likes' as likes,
  metricas -> '7d' -> 'comments' as comments,
  metricas -> '7d' -> 'saves' as saves,
  metricas -> '7d' -> 'shares' as shares,
  metricas -> '7d' -> 'reach' as reach,
  metricas -> '7d' -> 'new_followers' as followers,
  ROUND(
    ((CAST(metricas -> '7d' ->> 'likes' AS FLOAT) +
      CAST(metricas -> '7d' ->> 'comments' AS FLOAT) +
      CAST(metricas -> '7d' ->> 'saves' AS FLOAT)) /
     CAST(metricas -> '7d' ->> 'reach' AS FLOAT)) * 100, 2) as taxa_engajamento
FROM workflows
WHERE case_sucesso = true
LIMIT 1;

-- Para resetar um workflow de volta para teste:
UPDATE workflows
SET case_sucesso = false
WHERE id = 'seu-id-aqui';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
1. ANTES DE EXECUTAR: Substitua 'seu-id-workflow-aqui-1' por um ID real
2. BACKUP: Faça backup antes de alterar dados de produção
3. TESTE: Teste em ambiente de desenvolvimento primeiro
4. IDs: Você pode encontrar IDs em:
   - Tab "workflows" no Supabase
   - URL: /workflow/[id]
5. DADOS: Os exemplos são fictícios e didáticos
6. SEGURANÇA: Nunca exponha essa query em repositório público
7. PERFORMANCE: Executar em off-peak para evitar locks
8. AUDITORIA: Considere registrar quem fez as mudanças
*/
