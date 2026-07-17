// ============================================================
// PhysioK29 — Executive Portal Bootstrap
// Initializes Supabase, auth, and role resolution only.
// Business data is fetched on-demand through backend methods.
// ============================================================

const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const SUPABASE_URL = "https://rfrlddiebyfojnzbfldy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcmxkZGllYnlmb2puemJmbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDQ3MDgsImV4cCI6MjA5NDg4MDcwOH0.3nHfDHpkVPUNyxz65_IOPqx8H0F1QA6kxzi1AHFI7oU";
const STORAGE_BUCKET = "class-resources";

let supabase = null;
let _authListeners = [];

/* ── Helpers ─────────────────────────────────────────────── */

function toMillis(v) { return v ? new Date(v).getTime() || 0 : 0; }

/* ── Role resolution ─────────────────────────────────────── */

async function getRole(uid) {
  if (!uid) return null;
  const { data, error } = await supabase.from("staff_roles").select("role, display_name").eq("user_id", uid).maybeSingle();
  if (error || !data) return null;
  return { role: data.role, displayName: data.display_name };
}

/* ── Storage helpers ─────────────────────────────────────── */

async function createSignedUrl(storagePath) {
  if (!storagePath) return "";
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(storagePath, 3600);
  return error ? "" : data?.signedUrl || "";
}

async function signResourceRows(rows) {
  return Promise.all(rows.map(async (r) => {
    if (!r.storage_path) return r;
    r.download_url = await createSignedUrl(r.storage_path);
    return r;
  }));
}

/* ── On-demand data fetch methods ────────────────────────── */

async function fetchAllRows(table) {
  const rows = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }).range(from, to);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
    from += pageSize;
  }
}

/* ── Backend implementation ──────────────────────────────── */

const backend = {
  ready: true,

  /* ── Auth ──────────────────────────────────────────────── */

  async signInRep(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || "").trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOutRep() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuth(callback) {
    let disposed = false;
    async function emit(user) {
      try {
        const role = user ? await getRole(user.id) : null;
        if (!disposed) callback(user, role);
      } catch (err) {
        if (!disposed) callback(user, null);
        console.error(err);
      }
    }
    supabase.auth.getSession().then(({ data }) => emit(data.session?.user || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      emit(session?.user || null);
    });
    return () => { disposed = true; data.subscription.unsubscribe(); };
  },

  /* ── On-demand data fetchers ───────────────────────────── */

  async fetchMembers() {
    const rows = await fetchAllRows("members");
    return rows.map(row => ({
      id: row.id,
      name: row.full_name || row.name || "",
      matricNumber: row.matric_number || "",
      dateOfBirth: row.date_of_birth || "",
      notificationEnabled: row.push_enabled || false,
      photoUrl: row.photo_url || "",
      createdAtMs: toMillis(row.created_at),
      lastSeenAtMs: toMillis(row.last_seen_at),
    }));
  },

  async fetchResources() {
    const rows = await fetchAllRows("resources");
    return signResourceRows(rows.map(row => ({
      id: row.id,
      title: row.title || "",
      courseCode: row.course_code || "",
      type: row.type || "Resource",
      fileName: row.file_name || "",
      note: row.note || "",
      uploadedByUid: row.uploaded_by || "",
      createdAtMs: toMillis(row.created_at),
      storage_path: row.storage_path || "",
      download_url: row.download_url || "",
    })));
  },

  async fetchAnnouncements() {
    const rows = await fetchAllRows("announcements");
    return rows.map(row => ({
      id: row.id,
      title: row.title || "",
      message: row.message || "",
      priority: row.priority || "Normal",
      postedByUid: row.posted_by || "",
      author: row.author || "",
      createdAtMs: toMillis(row.created_at),
    }));
  },

  async fetchSuggestions() {
    const rows = await fetchAllRows("suggestions");
    return rows.map(row => ({
      id: row.id,
      name: row.name || "",
      matricNumber: row.matric_number || "",
      category: row.category || "",
      message: row.message || "",
      status: row.status || "pending",
      createdAtMs: toMillis(row.created_at),
    }));
  },

  async fetchQuizAttempts() {
    const rows = await fetchAllRows("quiz_attempts");
    return rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      courseCode: row.course_code || "",
      mode: row.mode || "practice",
      score: Number(row.score || 0),
      questionCount: Number(row.question_count || 0),
      percent: Number(row.percent || 0),
      durationSeconds: Number(row.duration_seconds || 0),
      submittedAtMs: toMillis(row.submitted_at),
    }));
  },

  async fetchStudyEvents() {
    const rows = await fetchAllRows("study_events");
    return rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      createdAtMs: toMillis(row.created_at),
    }));
  },

  async fetchResourceProgress() {
    const rows = await fetchAllRows("resource_progress");
    return rows.map(row => ({
      resourceId: row.resource_id,
      memberId: row.member_id,
      status: row.status || "",
      openedCount: Number(row.opened_count || 0),
    }));
  },

  async fetchResourceFeedback() {
    const rows = await fetchAllRows("resource_feedback");
    return rows.map(row => ({
      resourceId: row.resource_id,
      memberId: row.member_id,
      helpful: !!row.helpful,
    }));
  },

  async fetchTopicPerformance() {
    const rows = await fetchAllRows("topic_performance");
    return rows.map(row => ({
      memberId: row.member_id,
      topic: row.topic || "",
      accuracy: Number(row.accuracy || 0),
      attempts: Number(row.attempts || 0),
    }));
  },

  /* ── Mutations ─────────────────────────────────────────── */

  async uploadResource(formData, file, onProgress) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Not authenticated");

    const safeName = String(file.name || "resource").trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
    const storagePath = `resources/${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
      cacheControl: "3600", upsert: false,
    });
    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase.from("resources").insert({
      title: formData.title || file.name,
      course_code: formData.courseCode || "",
      type: formData.type || "Resource",
      file_name: file.name,
      note: formData.note || "",
      storage_path: storagePath,
      uploaded_by: user.id,
    });
    if (dbError) throw dbError;
  },

  async postAnnouncement(formData) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.from("announcements").insert({
      title: formData.title || "",
      message: formData.message || "",
      priority: formData.priority || "Normal",
      posted_by: user.id,
      author: formData.author || "",
    });
    if (error) throw error;
  },

  async updateResource(resourceId, updates) {
    const { error } = await supabase.from("resources").update({
      title: updates.title,
      type: updates.type,
      note: updates.note,
    }).eq("id", resourceId);
    if (error) throw error;
  },

  async updateAnnouncement(announcementId, updates) {
    const { error } = await supabase.from("announcements").update({
      title: updates.title,
      priority: updates.priority,
      message: updates.message,
    }).eq("id", announcementId);
    if (error) throw error;
  },

  async deleteResource(resource) {
    if (resource.storage_path) {
      await supabase.storage.from(STORAGE_BUCKET).remove([resource.storage_path]).catch(() => {});
    }
    const { error } = await supabase.from("resources").delete().eq("id", resource.id);
    if (error) throw error;
  },

  async deleteAnnouncement(announcementId) {
    const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
    if (error) throw error;
  },

  async deleteSuggestion(suggestionId) {
    const { error } = await supabase.from("suggestions").delete().eq("id", suggestionId);
    if (error) throw error;
  },

  async deleteMember(memberId) {
    const { error } = await supabase.from("members").delete().eq("id", memberId);
    if (error) throw error;
  },

  async getBirthdayList() {
    const { data, error } = await supabase.from("members").select("id, full_name, name, matric_number, date_of_birth, photo_url").not("date_of_birth", "is", null);
    if (error) return [];
    return (data || []).map(m => ({
      id: m.id,
      name: m.full_name || m.name || "",
      matricNumber: m.matric_number || "",
      dateOfBirth: m.date_of_birth || "",
      photoUrl: m.photo_url || "",
      fullName: m.full_name || m.name || "",
    }));
  },
};

/* ── Init ────────────────────────────────────────────────── */

(async function init() {
  try {
    const { createClient } = await import(SUPABASE_CDN);
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    });
  } catch (err) {
    console.error("[PhysioK29] Failed to load Supabase SDK:", err);
    return;
  }

  window.__PHYSIOK29_STATE__ = { ready: true };
  window.__PHYSIOK29_BACKEND__ = backend;

  console.log("[PhysioK29] Bridges ready — auth + on-demand data");

  window.dispatchEvent(new CustomEvent("physiok29:bridge-ready", { detail: { backend } }));
})();
