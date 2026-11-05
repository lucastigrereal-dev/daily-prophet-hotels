-- Disposable LAB only. Explicit owner authorization, read-only support, no impersonation.
BEGIN;
CREATE TABLE public.hotel_support_grants (
 hotel_id uuid NOT NULL REFERENCES public.hotels(id),operator_id uuid NOT NULL REFERENCES public.users(id),
 owner_id uuid NOT NULL REFERENCES public.users(id),scope text NOT NULL CHECK(scope IN ('diagnostico','rascunhos','historico')),
 expires_at timestamptz NOT NULL,revoked boolean NOT NULL DEFAULT false,PRIMARY KEY(hotel_id,operator_id,scope)
);
ALTER TABLE public.hotel_support_grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.hotel_support_grants FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.hotel_support_authorize(h uuid,operator uuid,scope_name text,expires timestamptz,reason text,revoke boolean DEFAULT false) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid();
BEGIN
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=actor AND ativo=true) OR NOT EXISTS(SELECT 1 FROM public.hotels WHERE id=h AND owner_id=actor AND (revoke OR status='ativo')) THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF scope_name NOT IN ('diagnostico','rascunhos','historico') OR coalesce(length(trim(reason)),0) NOT BETWEEN 5 AND 1000 OR expires IS NULL OR (NOT revoke AND (expires<=now() OR expires>now()+interval '24 hours')) OR operator IS NULL THEN RAISE EXCEPTION 'INVALID_SUPPORT_REQUEST'; END IF;
 IF NOT revoke AND NOT EXISTS(SELECT 1 FROM public.users WHERE id=operator AND ativo=true) THEN RAISE EXCEPTION 'INVALID_SUPPORT_REQUEST'; END IF;
 INSERT INTO public.hotel_support_grants VALUES(h,operator,actor,scope_name,expires,revoke)
 ON CONFLICT(hotel_id,operator_id,scope) DO UPDATE SET owner_id=actor,expires_at=expires,revoked=revoke;
 INSERT INTO public.activity_log(user_id,acao,entidade_tipo,entidade_id,detalhes) VALUES(actor,'support_authorization','hotel',h,jsonb_build_object('operator',operator,'scope',scope_name,'reason',trim(reason),'expires',expires,'revoked',revoke));
END; $$;
CREATE FUNCTION public.hotel_support_read(h uuid,scope_name text,reason text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); result jsonb;
BEGIN
 IF actor IS NULL OR coalesce((current_setting('request.jwt.claims',true)::jsonb)->'app_metadata'->>'hotel_internal_support','false')<>'true' OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=actor AND ativo=true) THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 IF coalesce(length(trim(reason)),0) NOT BETWEEN 5 AND 1000 THEN RAISE EXCEPTION 'SUPPORT_REASON_REQUIRED'; END IF;
 -- Lock the grant during read/audit; revoke serializes with this transaction.
 PERFORM 1 FROM public.hotel_support_grants g JOIN public.hotels h1 ON h1.id=g.hotel_id JOIN public.users u ON u.id=h1.owner_id AND u.ativo=true
 WHERE g.hotel_id=h AND g.operator_id=actor AND g.scope=scope_name AND g.owner_id=h1.owner_id AND NOT g.revoked AND g.expires_at>now() FOR SHARE OF g,h1;
 IF NOT FOUND THEN RAISE EXCEPTION 'ACCESS_DENIED'; END IF;
 CASE scope_name
 WHEN 'diagnostico' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('respostas',respostas,'completado',completado)),'[]') INTO result FROM public.onboarding_respostas WHERE hotel_id=h;
 WHEN 'rascunhos' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'v2',v2)),'[]') INTO result FROM public.calendarios_gerados WHERE hotel_id=h;
 WHEN 'historico' THEN SELECT coalesce(jsonb_agg(jsonb_build_object('acao',acao,'detalhes',detalhes,'created_at',created_at)),'[]') INTO result FROM public.hotel_execution_log WHERE hotel_id=h;
 ELSE RAISE EXCEPTION 'ACCESS_DENIED'; END CASE;
 INSERT INTO public.activity_log(user_id,acao,entidade_tipo,entidade_id,detalhes) VALUES(actor,'support_read','hotel',h,jsonb_build_object('scope',scope_name,'reason',trim(reason),'read_only',true));
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.hotel_support_authorize(uuid,uuid,text,timestamptz,text,boolean),public.hotel_support_read(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_support_authorize(uuid,uuid,text,timestamptz,text,boolean),public.hotel_support_read(uuid,text,text) TO authenticated;
CREATE FUNCTION public.hotel_support_owner_changed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN DELETE FROM public.hotel_support_grants WHERE hotel_id=NEW.id; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.hotel_support_owner_changed() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER hotel_support_owner_changed AFTER UPDATE OF owner_id ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.hotel_support_owner_changed();
COMMIT;
