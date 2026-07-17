-- ============================================================
-- FULL SCHEMA + SEED for Executive Portal
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. DROP existing tables for clean slate
-- ============================================================
drop table if exists topic_performance cascade;
drop table if exists resource_progress cascade;
drop table if exists study_events cascade;
drop table if exists quiz_attempts cascade;
drop table if exists receipts cascade;
drop table if exists suggestions cascade;
drop table if exists announcements cascade;
drop table if exists resources cascade;
drop table if exists courses cascade;
drop table if exists members cascade;
drop table if exists staff_roles cascade;

-- ============================================================
-- 2. CREATE tables
-- ============================================================

-- 2a. staff_roles — maps auth.users to Exec Portal role
create table staff_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','representative','academic','treasurer','auditor','designer')),
  display_name text not null,
  created_at timestamptz default now()
);

-- 2b. members — student profiles
create table members (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  name text not null,
  matric_number text unique not null,
  email text,
  date_of_birth date,
  photo_url text,
  class text,
  enrollment_status text default 'active' check (enrollment_status in ('active','inactive','graduated')),
  created_at timestamptz default now()
);

-- 2c. courses
create table courses (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  department text
);

-- 2d. resources
create table resources (
  id uuid primary key default uuid_generate_v4(),
  course_code text not null references courses(code),
  title text not null,
  file_name text not null,
  file_type text not null default 'other' check (file_type in ('pdf','pptx','xlsx','docx','other')),
  file_size bigint default 0,
  week int not null,
  storage_path text,
  uploaded_by text not null,
  created_at timestamptz default now()
);

-- 2e. receipts
create table receipts (
  id uuid primary key default uuid_generate_v4(),
  receipt_number text unique not null,
  purpose text not null,
  amount numeric not null,
  date date not null,
  uploaded_by text not null,
  uploader_role text not null,
  students jsonb default '[]',
  student_details jsonb default '[]',
  status text default 'pending' check (status in ('pending','verified')),
  verified_by text,
  verified_at timestamptz,
  receipt_url text,
  created_at timestamptz default now()
);

-- 2f. announcements
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  priority text,
  author text not null,
  posted_by text,
  status text default 'live',
  created_at timestamptz default now()
);

-- 2g. suggestions
create table suggestions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  matric_number text not null,
  category text not null,
  message text not null,
  status text default 'pending' check (status in ('pending','reviewed','addressed')),
  created_at timestamptz default now()
);

-- 2h. quiz_attempts
create table quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id),
  course_code text not null,
  mode text not null check (mode in ('practice','exam')),
  score int not null,
  question_count int not null,
  percent numeric not null,
  duration_seconds int not null,
  submitted_at timestamptz default now()
);

-- 2i. study_events
create table study_events (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id),
  event_type text,
  created_at timestamptz default now()
);

-- 2j. resource_progress
create table resource_progress (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id),
  resource_id uuid not null references resources(id),
  status text not null default 'not_started' check (status in ('opened','reading','done','not_started')),
  created_at timestamptz default now()
);

-- 2k. topic_performance
create table topic_performance (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id),
  topic text not null,
  accuracy numeric not null,
  attempts int not null
);

-- ============================================================
-- 3. RLS — enable + permissive policies for anon key
-- ============================================================
alter table staff_roles enable row level security;
alter table members enable row level security;
alter table courses enable row level security;
alter table resources enable row level security;
alter table receipts enable row level security;
alter table announcements enable row level security;
alter table suggestions enable row level security;
alter table quiz_attempts enable row level security;
alter table study_events enable row level security;
alter table resource_progress enable row level security;
alter table topic_performance enable row level security;

-- Allow anon SELECT on all tables
create policy "anon_select_staff_roles" on staff_roles for select using (true);
create policy "anon_select_members" on members for select using (true);
create policy "anon_select_courses" on courses for select using (true);
create policy "anon_select_resources" on resources for select using (true);
create policy "anon_select_receipts" on receipts for select using (true);
create policy "anon_select_announcements" on announcements for select using (true);
create policy "anon_select_suggestions" on suggestions for select using (true);
create policy "anon_select_quiz_attempts" on quiz_attempts for select using (true);
create policy "anon_select_study_events" on study_events for select using (true);
create policy "anon_select_resource_progress" on resource_progress for select using (true);
create policy "anon_select_topic_performance" on topic_performance for select using (true);

-- Allow anon INSERT on suggestions (for bridge / student portal)
create policy "anon_insert_suggestions" on suggestions for insert with check (true);

-- Allow anon INSERT on quiz_attempts / study_events / resource_progress (bridge)
create policy "anon_insert_quiz_attempts" on quiz_attempts for insert with check (true);
create policy "anon_insert_study_events" on study_events for insert with check (true);
create policy "anon_insert_resource_progress" on resource_progress for insert with check (true);

-- Allow anon INSERT on receipts (treasurer)
create policy "anon_insert_receipts" on receipts for insert with check (true);

-- Allow anon UPDATE on receipts (auditor verify)
create policy "anon_update_receipts" on receipts for update using (true) with check (true);

-- Allow anon INSERT on resources
create policy "anon_insert_resources" on resources for insert with check (true);

-- ============================================================
-- 4. SEED DATA
-- ============================================================

-- 4a. courses
insert into courses (code, name, department) values
  ('PHS201', 'Physiology I', 'Physiology'),
  ('PHS202', 'Physiology II', 'Physiology'),
  ('ANA201', 'Anatomy I', 'Anatomy'),
  ('ANA202', 'Anatomy II', 'Anatomy'),
  ('BCH201', 'Medical Biochemistry I', 'Biochemistry'),
  ('BCH202', 'Medical Biochemistry II', 'Biochemistry'),
  ('PHS301', 'Physiology III', 'Physiology'),
  ('PHS302', 'Physiology IV', 'Physiology');

-- 4b. members (20 students)
insert into members (full_name, name, matric_number, email, date_of_birth, class, enrollment_status) values
  ('Adebayo Olamide Samuel', 'Adebayo Olamide', 'UI/2022/001', 'olamide.adebayo@ui.edu.ng', '2004-03-15', '200 Level', 'active'),
  ('Chukwudi Nneka Ebere', 'Chukwudi Nneka', 'UI/2022/002', 'nneka.chukwudi@ui.edu.ng', '2003-11-22', '200 Level', 'active'),
  ('Okafor Emeka David', 'Okafor Emeka', 'UI/2022/003', 'emeka.okafor@ui.edu.ng', '2004-07-08', '200 Level', 'active'),
  ('Ogunlade Favour Titilayo', 'Ogunlade Favour', 'UI/2022/004', 'favour.ogunlade@ui.edu.ng', '2003-05-30', '200 Level', 'active'),
  ('Eze Chiamaka Grace', 'Eze Chiamaka', 'UI/2022/005', 'chiamaka.eze@ui.edu.ng', '2004-01-18', '200 Level', 'active'),
  ('Bello Abdulmalik Ibrahim', 'Bello Abdulmalik', 'UI/2022/006', 'abdulmalik.bello@ui.edu.ng', '2003-09-12', '200 Level', 'active'),
  ('Nwachukwu Somtochukwu', 'Nwachukwu Somto', 'UI/2022/007', 'somto.nwachukwu@ui.edu.ng', '2004-06-25', '200 Level', 'active'),
  ('Akinwale Deborah Oluwaseun', 'Akinwale Deborah', 'UI/2022/008', 'deborah.akinwale@ui.edu.ng', '2003-12-03', '200 Level', 'active'),
  ('Mohammed Aisha Bello', 'Mohammed Aisha', 'UI/2022/009', 'aisha.mohammed@ui.edu.ng', '2004-04-19', '200 Level', 'active'),
  ('Okeke Ifeanyi John', 'Okeke Ifeanyi', 'UI/2022/010', 'ifeanyi.okeke@ui.edu.ng', '2003-08-14', '200 Level', 'active'),
  ('Adebisi Tolulope Esther', 'Adebisi Tolulope', 'UI/2022/011', 'tolulope.adebisi@ui.edu.ng', '2004-02-28', '200 Level', 'active'),
  ('Ugwu Chidera Blessing', 'Ugwu Chidera', 'UI/2022/012', 'chidera.ugwu@ui.edu.ng', '2003-10-05', '200 Level', 'active'),
  ('Onyemaobi Chinaza Peace', 'Onyemaobi Chinaza', 'UI/2022/013', 'chinaza.onyemaobi@ui.edu.ng', '2004-08-12', '200 Level', 'active'),
  ('Ibrahim Zainab Abimbola', 'Ibrahim Zainab', 'UI/2022/014', 'zainab.ibrahim@ui.edu.ng', '2003-06-20', '200 Level', 'active'),
  ('Oluwaseun Praise Ayomide', 'Oluwaseun Praise', 'UI/2022/015', 'praise.oluwaseun@ui.edu.ng', '2004-01-07', '200 Level', 'active'),
  ('Daniel Victory Chinonso', 'Daniel Victory', 'UI/2022/016', 'victory.daniel@ui.edu.ng', '2003-04-15', '200 Level', 'active'),
  ('Ogunbiyi Marvellous Kemi', 'Ogunbiyi Marvellous', 'UI/2022/017', 'marvellous.ogunbiyi@ui.edu.ng', '2004-09-30', '200 Level', 'active'),
  ('Suleiman Fatima Omotola', 'Suleiman Fatima', 'UI/2022/018', 'fatima.suleiman@ui.edu.ng', '2003-07-22', '200 Level', 'active'),
  ('Adegoke Samuel Ayomiposi', 'Adegoke Samuel', 'UI/2022/019', 'samuel.adegoke@ui.edu.ng', '2004-05-11', '200 Level', 'active'),
  ('Enyinna Precious Amarachi', 'Enyinna Precious', 'UI/2022/020', 'precious.enyingba@ui.edu.ng', '2003-02-14', '200 Level', 'active');

-- 4c. quiz_attempts (120 rows across members for stats)
insert into quiz_attempts (member_id, course_code, mode, score, question_count, percent, duration_seconds, submitted_at)
select
  m.id,
  c.code,
  case when random() < 0.6 then 'practice' else 'exam' end,
  (random() * q.qcount)::int,
  q.qcount,
  round((random() * 100)::numeric, 1),
  (random() * 3600 + 300)::int,
  now() - (random() * interval '20 days')
from members m
cross join (values (10), (15), (20), (25), (30)) as q(qcount)
cross join courses c
where m.id in (select id from members order by random() limit 15)
and c.code in ('PHS201','PHS202','ANA201','BCH201')
limit 120;

-- 4d. study_events — daily activity for past 14 days
insert into study_events (member_id, event_type, created_at)
select
  m.id,
  'quiz',
  date_trunc('day', now()) - (random() * interval '13 days')
from members m
cross join generate_series(1, (random() * 3 + 1)::int)
where m.id in (select id from members order by random() limit 12);

-- 4e. resource_progress — engagement ring data
insert into resource_progress (member_id, resource_id, status)
select
  m.id,
  r.id,
  unnest(array['opened','reading','done','not_started']::text[])
from members m
cross join (select id from resources limit 3) r
where m.id in (select id from members order by random() limit 8);

-- 4f. topic_performance
insert into topic_performance (member_id, topic, accuracy, attempts)
select
  m.id,
  t.topic,
  round((random() * 100)::numeric, 1),
  (random() * 8 + 1)::int
from members m
cross join (values ('Cardiovascular'),('Respiratory'),('Renal'),('Endocrine'),('Neurophysiology'),('Gastrointestinal')) as t(topic)
where m.id in (select id from members order by random() limit 10);

-- 4g. announcements
insert into announcements (title, message, priority, author, status, created_at) values
  ('End-of-Semester Examination Schedule Released', 'The Physiology Department has released the timetable for the end-of-semester examinations. All students are advised to check the notice board and prepare accordingly.', 'high', 'Admin', 'live', now() - interval '2 days'),
  ('Clinical Posting Rotations for 300 Level', '300 Level students are to report to the University College Hospital (UCH) for clinical postings starting Monday. Groups A and B have been published on the departmental portal.', 'medium', 'Admin', 'live', now() - interval '5 days'),
  ('Physiology Quiz Competition — Register Now', 'The annual inter-university Physiology quiz competition is open for registration. Interested students should sign up at the Students Affairs office on or before Friday.', 'low', 'Admin', 'live', now() - interval '10 days');

-- 4h. suggestions
insert into suggestions (name, matric_number, category, message, status, created_at) values
  ('Adebayo Olamide', 'UI/2022/001', 'Academics', 'The lecture slides for Cardiovascular Physiology are not detailed enough. Could we have more diagrams and step-by-step explanations?', 'pending', now() - interval '3 days'),
  ('Eze Chiamaka', 'UI/2022/005', 'Facilities', 'The practical laboratory needs more functional kymographs. Many of the instruments in Lab B are faulty and affect our practical grades.', 'reviewed', now() - interval '7 days'),
  ('Okeke Ifeanyi', 'UI/2022/010', 'General', 'Can the department consider having a mentorship program pairing 200 Level students with 400 Level seniors? It would help with academic guidance.', 'addressed', now() - interval '14 days');

-- ============================================================
-- 5. CLEANUP: Fix receipt student_details to reference valid IDs
-- ============================================================
-- (receipts are inserted after students exist; can be added via app)

-- ============================================================
-- DONE
-- ============================================================
