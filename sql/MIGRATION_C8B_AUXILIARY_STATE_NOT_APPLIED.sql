-- C8B candidate. NOT_APPLIED to product/real database. Apply after preserved C8A.
-- Only the declared INSERT/UPDATE state gates for existing hotel-linked rows/events.
-- Historical SELECT remains unchanged; no whole-account, DELETE or multi-hotel guarantee.
-- Single application: a policy-name collision aborts this transaction. No grants supplied.
BEGIN;
CREATE POLICY hotel_recomposed_c8b_onboarding_insert_state ON public.onboarding_respostas
AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status IN ('lead','onboarding','ativo')));
CREATE POLICY hotel_recomposed_c8b_onboarding_update_state ON public.onboarding_respostas
AS RESTRICTIVE FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status IN ('lead','onboarding','ativo')))
WITH CHECK (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status IN ('lead','onboarding','ativo')));
CREATE POLICY hotel_recomposed_c8b_dna_insert_state ON public.hotel_content_preferences
AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status IN ('lead','onboarding','ativo')));
CREATE POLICY hotel_recomposed_c8b_dna_update_state ON public.hotel_content_preferences
AS RESTRICTIVE FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status IN ('lead','onboarding','ativo')))
WITH CHECK (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status IN ('lead','onboarding','ativo')));
CREATE POLICY hotel_recomposed_c8b_log_insert_active ON public.hotel_execution_log
AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id=hotel_id AND h.owner_id=auth.uid() AND h.status ='ativo'));
COMMIT;
