-- ============================================================
-- Match database schema to the real PhysioK29 student portal
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

------------------------------
-- 1. MEMBERS
------------------------------
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS notification_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onesignal_subscription_id text,
  ADD COLUMN IF NOT EXISTS notification_last_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS notification_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS birthday_photo_url text,
  ADD COLUMN IF NOT EXISTS birthday_registration_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS birthday_photo_updated_at timestamptz;

-- NOTE: photo_url already exists — used for general profile photo
-- birthday_photo_url is a separate column for birthday-specific photos

------------------------------
-- 2. RESOURCES
------------------------------
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS course_title text,
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'Resource',
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS download_url text,
  ADD COLUMN IF NOT EXISTS uploaded_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lecture_date date,
  ADD COLUMN IF NOT EXISTS lecture_topic text,
  ADD COLUMN IF NOT EXISTS lecture_venue text,
  ADD COLUMN IF NOT EXISTS upload_category text NOT NULL DEFAULT 'resource';

------------------------------
-- 3. QUIZ ATTEMPTS
------------------------------
ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS motivation_text text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz NOT NULL DEFAULT now();

-- NOTE: percent column is kept for backward compatibility
-- New data should compute percent = (score / question_count) * 100

------------------------------
-- 4. RESOURCE PROGRESS
------------------------------
ALTER TABLE resource_progress
  ADD COLUMN IF NOT EXISTS opened_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_page integer,
  ADD COLUMN IF NOT EXISTS total_pages integer,
  ADD COLUMN IF NOT EXISTS progress_percent numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_opened_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_opened_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- NOTE: status column already exists with values: opened, reading, urgent, done
-- completed column does not exist in the real schema and should NOT be added

------------------------------
-- 5. TOPIC PERFORMANCE
------------------------------
ALTER TABLE topic_performance
  ADD COLUMN IF NOT EXISTS course_code text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS correct integer NOT NULL DEFAULT 0;

-- NOTE: accuracy column is kept for backward compatibility
-- New data should store correct (integer) and compute accuracy = (correct / attempts * 100)

------------------------------
-- 6. RECEIPTS — remove column not in real schema
------------------------------
ALTER TABLE receipts
  DROP COLUMN IF EXISTS students CASCADE,
  DROP COLUMN IF EXISTS member_id CASCADE;

-- NOTE: uploaded_by references auth.users, not members
-- The real schema uses: uploaded_by, uploader_role, status, verified_by, verified_at

------------------------------
-- 7. RESOURCE FEEDBACK — add updated_at if missing
------------------------------
ALTER TABLE resource_feedback
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

------------------------------
-- 8. UPDATE is_staff() FUNCTIONS to include all 6 roles
-- (in case not already updated)
------------------------------
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin','representative','academic','treasurer','auditor','designer')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
$$;
