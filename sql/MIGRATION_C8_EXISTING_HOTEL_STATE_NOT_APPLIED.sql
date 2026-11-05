-- C8 candidate. NOT_APPLIED to product/real database.
-- Scope: UPDATE of an existing hotel; not whole-account suspension or DELETE control.
-- Single application only: a policy-name collision aborts this transaction.
-- No grants are supplied; baseline privileges and installed policies remain separate gates.
BEGIN;
CREATE POLICY hotel_recomposed_c8_existing_state_update ON public.hotels
AS RESTRICTIVE FOR UPDATE TO authenticated
USING (owner_id=auth.uid() AND status IN ('lead','onboarding','ativo'))
WITH CHECK (owner_id=auth.uid() AND status IN ('lead','onboarding','ativo'));
-- Read authorized state before attempting a lock filtered by UPDATE policies.
-- A previously observed hotel that cannot be locked must never fall through to INSERT.
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
COMMIT;
