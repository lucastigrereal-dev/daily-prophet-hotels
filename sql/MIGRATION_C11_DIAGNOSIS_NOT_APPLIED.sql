-- Append to C10 only in a fresh disposable synthetic LAB.
BEGIN;
CREATE FUNCTION public.hotel_c11_minimum(d jsonb) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE k text;
BEGIN
 IF jsonb_typeof(d) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'DIAGNOSIS_REQUIRED'; END IF;
 FOREACH k IN ARRAY ARRAY['motivo_viagem','promessa','canal_consulta','pendencias'] LOOP
  IF jsonb_typeof(d->k) IS DISTINCT FROM 'string' OR coalesce(btrim(d->>k,chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279)),'')='' OR length(d->>k)>1000 THEN RAISE EXCEPTION 'DIAGNOSIS_REQUIRED'; END IF;
  d:=jsonb_set(d,ARRAY[k],to_jsonb(btrim(d->>k,chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279))));
 END LOOP;
 IF jsonb_typeof(d->'fotos_autorizadas') IS DISTINCT FROM 'boolean' OR jsonb_typeof(d->'pessoas_autorizadas') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'DIAGNOSIS_REQUIRED'; END IF;
 RETURN d;
END; $$;
REVOKE ALL ON FUNCTION public.hotel_c11_minimum(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_c11_minimum(jsonb) TO hotel_c10_rpc;
ALTER FUNCTION public.hotel_c10_profile(jsonb,uuid,integer) RENAME TO hotel_c10_profile_prior;
CREATE FUNCTION public.hotel_c10_profile(s jsonb,h uuid,r integer) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE d jsonb:=s->'modulo_2'->'diagnostico'; k text; p jsonb;
BEGIN
 d:=public.hotel_c11_minimum(d);
 p:=public.hotel_c10_profile_prior(s,h,r);
 RETURN p||jsonb_build_object('diagnosis',jsonb_build_object('motivo_viagem',d->>'motivo_viagem','promessa',d->>'promessa','canal_consulta',d->>'canal_consulta','pendencias',d->>'pendencias','fotos_autorizadas',d->'fotos_autorizadas','pessoas_autorizadas',d->'pessoas_autorizadas'),'photography',d->'fotos_autorizadas','people',d->'pessoas_autorizadas');
END; $$;
REVOKE ALL ON FUNCTION public.hotel_c10_profile(jsonb,uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_c10_profile(jsonb,uuid,integer) TO hotel_c10_rpc;
ALTER FUNCTION public.hotel_v2_checked_facts(text,integer,jsonb,date) RENAME TO hotel_v2_checked_facts_prior_c11;
CREATE FUNCTION public.hotel_v2_checked_facts(p_template_id text,p_version integer,p_profile jsonb,p_usage_date date) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
BEGIN
 PERFORM public.hotel_c11_minimum(p_profile->'diagnosis');
 RETURN public.hotel_v2_checked_facts_prior_c11(p_template_id,p_version,p_profile,p_usage_date);
END; $$;
REVOKE ALL ON FUNCTION public.hotel_v2_checked_facts(text,integer,jsonb,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hotel_v2_checked_facts(text,integer,jsonb,date) TO hotel_c10_rpc;
COMMIT;
