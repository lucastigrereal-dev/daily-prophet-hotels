-- C13: disposable LAB only. Apply after C12; no historical data rewrite.
BEGIN;
CREATE FUNCTION public.hotel_c13_trim(value text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path='' AS $$ SELECT btrim(value,chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279)) $$;
CREATE FUNCTION public.hotel_c13_day(profile jsonb,instant timestamptz) RETURNS date LANGUAGE plpgsql STABLE SET search_path='' AS $$
BEGIN
 IF profile->>'timezone' IS NULL OR NOT ((profile->>'timezone')=ANY(ARRAY['America/Noronha','America/Belem','America/Fortaleza','America/Recife','America/Araguaina','America/Maceio','America/Bahia','America/Sao_Paulo','America/Campo_Grande','America/Cuiaba','America/Santarem','America/Porto_Velho','America/Boa_Vista','America/Manaus','America/Eirunepe','America/Rio_Branco'])) THEN RAISE EXCEPTION 'TIMEZONE_REQUIRED'; END IF;
 RETURN (instant AT TIME ZONE (profile->>'timezone'))::date;
END; $$;
ALTER FUNCTION public.hotel_c10_profile(jsonb,uuid,integer) RENAME TO hotel_c10_profile_prior_c13;
CREATE FUNCTION public.hotel_c10_profile(s jsonb,h uuid,r integer) RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path='' AS $$
DECLARE p jsonb; m jsonb:=s->'modulo_2'; k text;
BEGIN
 FOREACH k IN ARRAY ARRAY['lugar_bonito','detalhe_confirmado'] LOOP
 IF jsonb_typeof(m->k) IS DISTINCT FROM 'string' OR coalesce(public.hotel_c13_trim(m->>k),'')='' OR length(m->>k)>1000 THEN RAISE EXCEPTION 'ACCOMMODATION_REQUIRED'; END IF;
 END LOOP;
 FOREACH k IN ARRAY ARRAY['lugar_bonito','detalhe_confirmado','condicoes_confirmadas'] LOOP
  IF m->k IS NOT NULL AND m->k<>'null'::jsonb THEN
   IF jsonb_typeof(m->k) IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'INVALID_FACT'; END IF;
   s:=jsonb_set(s,ARRAY['modulo_2',k],to_jsonb(public.hotel_c13_trim(m->>k)));
  END IF;
 END LOOP;
 FOREACH k IN ARRAY ARRAY['nome','cidade'] LOOP
  s:=jsonb_set(s,ARRAY['modulo_1',k],to_jsonb(public.hotel_c13_trim(s->'modulo_1'->>k)));
 END LOOP;
 p:=public.hotel_c10_profile_prior_c13(s,h,r)||jsonb_build_object('timezone',s->'modulo_1'->>'timezone','accommodation',jsonb_build_object('name',public.hotel_c13_trim(m->>'lugar_bonito'),'description',public.hotel_c13_trim(m->>'detalhe_confirmado')));
 PERFORM public.hotel_c13_day(p,'2026-01-01Z'::timestamptz);
 RETURN p;
END; $$;
CREATE OR REPLACE FUNCTION public.hotel_support_authorize(h uuid,operator uuid,scope_name text,expires timestamptz,reason text,revoke boolean DEFAULT false) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid();
BEGIN
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=actor AND ativo=true) OR NOT EXISTS(SELECT 1 FROM public.hotels WHERE id=h AND owner_id=actor AND (revoke OR status='ativo')) THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF scope_name NOT IN ('diagnostico','rascunhos','historico') OR coalesce(length(public.hotel_c13_trim(reason)),0) NOT BETWEEN 5 AND 1000 OR expires IS NULL OR (NOT revoke AND (expires<=now() OR expires>now()+interval '24 hours')) OR operator IS NULL THEN RAISE EXCEPTION 'INVALID_SUPPORT_REQUEST'; END IF;
 IF NOT revoke AND NOT EXISTS(SELECT 1 FROM public.users WHERE id=operator AND ativo=true) THEN RAISE EXCEPTION 'INVALID_SUPPORT_REQUEST'; END IF;
 INSERT INTO public.hotel_support_grants VALUES(h,operator,actor,scope_name,expires,revoke)
 ON CONFLICT(hotel_id,operator_id,scope) DO UPDATE SET owner_id=actor,expires_at=expires,revoked=revoke;
 INSERT INTO public.activity_log(user_id,acao,entidade_tipo,entidade_id,detalhes) VALUES(actor,'support_authorization','hotel',h,jsonb_build_object('operator',operator,'scope',scope_name,'reason',public.hotel_c13_trim(reason),'expires',expires,'revoked',revoke));
END; $$;
CREATE OR REPLACE FUNCTION public.hotel_support_read(h uuid,scope_name text,reason text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); result jsonb; deadline timestamptz;
BEGIN
 IF actor IS NULL OR coalesce((current_setting('request.jwt.claims',true)::jsonb)->'app_metadata'->>'hotel_internal_support','false')<>'true' OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=actor AND ativo=true) THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF coalesce(length(public.hotel_c13_trim(reason)),0) NOT BETWEEN 5 AND 1000 THEN RAISE EXCEPTION 'SUPPORT_REASON_REQUIRED'; END IF;
 -- Lock the grant during read/audit; revoke serializes with this transaction.
 SELECT g.expires_at INTO deadline FROM public.hotel_support_grants g JOIN public.hotels h1 ON h1.id=g.hotel_id JOIN public.users u ON u.id=h1.owner_id AND u.ativo=true
 WHERE g.hotel_id=h AND g.operator_id=actor AND g.scope=scope_name AND g.owner_id=h1.owner_id AND NOT g.revoked AND g.expires_at>now() FOR SHARE OF g,h1;
 IF NOT FOUND OR deadline<=clock_timestamp() THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 CASE scope_name
 WHEN 'diagnostico' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('respostas',respostas,'completado',completado)),'[]') INTO result FROM public.onboarding_respostas WHERE hotel_id=h;
 WHEN 'rascunhos' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'v2',v2)),'[]') INTO result FROM public.calendarios_gerados WHERE hotel_id=h;
 WHEN 'historico' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('acao',acao,'detalhes',detalhes,'created_at',created_at)),'[]') INTO result FROM public.hotel_execution_log WHERE hotel_id=h;
 ELSE RAISE EXCEPTION 'ACCESS_DENIED'; END CASE;
 INSERT INTO public.activity_log(user_id,acao,entidade_tipo,entidade_id,detalhes) VALUES(actor,'support_read','hotel',h,jsonb_build_object('scope',scope_name,'reason',public.hotel_c13_trim(reason),'read_only',true));
 -- Audit may itself wait for a lock. Expiration must roll back its event too.
 IF deadline<=clock_timestamp() THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 RETURN result;
END; $$;
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
  trusted_facts:=public.hotel_v2_checked_facts(item->>'template_id',(item->>'template_version')::integer,profile,greatest(public.hotel_c13_day(profile,now()),p_anchor+idx));
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
  trusted_facts:=public.hotel_v2_checked_facts(draft->>'template_id',(draft->>'template_version')::integer,profile,greatest(public.hotel_c13_day(profile,now()),(draft->>'date')::date));
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
 usage_date:=greatest(public.hotel_c13_day(profile,now()),(draft->>'date')::date);
 IF(profile->>'hotel_id') IS DISTINCT FROM p_hotel_id::text THEN RAISE EXCEPTION 'PROFILE_REQUIRED'; END IF;
 trusted_facts:=public.hotel_v2_checked_facts(draft->>'template_id',(draft->>'template_version')::integer,profile,usage_date);
 IF(draft->'facts_used') IS DISTINCT FROM trusted_facts THEN RAISE EXCEPTION 'FACT_SET_MISMATCH'; END IF;
 SELECT detalhes INTO prior FROM public.hotel_execution_log WHERE hotel_id=p_hotel_id AND acao='exportado' AND detalhes->>'operation_id'=p_operation_id::text;
 IF prior IS NOT NULL THEN IF(prior->>'draft_id') IS DISTINCT FROM p_draft_id OR(prior->>'revision')::integer IS DISTINCT FROM p_expected_revision THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF; RETURN jsonb_build_object('recorded',true); END IF;
 INSERT INTO public.hotel_execution_log(hotel_id,acao,categoria,detalhes,pontos) VALUES(p_hotel_id,'exportado','conteudo',jsonb_build_object('draft_id',p_draft_id,'revision',p_expected_revision,'operation_id',p_operation_id,'not_published',true),0);
 RETURN jsonb_build_object('recorded',true);
END; $$;
REVOKE ALL ON FUNCTION public.hotel_c13_trim(text),public.hotel_c13_day(jsonb,timestamptz),public.hotel_c10_profile(jsonb,uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_c13_trim(text),public.hotel_c13_day(jsonb,timestamptz),public.hotel_c10_profile(jsonb,uuid,integer) TO hotel_c10_rpc;
COMMIT;
