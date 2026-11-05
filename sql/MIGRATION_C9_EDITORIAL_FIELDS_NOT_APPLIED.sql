-- C9 LAB candidate NOT_APPLIED. Run after C8B only in disposable QA.
-- Preserves owner/status/SECURITY INVOKER/search_path guards; no grants, roles or policies.
BEGIN;
CREATE OR REPLACE FUNCTION public.hotel_v2_edit_draft(p_hotel_id uuid,p_draft_id text,p_expected_revision integer,p_reviewed_draft jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
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
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE draft jsonb; profile jsonb; prior jsonb; usage_date date; trusted_facts jsonb;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND OR p_operation_id IS NULL THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
 SELECT v2->'draft' INTO draft FROM public.calendarios_gerados WHERE hotel_id=p_hotel_id AND v2->'draft'->>'id'=p_draft_id FOR UPDATE;
 SELECT regras_extras->'profile' INTO profile FROM public.hotel_content_preferences WHERE hotel_id=p_hotel_id;
 IF draft IS NULL OR(draft->>'revision')::integer IS DISTINCT FROM p_expected_revision OR(draft->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') THEN RAISE EXCEPTION 'REVISION_CONFLICT'; END IF;
 IF(draft->'editorial_review'->>'exact_text') IS DISTINCT FROM(draft->>'text') OR(draft->'editorial_review'->>'actor_id') IS DISTINCT FROM auth.uid()::text OR(draft->'editorial_review'->>'revision')::integer IS DISTINCT FROM p_expected_revision OR(draft->'editorial_review'->>'dna_version') IS DISTINCT FROM(profile->>'dna_version') THEN RAISE EXCEPTION 'EXACT_REVIEW_REQUIRED'; END IF;
 IF draft->'editorial_review' ? 'exact_title' AND (draft->'editorial_review'->>'exact_title') IS DISTINCT FROM (draft->>'title') THEN RAISE EXCEPTION 'EXACT_REVIEW_TITLE_REQUIRED'; END IF;
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
