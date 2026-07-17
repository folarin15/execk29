import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rfrlddiebyfojnzbfldy.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  console.error('Get it from: Supabase Dashboard > Project Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  // 1. Courses
  const { error: err1 } = await supabase.from('courses').upsert([
    { code: 'PHS201', name: 'Physiology I', department: 'Physiology' },
    { code: 'PHS202', name: 'Physiology II', department: 'Physiology' },
    { code: 'ANA201', name: 'Anatomy I', department: 'Anatomy' },
    { code: 'ANA202', name: 'Anatomy II', department: 'Anatomy' },
    { code: 'BCH201', name: 'Medical Biochemistry I', department: 'Biochemistry' },
    { code: 'BCH202', name: 'Medical Biochemistry II', department: 'Biochemistry' },
    { code: 'PHS301', name: 'Physiology III', department: 'Physiology' },
    { code: 'PHS302', name: 'Physiology IV', department: 'Physiology' },
  ], { onConflict: 'code' });
  if (err1) throw err1;
  console.log('courses seeded');

  // 2. Members
  const members = [
    { full_name: 'Adebayo Olamide Samuel', name: 'Adebayo Olamide', matric_number: 'UI/2022/001', email: 'olamide.adebayo@ui.edu.ng', date_of_birth: '2004-03-15', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Chukwudi Nneka Ebere', name: 'Chukwudi Nneka', matric_number: 'UI/2022/002', email: 'nneka.chukwudi@ui.edu.ng', date_of_birth: '2003-11-22', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Okafor Emeka David', name: 'Okafor Emeka', matric_number: 'UI/2022/003', email: 'emeka.okafor@ui.edu.ng', date_of_birth: '2004-07-08', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Ogunlade Favour Titilayo', name: 'Ogunlade Favour', matric_number: 'UI/2022/004', email: 'favour.ogunlade@ui.edu.ng', date_of_birth: '2003-05-30', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Eze Chiamaka Grace', name: 'Eze Chiamaka', matric_number: 'UI/2022/005', email: 'chiamaka.eze@ui.edu.ng', date_of_birth: '2004-01-18', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Bello Abdulmalik Ibrahim', name: 'Bello Abdulmalik', matric_number: 'UI/2022/006', email: 'abdulmalik.bello@ui.edu.ng', date_of_birth: '2003-09-12', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Nwachukwu Somtochukwu', name: 'Nwachukwu Somto', matric_number: 'UI/2022/007', email: 'somto.nwachukwu@ui.edu.ng', date_of_birth: '2004-06-25', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Akinwale Deborah Oluwaseun', name: 'Akinwale Deborah', matric_number: 'UI/2022/008', email: 'deborah.akinwale@ui.edu.ng', date_of_birth: '2003-12-03', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Mohammed Aisha Bello', name: 'Mohammed Aisha', matric_number: 'UI/2022/009', email: 'aisha.mohammed@ui.edu.ng', date_of_birth: '2004-04-19', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Okeke Ifeanyi John', name: 'Okeke Ifeanyi', matric_number: 'UI/2022/010', email: 'ifeanyi.okeke@ui.edu.ng', date_of_birth: '2003-08-14', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Adebisi Tolulope Esther', name: 'Adebisi Tolulope', matric_number: 'UI/2022/011', email: 'tolulope.adebisi@ui.edu.ng', date_of_birth: '2004-02-28', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Ugwu Chidera Blessing', name: 'Ugwu Chidera', matric_number: 'UI/2022/012', email: 'chidera.ugwu@ui.edu.ng', date_of_birth: '2003-10-05', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Onyemaobi Chinaza Peace', name: 'Onyemaobi Chinaza', matric_number: 'UI/2022/013', email: 'chinaza.onyemaobi@ui.edu.ng', date_of_birth: '2004-08-12', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Ibrahim Zainab Abimbola', name: 'Ibrahim Zainab', matric_number: 'UI/2022/014', email: 'zainab.ibrahim@ui.edu.ng', date_of_birth: '2003-06-20', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Oluwaseun Praise Ayomide', name: 'Oluwaseun Praise', matric_number: 'UI/2022/015', email: 'praise.oluwaseun@ui.edu.ng', date_of_birth: '2004-01-07', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Daniel Victory Chinonso', name: 'Daniel Victory', matric_number: 'UI/2022/016', email: 'victory.daniel@ui.edu.ng', date_of_birth: '2003-04-15', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Ogunbiyi Marvellous Kemi', name: 'Ogunbiyi Marvellous', matric_number: 'UI/2022/017', email: 'marvellous.ogunbiyi@ui.edu.ng', date_of_birth: '2004-09-30', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Suleiman Fatima Omotola', name: 'Suleiman Fatima', matric_number: 'UI/2022/018', email: 'fatima.suleiman@ui.edu.ng', date_of_birth: '2003-07-22', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Adegoke Samuel Ayomiposi', name: 'Adegoke Samuel', matric_number: 'UI/2022/019', email: 'samuel.adegoke@ui.edu.ng', date_of_birth: '2004-05-11', class: '200 Level', enrollment_status: 'active' },
    { full_name: 'Enyinna Precious Amarachi', name: 'Enyinna Precious', matric_number: 'UI/2022/020', email: 'precious.enyingba@ui.edu.ng', date_of_birth: '2003-02-14', class: '200 Level', enrollment_status: 'active' },
  ];

  const { error: err2 } = await supabase.from('members').upsert(members, { onConflict: 'matric_number' });
  if (err2) throw err2;
  console.log('members seeded');

  // 3. Fetch members for FK references
  const { data: dbMembers, error: err3 } = await supabase.from('members').select('id, matric_number');
  if (err3) throw err3;
  const memberMap = Object.fromEntries(dbMembers.map(m => [m.matric_number, m.id]));

  const { data: dbCourses, error: err4 } = await supabase.from('courses').select('code');
  if (err4) throw err4;
  const courseCodes = dbCourses.map(c => c.code);

  const memberIds = Object.values(memberMap);
  const sampleMembers = memberIds.slice(0, 15);

  // 4. Quiz attempts
  const quizAttempts = [];
  for (const mid of sampleMembers) {
    for (let i = 0; i < 8; i++) {
      const qcount = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
      const score = Math.floor(Math.random() * (qcount + 1));
      quizAttempts.push({
        member_id: mid,
        course_code: courseCodes[Math.floor(Math.random() * courseCodes.length)],
        mode: Math.random() < 0.6 ? 'practice' : 'exam',
        score,
        question_count: qcount,
        percent: Math.round((score / qcount) * 1000) / 10,
        duration_seconds: Math.floor(Math.random() * 3600 + 300),
        submitted_at: new Date(Date.now() - Math.random() * 20 * 86400000).toISOString(),
      });
    }
  }
  const { error: err5 } = await supabase.from('quiz_attempts').insert(quizAttempts);
  if (err5) throw err5;
  console.log(`quiz_attempts seeded (${quizAttempts.length} rows)`);

  // 5. Study events
  const studyEvents = [];
  for (const mid of sampleMembers.slice(0, 12)) {
    const daysBack = Math.floor(Math.random() * 14);
    studyEvents.push({
      member_id: mid,
      event_type: 'quiz',
      created_at: new Date(Date.now() - daysBack * 86400000).toISOString(),
    });
  }
  const { error: err6 } = await supabase.from('study_events').insert(studyEvents);
  if (err6) throw err6;
  console.log('study_events seeded');

  // 6. Announcements
  const { error: err7 } = await supabase.from('announcements').insert([
    { title: 'End-of-Semester Examination Schedule Released', message: 'The Physiology Department has released the timetable for the end-of-semester examinations. All students are advised to check the notice board and prepare accordingly.', priority: 'high', author: 'Admin', status: 'live', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { title: 'Clinical Posting Rotations for 300 Level', message: '300 Level students are to report to the University College Hospital (UCH) for clinical postings starting Monday. Groups A and B have been published on the departmental portal.', priority: 'medium', author: 'Admin', status: 'live', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { title: 'Physiology Quiz Competition — Register Now', message: 'The annual inter-university Physiology quiz competition is open for registration. Interested students should sign up at the Students Affairs office on or before Friday.', priority: 'low', author: 'Admin', status: 'live', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  ]);
  if (err7) throw err7;
  console.log('announcements seeded');

  // 7. Suggestions
  const { error: err8 } = await supabase.from('suggestions').insert([
    { name: 'Adebayo Olamide', matric_number: 'UI/2022/001', category: 'Academics', message: 'The lecture slides for Cardiovascular Physiology are not detailed enough. Could we have more diagrams and step-by-step explanations?', status: 'pending', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { name: 'Eze Chiamaka', matric_number: 'UI/2022/005', category: 'Facilities', message: 'The practical laboratory needs more functional kymographs. Many of the instruments in Lab B are faulty and affect our practical grades.', status: 'reviewed', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { name: 'Okeke Ifeanyi', matric_number: 'UI/2022/010', category: 'General', message: 'Can the department consider having a mentorship program pairing 200 Level students with 400 Level seniors? It would help with academic guidance.', status: 'addressed', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  ]);
  if (err8) throw err8;
  console.log('suggestions seeded');

  // 8. Topic performance
  const topics = ['Cardiovascular', 'Respiratory', 'Renal', 'Endocrine', 'Neurophysiology', 'Gastrointestinal'];
  const topicPerf = [];
  for (const mid of sampleMembers.slice(0, 10)) {
    for (const topic of topics) {
      topicPerf.push({
        member_id: mid,
        topic,
        accuracy: Math.round(Math.random() * 1000) / 10,
        attempts: Math.floor(Math.random() * 8 + 1),
      });
    }
  }
  const { error: err9 } = await supabase.from('topic_performance').insert(topicPerf);
  if (err9) throw err9;
  console.log('topic_performance seeded');

  // 9. RLS policies — permissive anon access
  const sql = `
    alter table if exists members enable row level security;
    alter table if exists courses enable row level security;
    alter table if exists resources enable row level security;
    alter table if exists receipts enable row level security;
    alter table if exists announcements enable row level security;
    alter table if exists suggestions enable row level security;
    alter table if exists quiz_attempts enable row level security;
    alter table if exists study_events enable row level security;
    alter table if exists resource_progress enable row level security;
    alter table if exists topic_performance enable row level security;
    do $rls$ begin
      if not exists (select 1 from pg_policies where tablename='members' and policyname='anon_select_members') then
        create policy anon_select_members on members for select using (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='courses' and policyname='anon_select_courses') then
        create policy anon_select_courses on courses for select using (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='announcements' and policyname='anon_select_announcements') then
        create policy anon_select_announcements on announcements for select using (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='suggestions' and policyname='anon_select_suggestions') then
        create policy anon_select_suggestions on suggestions for select using (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='quiz_attempts' and policyname='anon_select_quiz_attempts') then
        create policy anon_select_quiz_attempts on quiz_attempts for select using (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='study_events' and policyname='anon_select_study_events') then
        create policy anon_select_study_events on study_events for select using (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='topic_performance' and policyname='anon_select_topic_performance') then
        create policy anon_select_topic_performance on topic_performance for select using (true);
      end if;
    end $rls$;
  `;
  const { error: err10 } = await supabase.rpc('exec_sql', { query: sql });
  if (err10) {
    console.log('Note: RLS policies not applied via API. Run supabase/seed.sql in SQL Editor instead.');
    console.log('  (This is normal — exec_sql requires superuser or special setup)');
  } else {
    console.log('RLS policies applied');
  }

  console.log('\nSeed complete! Supabase is now ready.');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
