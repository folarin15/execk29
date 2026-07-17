-- ============================================================
-- Replace fake seed data with real students from allowed_members
-- Run this in Supabase SQL Editor after migration_match_real_schema.sql
-- ============================================================

------------------------------
-- 1. DELETE FAKE DATA
------------------------------
DELETE FROM resource_progress;
DELETE FROM resource_feedback;
DELETE FROM quiz_answers;
DELETE FROM quiz_attempts;
DELETE FROM study_events;
DELETE FROM topic_performance;
DELETE FROM members;

------------------------------
-- 2. CREATE register_member FUNCTION (drop first to avoid type conflict)
------------------------------
DROP FUNCTION IF EXISTS public.register_member(text,text);
CREATE FUNCTION public.register_member(
  p_name text,
  p_matric_number text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_member_id uuid;
  v_allowed record;
BEGIN
  -- Check allowed_members
  SELECT * INTO v_allowed FROM public.allowed_members a
  WHERE a.matric_number = p_matric_number;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Matric number not found');
  END IF;

  -- Insert or update member
  INSERT INTO public.members (name, matric_number, last_seen_at)
  VALUES (p_name, p_matric_number, now())
  ON CONFLICT (matric_number) DO UPDATE SET
    name = EXCLUDED.name,
    last_seen_at = now()
  RETURNING id INTO v_member_id;

  RETURN jsonb_build_object('id', v_member_id, 'name', p_name, 'matric_number', p_matric_number);
END;
$$;

------------------------------
-- 3. REGISTER ALL REAL STUDENTS
------------------------------
DO $$
DECLARE
  r record;
  result jsonb;
BEGIN
  FOR r IN SELECT * FROM public.allowed_members ORDER BY created_at LOOP
    result := public.register_member(r.name, r.matric_number);
    RAISE NOTICE 'Registered: % (%) → %', r.name, r.matric_number, result->>'id';
  END LOOP;
END $$;

------------------------------
-- 4. VERIFY
------------------------------
SELECT COUNT(*) AS member_count FROM members;
