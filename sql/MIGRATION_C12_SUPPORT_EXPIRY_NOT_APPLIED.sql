-- Append only in disposable LAB. Preserve C11; enforce expiry after lock and audit waits.
BEGIN;
CREATE OR REPLACE FUNCTION public.hotel_support_read(h uuid,scope_name text,reason text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); result jsonb; deadline timestamptz;
BEGIN
 IF actor IS NULL OR coalesce((current_setting('request.jwt.claims',true)::jsonb)->'app_metadata'->>'hotel_internal_support','false')<>'true' OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=actor AND ativo=true) THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF coalesce(length(trim(reason)),0) NOT BETWEEN 5 AND 1000 THEN RAISE EXCEPTION 'SUPPORT_REASON_REQUIRED'; END IF;
 -- Lock the grant during read/audit; revoke serializes with this transaction.
 SELECT g.expires_at INTO deadline FROM public.hotel_support_grants g JOIN public.hotels h1 ON h1.id=g.hotel_id JOIN public.users u ON u.id=h1.owner_id AND u.ativo=true
 WHERE g.hotel_id=h AND g.operator_id=actor AND g.scope=scope_name AND g.owner_id=h1.owner_id AND NOT g.revoked AND g.expires_at>now() FOR SHARE OF g,h1;
 IF NOT FOUND OR deadline<=clock_timestamp() THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 CASE scope_name
 WHEN 'diagnostico' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('respostas',respostas,'completado',completado)),'[]') INTO result FROM public.onboarding_respostas WHERE hotel_id=h;
 WHEN 'rascunhos' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'v2',v2)),'[]') INTO result FROM public.calendarios_gerados WHERE hotel_id=h;
 WHEN 'historico' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('acao',acao,'detalhes',detalhes,'created_at',created_at)),'[]') INTO result FROM public.hotel_execution_log WHERE hotel_id=h;
 ELSE RAISE EXCEPTION 'ACCESS_DENIED'; END CASE;
 INSERT INTO public.activity_log(user_id,acao,entidade_tipo,entidade_id,detalhes) VALUES(actor,'support_read','hotel',h,jsonb_build_object('scope',scope_name,'reason',trim(reason),'read_only',true));
 -- Audit may itself wait for a lock. Expiration must roll back its event too.
 IF deadline<=clock_timestamp() THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 RETURN result;
END; $$;
COMMIT;
