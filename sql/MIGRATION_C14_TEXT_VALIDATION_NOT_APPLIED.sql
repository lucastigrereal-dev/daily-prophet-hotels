-- C14: append after C13 in disposable synthetic LAB only. Existing drafts are not rewritten.
BEGIN;
CREATE OR REPLACE FUNCTION public.hotel_v2_edit_draft(p_hotel_id uuid,p_draft_id text,p_expected_revision integer,p_reviewed_draft jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE row public.calendarios_gerados%ROWTYPE; draft jsonb; profile jsonb; trusted_facts jsonb; new_title text;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'WRITE_SUSPENDED_OR_ACCESS_DENIED'; END IF;
 IF jsonb_typeof(p_reviewed_draft->'text') IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'INVALID_TEXT'; END IF;
 IF p_expected_revision IS NULL OR p_expected_revision<1 OR coalesce(length(public.hotel_c13_trim(p_reviewed_draft->>'text')),0) NOT BETWEEN 1 AND 20000 THEN RAISE EXCEPTION 'INVALID_TEXT'; END IF;
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
CREATE OR REPLACE FUNCTION public.hotel_c10_claim_check(title text,body text) RETURNS void
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
BEGIN
 IF position('{{' in coalesce(title,'')||coalesce(body,''))>0 OR position('}}' in coalesce(title,'')||coalesce(body,''))>0 THEN RAISE EXCEPTION 'UNRESOLVED_PLACEHOLDER'; END IF;
 IF coalesce(title,'')||' '||coalesce(body,'') ~* '(últimas? vagas?|[5５][[:space:]]*(estrelas?|⭐|★)|cinco estrelas|garant(ia|ido)|menor tarifa|melhor hospedagem|[0-9]+%|viraliza)' THEN RAISE EXCEPTION 'UNSUPPORTED_CLAIM'; END IF;
END; $$;
CREATE OR REPLACE FUNCTION public.hotel_c10_manual_draft(p_hotel_id uuid,p_form jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result uuid; fmt text:=p_form->>'formato'; day date;
BEGIN
 PERFORM 1 FROM public.hotels WHERE id=p_hotel_id AND owner_id=auth.uid() AND status='ativo' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF jsonb_typeof(p_form->'legenda_completa') IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'INVALID_DRAFT'; END IF;
 IF fmt IS NULL OR fmt NOT IN ('foto','carrossel','story','reel') OR coalesce(length(public.hotel_c13_trim(p_form->>'legenda_completa')),0) NOT BETWEEN 1 AND 20000 OR coalesce(p_form->>'data_post','') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'INVALID_DRAFT'; END IF;
 day:=(p_form->>'data_post')::date;
 INSERT INTO public.calendarios_gerados(hotel_id,data_post,formato,tipo,categoria,hook,legenda_completa,hashtags,status)
 VALUES(p_hotel_id,day,fmt,CASE fmt WHEN 'story' THEN 'story' WHEN 'reel' THEN 'reel' ELSE 'feed' END,p_form->>'tema',p_form->>'hook',p_form->>'legenda_completa',regexp_split_to_array(coalesce(p_form->>'hashtags',''),'[\s,]+'),'rascunho') RETURNING id INTO result;
 RETURN result;
END; $$;
COMMIT;
