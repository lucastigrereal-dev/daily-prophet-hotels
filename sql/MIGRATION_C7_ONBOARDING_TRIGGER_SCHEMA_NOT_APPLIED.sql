-- C7 candidate. NOT_APPLIED to product/real database.
-- Repairs only schema resolution inside the existing public trigger function.
-- The historical schema and C6 RPC remain unchanged; existing trigger stays attached.
-- Inspect installed function/schema before any separately authorized application.
BEGIN;
CREATE OR REPLACE FUNCTION public.check_onboarding_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF NEW.completado = TRUE AND NEW.progresso_percent = 100 THEN
    UPDATE public.hotels SET onboarding_completo = TRUE WHERE id = NEW.hotel_id;
  END IF;
  RETURN NEW;
END;
$$;
COMMIT;
