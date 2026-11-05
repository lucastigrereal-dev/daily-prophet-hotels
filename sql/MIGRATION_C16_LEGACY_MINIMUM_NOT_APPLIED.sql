-- Append after C15 only in the disposable synthetic LAB; never rewrite human drafts.
BEGIN;
CREATE OR REPLACE FUNCTION public.hotel_v2_checked_facts(p_template_id text,p_version integer,p_profile jsonb,p_usage_date date) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE k text; value jsonb:=p_profile->'accommodation';
BEGIN
 PERFORM public.hotel_c11_minimum(p_profile->'diagnosis');
 IF jsonb_typeof(value) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'ACCOMMODATION_REQUIRED'; END IF;
 FOREACH k IN ARRAY ARRAY['name','description'] LOOP
  IF jsonb_typeof(value->k) IS DISTINCT FROM 'string' OR coalesce(length(public.hotel_c13_trim(value->>k)),0)<1 OR length(value->>k)>1000 THEN RAISE EXCEPTION 'ACCOMMODATION_REQUIRED'; END IF;
 END LOOP;
 RETURN public.hotel_v2_checked_facts_prior_c11(p_template_id,p_version,p_profile,p_usage_date);
END; $$;
COMMIT;
