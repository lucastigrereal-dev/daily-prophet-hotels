-- NOVA CANDIDATA RECOMPOSTA. NOT_APPLIED. PostgreSQL/parser/auth/RLS NOT_RUN.
-- Requires DEC-DB-PRO, isolated schema/grants/policy/rollback tests and approval before applying.
-- Uses the repo's versioned tables, not an assertion about the installed database.
BEGIN;
-- Trusted, versioned text-catalog contract. Source seed SHA256:
-- 6f2475187a5f79e556cc142b26fc2b3b0408630ec08fcdca5b79e7d2db330628.
-- HO-TPL-015 is deliberately absent; changing the client cannot authorize it.
CREATE OR REPLACE FUNCTION public.hotel_v2_required_facts(p_template_id text,p_version integer)
RETURNS text[] LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF p_version IS DISTINCT FROM 1 THEN RAISE EXCEPTION 'TEMPLATE_NOT_APPROVED'; END IF;
 CASE p_template_id
 WHEN 'HO-TPL-001' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','location_hint','tone_open','visitor_tip']::text[];
 WHEN 'HO-TPL-002' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','service_rule']::text[];
 WHEN 'HO-TPL-003' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','service_rule']::text[];
 WHEN 'HO-TPL-004' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','location_hint','service_rule','visitor_tip']::text[];
 WHEN 'HO-TPL-005' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','location_hint','service_rule']::text[];
 WHEN 'HO-TPL-006' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','service_rule']::text[];
 WHEN 'HO-TPL-007' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name']::text[];
 WHEN 'HO-TPL-008' THEN RETURN ARRAY['brand_name','cta','location_hint','service_rule','visitor_tip']::text[];
 WHEN 'HO-TPL-009' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','service_rule']::text[];
 WHEN 'HO-TPL-010' THEN RETURN ARRAY['brand_name','cta','location_hint','service_rule']::text[];
 WHEN 'HO-TPL-011' THEN RETURN ARRAY['brand_name','cta','service_rule']::text[];
 WHEN 'HO-TPL-012' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','location_hint','visitor_tip']::text[];
 WHEN 'HO-TPL-013' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name']::text[];
 WHEN 'HO-TPL-014' THEN RETURN ARRAY['brand_name','cta','service_rule','visitor_tip']::text[];
 WHEN 'HO-TPL-016' THEN RETURN ARRAY['brand_name','cta','highlight_detail','highlight_name','location_hint','visitor_tip']::text[];
 ELSE RAISE EXCEPTION 'TEMPLATE_NOT_APPROVED';
 END CASE;
END; $$;
CREATE OR REPLACE FUNCTION public.hotel_v2_checked_facts(p_template_id text,p_version integer,p_profile jsonb,p_usage_date date)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE required_keys text[]; required_key text; current_fact jsonb; trusted_facts jsonb:='{}'::jsonb;
BEGIN
 required_keys:=public.hotel_v2_required_facts(p_template_id,p_version);
 IF jsonb_typeof(p_profile->'facts') IS DISTINCT FROM 'object' OR p_usage_date IS NULL THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
 FOREACH required_key IN ARRAY required_keys LOOP
  current_fact:=p_profile->'facts'->required_key;
  IF jsonb_typeof(current_fact) IS DISTINCT FROM 'object' OR current_fact->'confirmed' IS DISTINCT FROM 'true'::jsonb OR coalesce(trim(current_fact->>'value'),'')='' OR coalesce(trim(current_fact->>'source'),'')='' OR (current_fact->>'valid_until') IS NULL OR (current_fact->>'valid_until')::date<p_usage_date THEN RAISE EXCEPTION 'STALE_FACT_SNAPSHOT'; END IF;
  trusted_facts:=trusted_facts||jsonb_build_object(required_key,current_fact);
 END LOOP;
 RETURN trusted_facts;
END; $$;
CREATE OR REPLACE FUNCTION public.hotel_v2_save_onboarding(p_hotel_id uuid,p_module integer,p_snapshot jsonb,p_expected_revision integer,p_operation_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); h public.hotels%ROWTYPE; r public.onboarding_respostas%ROWTYPE;
 m1 jsonb; old_revision integer; fingerprint text; receipt jsonb; audience text; capacity integer;
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'SESSION_EXPIRED'; END IF;
 IF p_hotel_id IS NULL OR p_operation_id IS NULL OR p_module IS NULL OR p_module NOT BETWEEN 1 AND 4 OR p_expected_revision IS NULL OR p_expected_revision<0 OR jsonb_typeof(p_snapshot) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,0));
 IF (SELECT count(*) FROM public.hotels WHERE owner_id=actor)>1 THEN RAISE EXCEPTION 'AMBIGUOUS_OWNER'; END IF;
 SELECT * INTO h FROM public.hotels WHERE owner_id=actor FOR UPDATE;
 IF FOUND AND h.id<>p_hotel_id THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF h.id IS NOT NULL AND (h.status IS NULL OR h.status NOT IN ('lead','onboarding','ativo')) THEN RAISE EXCEPTION 'WRITE_SUSPENDED'; END IF;
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
ALTER TABLE public.calendarios_gerados ADD COLUMN IF NOT EXISTS v2 jsonb;
ALTER TABLE public.calendarios_gerados ENABLE ROW LEVEL SECURITY;
-- Candidate owner policies do not prove that old permissive policies/grants are safe.
CREATE POLICY hotel_recomposed_calendar_read ON public.calendarios_gerados FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid()));
CREATE POLICY hotel_recomposed_calendar_insert ON public.calendarios_gerados FOR INSERT TO authenticated WITH CHECK(EXISTS(SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status='ativo'));
CREATE POLICY hotel_recomposed_calendar_update ON public.calendarios_gerados FOR UPDATE TO authenticated USING(EXISTS(SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status='ativo')) WITH CHECK(EXISTS(SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status='ativo'));
CREATE UNIQUE INDEX hotel_recomposed_draft_id ON public.calendarios_gerados(hotel_id,((v2->'draft'->>'id'))) WHERE v2 IS NOT NULL;
CREATE OR REPLACE FUNCTION public.hotel_v2_create_window(p_hotel_id uuid,p_anchor date,p_drafts jsonb,p_operation_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE h public.hotels%ROWTYPE; count_rows integer; item jsonb; prior jsonb; fingerprint text; idx integer:=0; profile jsonb; trusted_facts jsonb;
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
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE row public.calendarios_gerados%ROWTYPE; draft jsonb; profile jsonb; trusted_facts jsonb;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
 IF p_expected_revision IS NULL OR p_expected_revision<1 OR coalesce(length(trim(p_reviewed_draft->>'text')),0) NOT BETWEEN 1 AND 20000 THEN RAISE EXCEPTION 'INVALID_TEXT'; END IF;
 SELECT * INTO row FROM public.calendarios_gerados WHERE hotel_id=p_hotel_id AND v2->'draft'->>'id'=p_draft_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 draft:=row.v2->'draft';
 IF(draft->>'revision')::integer IS DISTINCT FROM p_expected_revision THEN RAISE EXCEPTION 'REVISION_CONFLICT'; END IF;
 IF(p_reviewed_draft->>'id') IS DISTINCT FROM p_draft_id OR(p_reviewed_draft->>'revision')::integer IS DISTINCT FROM p_expected_revision+1 OR(p_reviewed_draft->>'template_id') IS DISTINCT FROM(draft->>'template_id') THEN RAISE EXCEPTION 'INVALID_DRAFT'; END IF;
 -- Unapproved edits preserve stored factual provenance even when DNA is missing.
 trusted_facts:=draft->'facts_used';
 IF p_reviewed_draft->'editorial_review' IS NOT NULL AND p_reviewed_draft->'editorial_review'<>'null'::jsonb THEN
  SELECT regras_extras->'profile' INTO profile FROM public.hotel_content_preferences WHERE hotel_id=p_hotel_id;
  IF(profile->>'hotel_id') IS DISTINCT FROM p_hotel_id::text THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
  trusted_facts:=public.hotel_v2_checked_facts(draft->>'template_id',(draft->>'template_version')::integer,profile,greatest((now() AT TIME ZONE 'America/Fortaleza')::date,(draft->>'date')::date));
  IF(p_reviewed_draft->'facts_used') IS DISTINCT FROM trusted_facts THEN RAISE EXCEPTION 'FACT_SET_MISMATCH'; END IF;
  IF(p_reviewed_draft->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') OR(p_reviewed_draft->'editorial_review'->>'exact_text') IS DISTINCT FROM(p_reviewed_draft->>'text') OR(p_reviewed_draft->'editorial_review'->>'revision')::integer IS DISTINCT FROM p_expected_revision+1 OR(p_reviewed_draft->'editorial_review'->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') OR(p_reviewed_draft->'editorial_review'->>'reviewed_on') IS NULL THEN RAISE EXCEPTION 'INVALID_REVIEW'; END IF;
  p_reviewed_draft:=jsonb_set(p_reviewed_draft,'{editorial_review,actor_id}',to_jsonb(auth.uid()::text));
 ELSE
  p_reviewed_draft:=jsonb_set(p_reviewed_draft,'{dna_version}',draft->'dna_version');
 END IF;
 draft:=draft||jsonb_build_object('text',p_reviewed_draft->>'text','revision',p_expected_revision+1,'state','DRAFT','facts_used',trusted_facts,'dna_version',p_reviewed_draft->>'dna_version','editorial_review',p_reviewed_draft->'editorial_review');
 UPDATE public.calendarios_gerados SET v2=jsonb_set(v2,'{draft}',draft),legenda_completa=draft->>'text' WHERE id=row.id;
 INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(p_hotel_id,'rascunho_editado','conteudo',jsonb_build_object('draft_id',p_draft_id,'revision',p_expected_revision+1),0);
 RETURN draft;
END; $$;
CREATE UNIQUE INDEX hotel_recomposed_export_operation ON public.hotel_execution_log(hotel_id,((detalhes->>'operation_id'))) WHERE acao='exportado' AND detalhes ? 'operation_id';
CREATE OR REPLACE FUNCTION public.hotel_v2_record_export(p_hotel_id uuid,p_draft_id text,p_expected_revision integer,p_operation_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE draft jsonb; profile jsonb; prior jsonb; usage_date date; trusted_facts jsonb;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND OR p_operation_id IS NULL THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
 SELECT v2->'draft' INTO draft FROM public.calendarios_gerados WHERE hotel_id=p_hotel_id AND v2->'draft'->>'id'=p_draft_id FOR UPDATE;
 SELECT regras_extras->'profile' INTO profile FROM public.hotel_content_preferences WHERE hotel_id=p_hotel_id;
 IF draft IS NULL OR(draft->>'revision')::integer IS DISTINCT FROM p_expected_revision OR(draft->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') THEN RAISE EXCEPTION 'REVISION_CONFLICT'; END IF;
 IF(draft->'editorial_review'->>'exact_text') IS DISTINCT FROM(draft->>'text') OR(draft->'editorial_review'->>'actor_id') IS DISTINCT FROM auth.uid()::text OR(draft->'editorial_review'->>'revision')::integer IS DISTINCT FROM p_expected_revision OR(draft->'editorial_review'->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') THEN RAISE EXCEPTION 'EXACT_REVIEW_REQUIRED'; END IF;
 usage_date:=greatest((now() AT TIME ZONE 'America/Fortaleza')::date,(draft->>'date')::date);
 IF(profile->>'hotel_id') IS DISTINCT FROM p_hotel_id::text THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
 trusted_facts:=public.hotel_v2_checked_facts(draft->>'template_id',(draft->>'template_version')::integer,profile,usage_date);
 IF(draft->'facts_used') IS DISTINCT FROM trusted_facts THEN RAISE EXCEPTION 'FACT_SET_MISMATCH'; END IF;
 SELECT detalhes INTO prior FROM public.hotel_execution_log WHERE hotel_id=p_hotel_id AND acao='exportado' AND detalhes->>'operation_id'=p_operation_id::text;
 IF prior IS NOT NULL THEN IF(prior->>'draft_id') IS DISTINCT FROM p_draft_id OR(prior->>'revision')::integer IS DISTINCT FROM p_expected_revision THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF; RETURN jsonb_build_object('recorded',true); END IF;
 INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(p_hotel_id,'exportado','conteudo',jsonb_build_object('draft_id',p_draft_id,'revision',p_expected_revision,'operation_id',p_operation_id,'not_published',true),0);
 RETURN jsonb_build_object('recorded',true);
END; $$;
REVOKE ALL ON FUNCTION public.hotel_v2_required_facts(text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hotel_v2_checked_facts(text,integer,jsonb,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hotel_v2_required_facts(text,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_v2_checked_facts(text,integer,jsonb,date) TO authenticated;
REVOKE ALL ON FUNCTION public.hotel_v2_save_onboarding(uuid,integer,jsonb,integer,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hotel_v2_create_window(uuid,date,jsonb,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hotel_v2_edit_draft(uuid,text,integer,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hotel_v2_record_export(uuid,text,integer,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hotel_v2_save_onboarding(uuid,integer,jsonb,integer,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_v2_create_window(uuid,date,jsonb,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_v2_edit_draft(uuid,text,integer,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_v2_record_export(uuid,text,integer,uuid) TO authenticated;
COMMIT;
