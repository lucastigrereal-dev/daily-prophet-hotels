-- ============================================================
-- DAILY PROPHET HOTELS — Supabase Functions (RPC)
-- Execute APÓS o SCHEMA_V2.sql
-- ============================================================

-- 1. Random hooks (para o gerador)
CREATE OR REPLACE FUNCTION random_hooks(
  p_publico TEXT DEFAULT NULL,
  p_intencao TEXT DEFAULT NULL,
  p_tema TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS SETOF hooks AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM hooks
  WHERE (p_publico IS NULL OR publico = p_publico)
    AND (p_intencao IS NULL OR intencao = p_intencao)
    AND (p_tema IS NULL OR tema = p_tema)
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 2. Random benchmarks (para inspiração)
CREATE OR REPLACE FUNCTION random_benchmarks(
  p_formato TEXT DEFAULT NULL,
  p_publico TEXT DEFAULT NULL,
  p_tema TEXT DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS SETOF benchmarks_posts AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM benchmarks_posts
  WHERE ativo = true
    AND (p_formato IS NULL OR formato = p_formato)
    AND (p_publico IS NULL OR publico = p_publico)
    AND (p_tema IS NULL OR tema = p_tema)
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 3. Stats do dashboard
CREATE OR REPLACE FUNCTION dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_hooks', (SELECT count(*) FROM hooks),
    'total_legendas', (SELECT count(*) FROM benchmarks_posts WHERE ativo = true),
    'total_templates', (SELECT count(*) FROM caption_templates WHERE ativo = true),
    'total_hotels', (SELECT count(*) FROM hotels),
    'hotels_ativos', (SELECT count(*) FROM hotels WHERE status = 'ativo'),
    'collabs_ativas', (SELECT count(*) FROM collabs WHERE status = 'ativo'),
    'receita_mensal', (SELECT COALESCE(sum(valor_mensal), 0) FROM collabs WHERE status = 'ativo'),
    'posts_mes', (SELECT count(*) FROM calendarios_gerados
                  WHERE DATE_TRUNC('month', data_post) = DATE_TRUNC('month', CURRENT_DATE)),
    'posts_publicados_mes', (SELECT count(*) FROM calendarios_gerados
                             WHERE status = 'publicado'
                             AND DATE_TRUNC('month', data_post) = DATE_TRUNC('month', CURRENT_DATE))
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Hooks distribution (para analytics)
CREATE OR REPLACE FUNCTION hooks_distribution()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'por_publico', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT publico, count(*) as qtd FROM hooks GROUP BY publico ORDER BY qtd DESC
      ) t
    ),
    'por_intencao', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT intencao, count(*) as qtd FROM hooks GROUP BY intencao ORDER BY qtd DESC
      ) t
    ),
    'por_tema', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT tema, count(*) as qtd FROM hooks GROUP BY tema ORDER BY qtd DESC LIMIT 15
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Hotel content score (quanto conteúdo foi gerado para um hotel)
CREATE OR REPLACE FUNCTION hotel_content_score(p_hotel_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_posts', (SELECT count(*) FROM calendarios_gerados WHERE hotel_id = p_hotel_id),
    'publicados', (SELECT count(*) FROM calendarios_gerados WHERE hotel_id = p_hotel_id AND status = 'publicado'),
    'agendados', (SELECT count(*) FROM calendarios_gerados WHERE hotel_id = p_hotel_id AND status = 'agendado'),
    'rascunhos', (SELECT count(*) FROM calendarios_gerados WHERE hotel_id = p_hotel_id AND status = 'rascunho'),
    'media_likes', (SELECT COALESCE(avg(likes_real), 0) FROM calendarios_gerados WHERE hotel_id = p_hotel_id AND likes_real IS NOT NULL),
    'media_comentarios', (SELECT COALESCE(avg(comentarios_real), 0) FROM calendarios_gerados WHERE hotel_id = p_hotel_id AND comentarios_real IS NOT NULL),
    'total_alcance', (SELECT COALESCE(sum(alcance_real), 0) FROM calendarios_gerados WHERE hotel_id = p_hotel_id AND alcance_real IS NOT NULL)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Search hooks by text (full text search)
CREATE OR REPLACE FUNCTION search_hooks(p_query TEXT, p_limit INT DEFAULT 20)
RETURNS SETOF hooks AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM hooks
  WHERE hook ILIKE '%' || p_query || '%'
  ORDER BY numero
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 7. Get hotel with all related data
CREATE OR REPLACE FUNCTION get_hotel_complete(p_hotel_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'hotel', (SELECT row_to_json(h) FROM hotels h WHERE id = p_hotel_id),
    'estruturas', (SELECT row_to_json(e) FROM hotel_estruturas e WHERE hotel_id = p_hotel_id),
    'digital', (SELECT row_to_json(d) FROM hotel_digital d WHERE hotel_id = p_hotel_id),
    'publico', (SELECT row_to_json(p) FROM hotel_publico p WHERE hotel_id = p_hotel_id),
    'posicionamento', (SELECT row_to_json(pos) FROM hotel_posicionamento pos WHERE hotel_id = p_hotel_id),
    'metas', (SELECT row_to_json(m) FROM hotel_metas m WHERE hotel_id = p_hotel_id),
    'onboarding', (SELECT row_to_json(o) FROM onboarding_respostas o WHERE hotel_id = p_hotel_id),
    'content_score', hotel_content_score(p_hotel_id)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Generate calendar dates for a hotel (helper)
CREATE OR REPLACE FUNCTION generate_calendar_dates(
  p_hotel_id UUID,
  p_start_date DATE,
  p_days INT DEFAULT 90
)
RETURNS VOID AS $$
DECLARE
  current_date_var DATE := p_start_date;
  day_counter INT := 0;
  day_name TEXT;
  post_type TEXT;
  post_tema TEXT;
BEGIN
  WHILE day_counter < p_days LOOP
    day_name := to_char(current_date_var, 'Day');

    -- Assign type and theme based on day of week
    CASE EXTRACT(DOW FROM current_date_var)
      WHEN 1 THEN post_type := 'feed'; post_tema := 'estrutura';
      WHEN 2 THEN post_type := 'reel'; post_tema := 'experiencia';
      WHEN 3 THEN post_type := 'feed'; post_tema := 'gastronomia';
      WHEN 4 THEN post_type := 'feed'; post_tema := 'ugc';
      WHEN 5 THEN post_type := 'reel'; post_tema := 'trending';
      WHEN 6 THEN post_type := 'story'; post_tema := 'bastidores';
      WHEN 0 THEN post_type := 'feed'; post_tema := 'aspiracional';
    END CASE;

    INSERT INTO calendarios_gerados (hotel_id, data_post, dia_semana, tipo, categoria, status)
    VALUES (p_hotel_id, current_date_var, trim(day_name), post_type, post_tema, 'rascunho')
    ON CONFLICT DO NOTHING;

    current_date_var := current_date_var + 1;
    day_counter := day_counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
