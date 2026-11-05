-- Local candidate only. Never applied to an existing or remote service.
-- Append after C9 and taxonomy in a fresh, disposable LAB.
BEGIN;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY hotel_c10_user_read ON public.users FOR SELECT TO authenticated USING (id=auth.uid());
REVOKE ALL ON public.users FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.users TO authenticated;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY hotel_c10_activity_read ON public.activity_log FOR SELECT TO authenticated USING (user_id=auth.uid());
REVOKE ALL ON public.activity_log FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.activity_log TO authenticated;
ALTER VIEW public.v_hotels_completo SET (security_invoker=true,security_barrier=true);
ALTER VIEW public.v_calendario_mes SET (security_invoker=true,security_barrier=true);
ALTER VIEW public.v_collabs_ativas SET (security_invoker=true,security_barrier=true);
REVOKE ALL ON public.v_hotels_completo,public.v_calendario_mes,public.v_collabs_ativas FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.v_hotels_completo,public.v_calendario_mes,public.v_collabs_ativas TO authenticated;

-- Auth-controlled identity only; user_metadata cannot assign role or hotel links.
CREATE FUNCTION public.hotel_c10_auth_identity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 INSERT INTO public.users(id,email,nome_completo,role,ativo)
 VALUES(NEW.id,NEW.email,'','hotel_owner',true);
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.hotel_c10_auth_identity() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER hotel_c10_auth_identity AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.hotel_c10_auth_identity();

-- A non-login function owner, with RLS membership but no bypass or table ownership.
CREATE ROLE hotel_c10_rpc NOLOGIN NOINHERIT NOBYPASSRLS;
GRANT authenticated TO hotel_c10_rpc WITH INHERIT TRUE;
GRANT USAGE ON SCHEMA public,auth TO hotel_c10_rpc;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO hotel_c10_rpc;
GRANT INSERT,UPDATE ON public.hotels,public.onboarding_respostas,public.hotel_content_preferences,public.calendarios_gerados TO hotel_c10_rpc;
GRANT INSERT ON public.hotel_execution_log TO hotel_c10_rpc;
GRANT EXECUTE ON FUNCTION auth.uid(),auth.role() TO hotel_c10_rpc;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.hotels,public.onboarding_respostas,public.hotel_content_preferences,public.calendarios_gerados,public.hotel_execution_log FROM PUBLIC,anon,authenticated;
CREATE POLICY hotel_c10_active_actor ON public.hotels AS RESTRICTIVE FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.ativo=true))
WITH CHECK (EXISTS(SELECT 1 FROM public.users u WHERE u.id=auth.uid() AND u.ativo=true));
CREATE FUNCTION public.hotel_c10_profile(s jsonb,h uuid,r integer) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE m1 jsonb:=s->'modulo_1'; m2 jsonb:=s->'modulo_2'; m3 jsonb:=s->'modulo_3';
 tone text:=m2->>'tom'; veto jsonb:=m2->'temas_vetados'; f jsonb:='{}'; k text; v text; source text; vals jsonb; avoid jsonb; audience text;
BEGIN
 IF tone IS NULL OR tone NOT IN ('acolhedor','direto','elegante') OR m2->'vetos_confirmados' IS DISTINCT FROM 'true'::jsonb OR jsonb_typeof(veto) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'EDITORIAL_CONFIRMATION_REQUIRED'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(veto) x WHERE jsonb_typeof(x)<>'string' OR x#>>'{}' NOT IN ('acomodacao','hospitalidade','ambiente','planejamento','identidade','destino','bastidores','conversa','confianca')) OR (SELECT count(*)<>count(DISTINCT x) FROM jsonb_array_elements(veto)x) THEN RAISE EXCEPTION 'INVALID_VETO'; END IF;
 SELECT coalesce(jsonb_agg(x ORDER BY n),'[]'::jsonb) INTO avoid FROM unnest(ARRAY['acomodacao','hospitalidade','ambiente','planejamento','identidade','destino','bastidores','conversa','confianca']) WITH ORDINALITY a(x,n) WHERE veto ? x;
 IF (m3->>'minutos_disponiveis') IS NULL OR (m3->>'minutos_disponiveis')::integer NOT BETWEEN 5 AND 120 OR (m3->>'posts_por_semana') IS NULL OR (m3->>'posts_por_semana')::integer NOT BETWEEN 1 AND 7 THEN RAISE EXCEPTION 'CAPACITY_REQUIRED'; END IF;
 audience:=CASE m1->>'publico_principal' WHEN 'casal' THEN 'casais' WHEN 'familia' THEN 'familias' WHEN 'corporativo' THEN 'negocios' ELSE m1->>'publico_principal' END;
 vals:=jsonb_build_object('brand_name',m1->>'nome','location_hint',(m1->>'cidade')||'/'||(m1->>'estado'),'highlight_name',m2->>'lugar_bonito','highlight_detail',m2->>'detalhe_confirmado','service_rule',m2->>'condicoes_confirmadas');
 FOR k,v IN SELECT * FROM jsonb_each_text(vals) LOOP
  IF coalesce(trim(v),'')<>'' THEN f:=f||jsonb_build_object(k,jsonb_build_object('value',trim(v),'confirmed',coalesce(m2->'fatos_confirmados'='true'::jsonb,false),'source','Informado e confirmado pelo proprietário no onboarding','valid_until',coalesce(m2->>'fatos_validos_ate',''))); END IF;
 END LOOP;
 vals:=jsonb_build_object('cta','Consulte datas e condições com a hospedagem. Solicitar informações não confirma reserva.','visitor_tip','Confirme condições diretamente com a hospedagem antes de planejar.','tone_open',CASE tone WHEN 'acolhedor' THEN 'Conheça nossa hospedagem com calma.' WHEN 'direto' THEN 'Confira as informações da hospedagem.' ELSE 'Apresentamos os detalhes da nossa hospedagem.' END);
 FOR k,v IN SELECT * FROM jsonb_each_text(vals) LOOP
  source:=CASE WHEN k='tone_open' THEN 'Tom '||initcap(tone)||' confirmado pelo proprietário; abertura editorial, não promessa factual' ELSE 'Instrução editorial do produto, não promessa factual' END;
  f:=f||jsonb_build_object(k,jsonb_build_object('value',v,'confirmed',true,'source',source,'valid_until','9999-12-31'));
 END LOOP;
 RETURN jsonb_build_object('hotel_id',h,'dna_version','hotel-recomposed:'||h::text||':r'||r,'tone',tone,'editorial_confirmed',true,'audience',audience,'preferred',jsonb_build_array('planejamento','identidade','conversa'),'avoid',avoid,'minutes',(m3->>'minutos_disponiveis')::integer,'filming',coalesce(m3->'video_disponivel'='true'::jsonb,false),'people',false,'posts_per_week',(m3->>'posts_por_semana')::integer,'facts',f);
END; $$;
REVOKE ALL ON FUNCTION public.hotel_c10_profile(jsonb,uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_c10_profile(jsonb,uuid,integer) TO hotel_c10_rpc;
CREATE OR REPLACE FUNCTION public.hotel_v2_save_onboarding(p_hotel_id uuid,p_module integer,p_snapshot jsonb,p_expected_revision integer,p_operation_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); h public.hotels%ROWTYPE; r public.onboarding_respostas%ROWTYPE;
 m1 jsonb; old_revision integer; fingerprint text; receipt jsonb; audience text; capacity integer;
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'SESSION_EXPIRED'; END IF;
 IF p_hotel_id IS NULL OR p_operation_id IS NULL OR p_module IS NULL OR p_module NOT BETWEEN 1 AND 4 OR p_expected_revision IS NULL OR p_expected_revision<0 OR jsonb_typeof(p_snapshot) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,0));
 IF (SELECT count(*) FROM public.hotels WHERE owner_id=actor)>1 THEN RAISE EXCEPTION 'AMBIGUOUS_OWNER'; END IF;
 SELECT * INTO h FROM public.hotels WHERE owner_id=actor;
 IF FOUND THEN
  IF h.id<>p_hotel_id THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
  IF h.status IS NULL OR h.status NOT IN ('lead','onboarding','ativo') THEN RAISE EXCEPTION 'WRITE_SUSPENDED'; END IF;
  SELECT * INTO h FROM public.hotels WHERE id=p_hotel_id AND owner_id=actor FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
  IF h.status IS NULL OR h.status NOT IN ('lead','onboarding','ativo') THEN RAISE EXCEPTION 'WRITE_SUSPENDED'; END IF;
 END IF;
 m1:=p_snapshot->'modulo_1';
 IF coalesce(trim(m1->>'nome'),'')='' OR coalesce(trim(m1->>'cidade'),'')='' OR coalesce(m1->>'estado','') NOT IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO') THEN RAISE EXCEPTION 'IDENTITY_REQUIRED'; END IF;
 IF (m1->>'quartos') IS NULL OR (m1->>'quartos')::integer<0 OR (m1->>'categoria') IS NULL OR (m1->>'categoria')::integer NOT BETWEEN 2 AND 5 OR (m1->>'ticket_medio') IS NULL OR (m1->>'ticket_medio')::numeric<0 THEN RAISE EXCEPTION 'INVALID_NUMERIC_FIELDS'; END IF;
 audience:=CASE m1->>'publico_principal' WHEN 'casal' THEN 'casais' WHEN 'familia' THEN 'familias' WHEN 'corporativo' THEN 'negocios' ELSE m1->>'publico_principal' END;
 IF audience IS NULL OR audience NOT IN ('casais','familias','negocios','aventureiros') THEN RAISE EXCEPTION 'AUDIENCE_REQUIRED'; END IF;
 IF h.id IS NULL THEN
  IF p_module<>1 OR p_expected_revision<>0 THEN RAISE EXCEPTION 'START_WITH_IDENTITY'; END IF;
  INSERT INTO public.hotels(id,owner_id,nome,cidade,estado,regiao,tipo,status,onboarding_completo,numero_quartos,classificacao,ticket_medio_diaria)
  VALUES(p_hotel_id,actor,trim(m1->>'nome'),trim(m1->>'cidade'),m1->>'estado',m1->>'regiao',m1->>'tipo_db','onboarding',false,(m1->>'quartos')::integer,(m1->>'categoria')::integer,(m1->>'ticket_medio')::numeric) RETURNING * INTO h;
 END IF;
 SELECT * INTO r FROM public.onboarding_respostas WHERE hotel_id=h.id FOR UPDATE;
 old_revision:=coalesce((r.respostas->'_v2'->>'revision')::integer,0);
 IF p_module=4 THEN p_snapshot:=jsonb_set(p_snapshot,'{editorial_profile}',public.hotel_c10_profile(p_snapshot,h.id,p_expected_revision+1)); END IF;
 fingerprint:=md5(jsonb_build_object('module',p_module,'snapshot',p_snapshot)::text);
 receipt:=r.respostas->'_v2'->'operations'->p_operation_id::text;
 IF receipt IS NOT NULL THEN IF receipt->>'fingerprint'<>fingerprint THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF; RETURN receipt->'result'; END IF;
 IF old_revision IS DISTINCT FROM p_expected_revision THEN RAISE EXCEPTION 'REVISION_CONFLICT'; END IF;
 IF p_module>coalesce(r.ultima_secao_completada,0)+1 THEN RAISE EXCEPTION 'PREVIOUS_MODULE_REQUIRED'; END IF;
 IF p_module>=3 AND (coalesce(p_snapshot->'modulo_3'->>'frequencia_posts','')='' OR coalesce(p_snapshot->'modulo_3'->>'responsavel_ig','')='') THEN RAISE EXCEPTION 'ROUTINE_REQUIRED'; END IF;
 IF p_module=4 THEN
  IF coalesce(p_snapshot->'modulo_4'->>'objetivo_principal','')='' OR coalesce(p_snapshot->'modulo_4'->>'prazo','')='' OR jsonb_typeof(p_snapshot->'editorial_profile') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
  capacity:=(p_snapshot->'modulo_3'->>'posts_por_semana')::integer;
  IF capacity IS NULL OR capacity NOT BETWEEN 1 AND 7 THEN RAISE EXCEPTION 'CAPACITY_REQUIRED'; END IF;
  p_snapshot:=jsonb_set(p_snapshot,'{editorial_profile,dna_version}',to_jsonb('hotel-recomposed:'||h.id::text||':r'||(old_revision+1)::text));
  p_snapshot:=jsonb_set(p_snapshot,'{editorial_profile,hotel_id}',to_jsonb(h.id::text));
  INSERT INTO public.hotel_content_preferences(hotel_id,publico_primario,posts_por_semana,stories_por_dia,temas_preferidos,formatos_preferidos,regras_extras)
  VALUES(h.id,audience,capacity,0,ARRAY['identidade','planejamento','conversa'],ARRAY['foto','carrossel'],jsonb_build_object('version',p_snapshot->'editorial_profile'->>'dna_version','profile',p_snapshot->'editorial_profile'))
  ON CONFLICT(hotel_id) DO UPDATE SET publico_primario=EXCLUDED.publico_primario,posts_por_semana=EXCLUDED.posts_por_semana,stories_por_dia=EXCLUDED.stories_por_dia,temas_preferidos=EXCLUDED.temas_preferidos,formatos_preferidos=EXCLUDED.formatos_preferidos,regras_extras=EXCLUDED.regras_extras,updated_at=now();
 END IF;
 receipt:=jsonb_build_object('hotel_id',h.id,'revision',old_revision+1,'complete',p_module=4,'module',p_module,'operation_id',p_operation_id);
 p_snapshot:=p_snapshot||jsonb_build_object('_v2',jsonb_build_object('revision',old_revision+1,'operations',coalesce(r.respostas->'_v2'->'operations','{}'::jsonb)||jsonb_build_object(p_operation_id::text,jsonb_build_object('fingerprint',fingerprint,'result',receipt))));
 INSERT INTO public.onboarding_respostas(hotel_id,respostas,completado,progresso_percent,ultima_secao_completada) VALUES(h.id,p_snapshot,p_module=4,p_module*25,p_module)
 ON CONFLICT(hotel_id) DO UPDATE SET respostas=EXCLUDED.respostas,completado=EXCLUDED.completado,progresso_percent=EXCLUDED.progresso_percent,ultima_secao_completada=EXCLUDED.ultima_secao_completada;
 UPDATE public.hotels SET nome=trim(m1->>'nome'),cidade=trim(m1->>'cidade'),estado=m1->>'estado',regiao=m1->>'regiao',tipo=m1->>'tipo_db',numero_quartos=(m1->>'quartos')::integer,classificacao=(m1->>'categoria')::integer,ticket_medio_diaria=(m1->>'ticket_medio')::numeric,status=CASE WHEN p_module=4 THEN 'ativo' ELSE 'onboarding' END,onboarding_completo=(p_module=4) WHERE id=h.id AND owner_id=actor;
 IF p_module=4 THEN INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(h.id,'onboarding_completo','perfil',jsonb_build_object('operation_id',p_operation_id,'revision',old_revision+1),0); END IF;
 RETURN receipt;
END; $$;
ALTER FUNCTION public.hotel_v2_save_onboarding(uuid,integer,jsonb,integer,uuid) SECURITY DEFINER;
ALTER FUNCTION public.hotel_v2_save_onboarding(uuid,integer,jsonb,integer,uuid) OWNER TO hotel_c10_rpc;
REVOKE ALL ON FUNCTION public.hotel_v2_save_onboarding(uuid,integer,jsonb,integer,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_v2_save_onboarding(uuid,integer,jsonb,integer,uuid) TO authenticated;
ALTER FUNCTION public.hotel_v2_create_window(uuid,date,jsonb,uuid) SECURITY DEFINER;
ALTER FUNCTION public.hotel_v2_create_window(uuid,date,jsonb,uuid) OWNER TO hotel_c10_rpc;
REVOKE ALL ON FUNCTION public.hotel_v2_create_window(uuid,date,jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_v2_create_window(uuid,date,jsonb,uuid) TO authenticated;
ALTER FUNCTION public.hotel_v2_edit_draft(uuid,text,integer,jsonb) SECURITY DEFINER;
ALTER FUNCTION public.hotel_v2_edit_draft(uuid,text,integer,jsonb) OWNER TO hotel_c10_rpc;
REVOKE ALL ON FUNCTION public.hotel_v2_edit_draft(uuid,text,integer,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_v2_edit_draft(uuid,text,integer,jsonb) TO authenticated;
ALTER FUNCTION public.hotel_v2_record_export(uuid,text,integer,uuid) SECURITY DEFINER;
ALTER FUNCTION public.hotel_v2_record_export(uuid,text,integer,uuid) OWNER TO hotel_c10_rpc;
REVOKE ALL ON FUNCTION public.hotel_v2_record_export(uuid,text,integer,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_v2_record_export(uuid,text,integer,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_v2_required_facts(text,integer),public.hotel_v2_checked_facts(text,integer,jsonb,date) TO hotel_c10_rpc;
CREATE OR REPLACE FUNCTION public.hotel_v2_checked_facts(p_template_id text,p_version integer,p_profile jsonb,p_usage_date date)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE required_keys text[]; required_key text; current_fact jsonb; trusted_facts jsonb:='{}'::jsonb; meta jsonb; catalog jsonb:=$catalog${"HO-TPL-001": {"version": 1, "pillar": "acomodacao", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-002": {"version": 1, "pillar": "acomodacao", "production_minutes": 15, "requires_filming": true, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-003": {"version": 1, "pillar": "conversa", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-004": {"version": 1, "pillar": "planejamento", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-005": {"version": 1, "pillar": "identidade", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-006": {"version": 1, "pillar": "confianca", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-007": {"version": 1, "pillar": "hospitalidade", "production_minutes": 10, "requires_filming": true, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-008": {"version": 1, "pillar": "planejamento", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-009": {"version": 1, "pillar": "confianca", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-010": {"version": 1, "pillar": "ambiente", "production_minutes": 10, "requires_filming": true, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-011": {"version": 1, "pillar": "planejamento", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-012": {"version": 1, "pillar": "destino", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-013": {"version": 1, "pillar": "bastidores", "production_minutes": 15, "requires_filming": true, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-014": {"version": 1, "pillar": "conversa", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}, "HO-TPL-016": {"version": 1, "pillar": "conversa", "production_minutes": 5, "requires_filming": false, "requires_people": false, "audience_tags": ["aventureiros", "casais", "familias", "moradores", "negocios", "turistas"]}}$catalog$::jsonb;
BEGIN
 meta:=catalog->p_template_id;
 IF meta IS NULL OR p_profile->'editorial_confirmed' IS DISTINCT FROM 'true'::jsonb OR (p_profile->>'tone') IS NULL OR p_profile->>'tone' NOT IN ('acolhedor','direto','elegante') OR jsonb_typeof(p_profile->'avoid') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'EDITORIAL_CONFIRMATION_REQUIRED'; END IF;
 IF p_profile->'avoid' ? (meta->>'pillar') OR NOT coalesce(meta->'audience_tags' ? (p_profile->>'audience'),false) OR coalesce((p_profile->>'minutes')::integer,0)<(meta->>'production_minutes')::integer OR (meta->'requires_filming'='true'::jsonb AND p_profile->'filming' IS DISTINCT FROM 'true'::jsonb) OR (meta->'requires_people'='true'::jsonb AND p_profile->'people' IS DISTINCT FROM 'true'::jsonb) THEN RAISE EXCEPTION 'TEMPLATE_INELIGIBLE'; END IF;
 required_keys:=public.hotel_v2_required_facts(p_template_id,p_version);
 IF jsonb_typeof(p_profile->'facts') IS DISTINCT FROM 'object' OR p_usage_date IS NULL THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
 FOREACH required_key IN ARRAY required_keys LOOP
  current_fact:=p_profile->'facts'->required_key;
  IF jsonb_typeof(current_fact) IS DISTINCT FROM 'object' OR current_fact->'confirmed' IS DISTINCT FROM 'true'::jsonb OR coalesce(trim(current_fact->>'value'),'')='' OR coalesce(trim(current_fact->>'source'),'')='' OR (current_fact->>'valid_until') IS NULL OR (current_fact->>'valid_until')::date<p_usage_date THEN RAISE EXCEPTION 'STALE_FACT_SNAPSHOT'; END IF;
  trusted_facts:=trusted_facts||jsonb_build_object(required_key,current_fact);
 END LOOP;
 RETURN trusted_facts;
END; $$;
CREATE FUNCTION public.hotel_c10_manual_draft(p_hotel_id uuid,p_form jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result uuid; fmt text:=p_form->>'formato'; day date;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF fmt IS NULL OR fmt NOT IN ('foto','carrossel','story','reel') OR coalesce(length(trim(p_form->>'legenda_completa')),0) NOT BETWEEN 1 AND 20000 OR coalesce(p_form->>'data_post','') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'INVALID_DRAFT'; END IF;
 day:=(p_form->>'data_post')::date;
 INSERT INTO public.calendarios_gerados(hotel_id,data_post,formato,tipo,categoria,hook,legenda_completa,hashtags,status)
 VALUES(p_hotel_id,day,fmt,CASE fmt WHEN 'story' THEN 'story' WHEN 'reel' THEN 'reel' ELSE 'feed' END,p_form->>'tema',p_form->>'hook',p_form->>'legenda_completa',regexp_split_to_array(coalesce(p_form->>'hashtags',''),'[\s,]+'),'rascunho') RETURNING id INTO result;
 RETURN result;
END; $$;
ALTER FUNCTION public.hotel_c10_manual_draft(uuid,jsonb) OWNER TO hotel_c10_rpc;
REVOKE ALL ON FUNCTION public.hotel_c10_manual_draft(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_c10_manual_draft(uuid,jsonb) TO authenticated;
CREATE FUNCTION public.hotel_c10_owner_report(p_hotel_id uuid,p_kind text,p_target text,p_done boolean DEFAULT true) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE row_id uuid; event jsonb;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND OR p_done IS NULL THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF p_kind='task' THEN
  PERFORM 1 FROM public.hotel_weekly_tasks WHERE id=p_target::uuid AND hotel_id=p_hotel_id AND done IS NOT DISTINCT FROM p_done FOR UPDATE;
  IF FOUND THEN RETURN jsonb_build_object('unchanged',true,'source','OWNER_REPORTED'); END IF;
  UPDATE public.hotel_weekly_tasks SET done=p_done,done_at=CASE WHEN p_done THEN now() ELSE NULL END WHERE id=p_target::uuid AND hotel_id=p_hotel_id RETURNING id INTO row_id;
  IF row_id IS NULL THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 ELSIF p_kind='post' THEN
  PERFORM 1 FROM public.calendarios_gerados WHERE id=p_target::uuid AND hotel_id=p_hotel_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
  -- Only the owner's report, never platform-confirmed publication or a v2 rewrite.
 ELSIF p_kind='campaign' THEN
  IF p_target IS NULL OR length(p_target) NOT BETWEEN 1 AND 120 THEN RAISE EXCEPTION 'INVALID_REPORT'; END IF;
 ELSE RAISE EXCEPTION 'INVALID_REPORT'; END IF;
 event:=jsonb_build_object('source','OWNER_REPORTED','kind',p_kind,'target',p_target,'done',p_done,'not_verified',true);
 IF p_kind='task' OR NOT EXISTS(SELECT 1 FROM public.hotel_execution_log WHERE hotel_id=p_hotel_id AND acao='owner_reported' AND detalhes=event) THEN
  INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(p_hotel_id,'owner_reported','conteudo',event,0);
 END IF;
 RETURN event;
END; $$;
ALTER FUNCTION public.hotel_c10_owner_report(uuid,text,text,boolean) OWNER TO hotel_c10_rpc;
REVOKE ALL ON FUNCTION public.hotel_c10_owner_report(uuid,text,text,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_c10_owner_report(uuid,text,text,boolean) TO authenticated;
GRANT UPDATE ON public.hotel_weekly_tasks TO hotel_c10_rpc;
CREATE FUNCTION public.hotel_c10_claim_check(title text,body text) RETURNS void
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
BEGIN
 IF coalesce(title,'')||' '||coalesce(body,'') ~* '(últimas? vagas?|[5５][[:space:]]*(estrelas?|⭐|★)|cinco estrelas|garant(ia|ido)|menor tarifa|melhor hospedagem|[0-9]+%|viraliza)' THEN RAISE EXCEPTION 'UNSUPPORTED_CLAIM'; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.hotel_c10_claim_check(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_c10_claim_check(text,text) TO hotel_c10_rpc;
CREATE OR REPLACE FUNCTION public.hotel_v2_create_window(p_hotel_id uuid,p_anchor date,p_drafts jsonb,p_operation_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE h public.hotels%ROWTYPE; count_rows integer; item jsonb; prior jsonb; fingerprint text; idx integer:=0; profile jsonb; trusted_facts jsonb; catalog jsonb:=$metadata${"HO-TPL-001": {"production_minutes": 5, "format": "caption"}, "HO-TPL-002": {"production_minutes": 15, "format": "reel_script"}, "HO-TPL-003": {"production_minutes": 5, "format": "stories"}, "HO-TPL-004": {"production_minutes": 5, "format": "carousel"}, "HO-TPL-005": {"production_minutes": 5, "format": "caption"}, "HO-TPL-006": {"production_minutes": 5, "format": "stories"}, "HO-TPL-007": {"production_minutes": 10, "format": "reel_script"}, "HO-TPL-008": {"production_minutes": 5, "format": "caption"}, "HO-TPL-009": {"production_minutes": 5, "format": "carousel"}, "HO-TPL-010": {"production_minutes": 10, "format": "reel_script"}, "HO-TPL-011": {"production_minutes": 5, "format": "stories"}, "HO-TPL-012": {"production_minutes": 5, "format": "caption"}, "HO-TPL-013": {"production_minutes": 15, "format": "reel_script"}, "HO-TPL-014": {"production_minutes": 5, "format": "stories"}, "HO-TPL-016": {"production_minutes": 5, "format": "carousel"}}$metadata$::jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'SESSION_EXPIRED'; END IF;
 SELECT * INTO h FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() FOR UPDATE;
 IF NOT FOUND OR h.status IS DISTINCT FROM 'ativo' OR h.onboarding_completo IS DISTINCT FROM true THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
 IF p_operation_id IS NULL OR p_anchor IS NULL OR jsonb_typeof(p_drafts) IS DISTINCT FROM 'array' OR jsonb_array_length(p_drafts)<>7 THEN RAISE EXCEPTION 'INVALID_WINDOW'; END IF;
 fingerprint:=md5(jsonb_build_object('anchor',p_anchor,'drafts',p_drafts)::text);
 SELECT v2 INTO prior FROM public.calendarios_gerados WHERE hotel_id=h.id AND v2->>'operation_id'=p_operation_id::text LIMIT 1;
 IF prior IS NOT NULL AND prior->>'input_fingerprint'<>fingerprint THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
 SELECT count(*) INTO count_rows FROM public.calendarios_gerados WHERE hotel_id=h.id AND v2->>'anchor'=p_anchor::text;
 IF count_rows=7 THEN RETURN jsonb_build_object('preserved',true); END IF;
 IF count_rows<>0 THEN RAISE EXCEPTION 'INCOMPLETE_WINDOW'; END IF;
 IF(SELECT count(DISTINCT x->>'template_id') FROM jsonb_array_elements(p_drafts)x)<>7 THEN RAISE EXCEPTION 'DUPLICATE_TEMPLATE'; END IF;
 SELECT regras_extras->'profile' INTO profile FROM public.hotel_content_preferences WHERE hotel_id=h.id;
 IF(profile->>'hotel_id') IS DISTINCT FROM h.id::text THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(p_drafts) LOOP
  IF(item->>'id') IS DISTINCT FROM(h.id::text||':'||p_anchor::text||':'||idx::text) OR(item->>'date')::date IS DISTINCT FROM p_anchor+idx OR coalesce(item->>'text','')='' OR(item->>'revision')::integer IS DISTINCT FROM 1 OR item->>'state' IS DISTINCT FROM 'DRAFT' THEN RAISE EXCEPTION 'INVALID_DRAFT'; END IF;
  IF item->>'format' IS DISTINCT FROM catalog->(item->>'template_id')->>'format' OR (item->>'minutes')::integer IS DISTINCT FROM (catalog->(item->>'template_id')->>'production_minutes')::integer OR item->>'intention' IS DISTINCT FROM (CASE WHEN idx<(profile->>'posts_per_week')::integer THEN 'sugerir_publicacao' ELSE 'preparar' END) THEN RAISE EXCEPTION 'DRAFT_METADATA_MISMATCH'; END IF;
  PERFORM public.hotel_c10_claim_check(item->>'title',item->>'text');
  trusted_facts:=public.hotel_v2_checked_facts(item->>'template_id',(item->>'template_version')::integer,profile,greatest((now() AT TIME ZONE 'America/Fortaleza')::date,p_anchor+idx));
  IF(item->'facts_used') IS DISTINCT FROM trusted_facts OR(item->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') OR coalesce(item->'editorial_review','null'::jsonb)<>'null'::jsonb THEN RAISE EXCEPTION 'FACT_SET_MISMATCH'; END IF;
  INSERT INTO public.calendarios_gerados(hotel_id,data_post,tipo,formato,hook,legenda_completa,status,categoria,v2)
  VALUES(h.id,p_anchor+idx,CASE item->>'format' WHEN 'stories' THEN 'story' WHEN 'reel_script' THEN 'reel' ELSE 'feed' END,CASE item->>'format' WHEN 'caption' THEN 'foto' WHEN 'carousel' THEN 'carrossel' WHEN 'stories' THEN 'story' WHEN 'reel_script' THEN 'reel' END,item->>'title',item->>'text','rascunho','hotel-recomposed',jsonb_build_object('anchor',p_anchor,'operation_id',p_operation_id,'input_fingerprint',fingerprint,'draft',item));
  idx:=idx+1;
 END LOOP;
 INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(h.id,'plano_criado','planejamento',jsonb_build_object('anchor',p_anchor,'operation_id',p_operation_id),0);
 RETURN jsonb_build_object('preserved',false);
END; $$;
CREATE OR REPLACE FUNCTION public.hotel_v2_edit_draft(p_hotel_id uuid,p_draft_id text,p_expected_revision integer,p_reviewed_draft jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE row public.calendarios_gerados%ROWTYPE; draft jsonb; profile jsonb; trusted_facts jsonb; new_title text;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
 IF p_expected_revision IS NULL OR p_expected_revision<1 OR coalesce(length(trim(p_reviewed_draft->>'text')),0) NOT BETWEEN 1 AND 20000 THEN RAISE EXCEPTION 'INVALID_TEXT'; END IF;
 SELECT * INTO row FROM public.calendarios_gerados WHERE hotel_id=p_hotel_id AND v2->'draft'->>'id'=p_draft_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 draft:=row.v2->'draft';
 new_title:=CASE WHEN p_reviewed_draft ? 'title' THEN p_reviewed_draft->>'title' ELSE draft->>'title' END;
 IF (p_reviewed_draft ? 'title' AND jsonb_typeof(p_reviewed_draft->'title')<>'string') OR new_title IS NULL OR length(btrim(new_title, U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF'))<1 OR length(new_title)>240 THEN RAISE EXCEPTION 'INVALID_TITLE'; END IF;
 IF(draft->>'revision')::integer IS DISTINCT FROM p_expected_revision THEN RAISE EXCEPTION 'REVISION_CONFLICT'; END IF;
 IF(p_reviewed_draft->>'id') IS DISTINCT FROM p_draft_id OR(p_reviewed_draft->>'revision')::integer IS DISTINCT FROM p_expected_revision+1 OR(p_reviewed_draft->>'template_id') IS DISTINCT FROM(draft->>'template_id') THEN RAISE EXCEPTION 'INVALID_DRAFT'; END IF;
 -- Unapproved edits preserve stored factual provenance even when DNA is missing.
 trusted_facts:=draft->'facts_used';
 IF p_reviewed_draft->'editorial_review' IS NOT NULL AND p_reviewed_draft->'editorial_review'<>'null'::jsonb THEN
  PERFORM public.hotel_c10_claim_check(new_title,p_reviewed_draft->>'text');
  SELECT regras_extras->'profile' INTO profile FROM public.hotel_content_preferences WHERE hotel_id=p_hotel_id;
  IF(profile->>'hotel_id') IS DISTINCT FROM p_hotel_id::text THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
  trusted_facts:=public.hotel_v2_checked_facts(draft->>'template_id',(draft->>'template_version')::integer,profile,greatest((now() AT TIME ZONE 'America/Fortaleza')::date,(draft->>'date')::date));
  IF(p_reviewed_draft->'facts_used') IS DISTINCT FROM trusted_facts THEN RAISE EXCEPTION 'FACT_SET_MISMATCH'; END IF;
  IF(p_reviewed_draft->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') OR(p_reviewed_draft->'editorial_review'->>'exact_text') IS DISTINCT FROM(p_reviewed_draft->>'text') OR(p_reviewed_draft->'editorial_review'->>'revision')::integer IS DISTINCT FROM p_expected_revision+1 OR(p_reviewed_draft->'editorial_review'->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') OR(p_reviewed_draft->'editorial_review'->>'reviewed_on') IS NULL THEN RAISE EXCEPTION 'INVALID_REVIEW'; END IF;
  IF (p_reviewed_draft->'editorial_review'->>'exact_title') IS DISTINCT FROM new_title THEN RAISE EXCEPTION 'INVALID_REVIEW_TITLE'; END IF;
  p_reviewed_draft:=jsonb_set(p_reviewed_draft,'{editorial_review,actor_id}',to_jsonb(auth.uid()::text));
 ELSE
  p_reviewed_draft:=jsonb_set(p_reviewed_draft,'{dna_version}',draft->'dna_version');
 END IF;
 draft:=draft||jsonb_build_object('title',new_title,'text',p_reviewed_draft->>'text','revision',p_expected_revision+1,'state','DRAFT','facts_used',trusted_facts,'dna_version',p_reviewed_draft->>'dna_version','editorial_review',p_reviewed_draft->'editorial_review');
 UPDATE public.calendarios_gerados SET v2=jsonb_set(v2,'{draft}',draft),hook=draft->>'title',legenda_completa=draft->>'text' WHERE id=row.id;
 INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(p_hotel_id,'rascunho_editado','conteudo',jsonb_build_object('draft_id',p_draft_id,'revision',p_expected_revision+1),0);
 RETURN draft;
END; $$;
CREATE OR REPLACE FUNCTION public.hotel_v2_record_export(p_hotel_id uuid,p_draft_id text,p_expected_revision integer,p_operation_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE draft jsonb; profile jsonb; prior jsonb; usage_date date; trusted_facts jsonb;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND OR p_operation_id IS NULL THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
 SELECT v2->'draft' INTO draft FROM public.calendarios_gerados WHERE hotel_id=p_hotel_id AND v2->'draft'->>'id'=p_draft_id FOR UPDATE;
 SELECT regras_extras->'profile' INTO profile FROM public.hotel_content_preferences WHERE hotel_id=p_hotel_id;
 IF draft IS NULL OR(draft->>'revision')::integer IS DISTINCT FROM p_expected_revision OR(draft->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') THEN RAISE EXCEPTION 'REVISION_CONFLICT'; END IF;
 IF(draft->'editorial_review'->>'exact_text') IS DISTINCT FROM(draft->>'text') OR(draft->'editorial_review'->>'actor_id') IS DISTINCT FROM auth.uid()::text OR(draft->'editorial_review'->>'revision')::integer IS DISTINCT FROM p_expected_revision OR(draft->'editorial_review'->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') THEN RAISE EXCEPTION 'EXACT_REVIEW_REQUIRED'; END IF;
 IF draft->'editorial_review' ? 'exact_title' AND (draft->'editorial_review'->>'exact_title') IS DISTINCT FROM (draft->>'title') THEN RAISE EXCEPTION 'EXACT_REVIEW_TITLE_REQUIRED'; END IF;
 PERFORM public.hotel_c10_claim_check(draft->>'title',draft->>'text');
 usage_date:=greatest((now() AT TIME ZONE 'America/Fortaleza')::date,(draft->>'date')::date);
 IF(profile->>'hotel_id') IS DISTINCT FROM p_hotel_id::text THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
 trusted_facts:=public.hotel_v2_checked_facts(draft->>'template_id',(draft->>'template_version')::integer,profile,usage_date);
 IF(draft->'facts_used') IS DISTINCT FROM trusted_facts THEN RAISE EXCEPTION 'FACT_SET_MISMATCH'; END IF;
 SELECT detalhes INTO prior FROM public.hotel_execution_log WHERE hotel_id=p_hotel_id AND acao='exportado' AND detalhes->>'operation_id'=p_operation_id::text;
 IF prior IS NOT NULL THEN IF(prior->>'draft_id') IS DISTINCT FROM p_draft_id OR(prior->>'revision')::integer IS DISTINCT FROM p_expected_revision THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF; RETURN jsonb_build_object('recorded',true); END IF;
 INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(p_hotel_id,'exportado','conteudo',jsonb_build_object('draft_id',p_draft_id,'revision',p_expected_revision,'operation_id',p_operation_id,'not_published',true),0);
 RETURN jsonb_build_object('recorded',true);
END; $$;
COMMIT;
