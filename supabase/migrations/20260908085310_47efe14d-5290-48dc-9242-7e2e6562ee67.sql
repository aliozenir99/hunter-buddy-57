DO $$
DECLARE owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM auth.users ORDER BY created_at LIMIT 1;
  IF owner_id IS NOT NULL THEN
    UPDATE public.account_managers SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.activities SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.companies SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.contacts SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.email_drafts SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.follow_ups SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.handovers SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.meetings SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.opportunities SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE public.requests SET created_by = owner_id WHERE created_by IS NULL;
  END IF;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['account_managers','activities','companies','contacts','email_drafts','follow_ups','handovers','meetings','opportunities','requests']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN created_by SET DEFAULT auth.uid()', t);
    EXECUTE format('UPDATE public.%I SET created_by = created_by WHERE false', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN created_by SET NOT NULL', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "workspace am" ON public.account_managers;
DROP POLICY IF EXISTS "workspace act" ON public.activities;
DROP POLICY IF EXISTS "workspace companies" ON public.companies;
DROP POLICY IF EXISTS "workspace contacts" ON public.contacts;
DROP POLICY IF EXISTS "workspace mail" ON public.email_drafts;
DROP POLICY IF EXISTS "workspace fu" ON public.follow_ups;
DROP POLICY IF EXISTS "workspace handovers" ON public.handovers;
DROP POLICY IF EXISTS "workspace meetings" ON public.meetings;
DROP POLICY IF EXISTS "workspace opps" ON public.opportunities;
DROP POLICY IF EXISTS "workspace requests" ON public.requests;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['account_managers','activities','companies','contacts','email_drafts','follow_ups','handovers','meetings','opportunities','requests']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$CREATE POLICY "own rows %1$s" ON public.%1$I FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid())$f$, t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;