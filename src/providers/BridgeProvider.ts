import type { DataProvider } from './DataProvider';
import type { User, Student, Resource, Birthday, Announcement, UserRole, Suggestion, AnalyticsSummary, LeaderboardEntry, WeeklyActivity, EngagementRing, MemberStudyHistory } from '../types';

function requireBridge(): void {
  if (!(window as any).__PHYSIOK29_BACKEND__) {
    throw new Error('Bridge not connected: run within PhysioK29 Executive Portal');
  }
}

function getBackend(): any {
  return (window as any).__PHYSIOK29_BACKEND__;
}

/* ── Session cache ───────────────────────────────────────── */

const _cache = new Map<string, any[]>();

async function fetchCached(key: string, fetcher: () => Promise<any[]>): Promise<any[]> {
  if (_cache.has(key)) return _cache.get(key) as any[];
  const data = await fetcher();
  _cache.set(key, data);
  return data;
}

function clearCache() {
  _cache.clear();
}

/* ── Mappers ─────────────────────────────────────────────── */

function mapBridgeUser(supabaseUser: any, role: any): User {
  return {
    id: supabaseUser.id,
    name: role?.displayName || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    role: (role?.role as UserRole) || 'representative',
  };
}

function mapBridgeMember(m: any): Student {
  return {
    id: m.id,
    studentId: m.matricNumber || '',
    name: m.name || '',
    email: '',
    dateOfBirth: m.dateOfBirth || '',
    enrollmentStatus: 'active',
  };
}

function mapBridgeResource(r: any): Resource {
  const ext = r.fileName?.split('.').pop()?.toLowerCase() || '';
  const fileType = (['pdf', 'pptx', 'xlsx', 'docx'].includes(ext) ? ext : 'other') as Resource['fileType'];
  return {
    id: r.id,
    course: r.courseCode || '',
    courseCode: r.courseCode || '',
    week: 0,
    title: r.title || r.fileName || '',
    fileName: r.fileName || '',
    fileType,
    fileSize: 0,
    uploadDate: r.createdAtMs ? new Date(Number(r.createdAtMs)).toISOString() : new Date().toISOString(),
    uploadedBy: r.uploadedByUid || '',
    fileUrl: r.download_url || '',
  };
}

function mapBridgeAnnouncement(a: any): Announcement {
  return {
    id: a.id,
    title: a.title || '',
    content: a.message || '',
    date: a.createdAtMs ? new Date(Number(a.createdAtMs)).toISOString() : new Date().toISOString(),
    status: 'live',
    author: a.author || '',
  };
}

function mapBridgeBirthday(member: any): Birthday | null {
  if (!member.dateOfBirth) return null;
  const split = member.dateOfBirth.split('-');
  const monthNum = Number(split[1]) - 1;
  const day = Number(split[2]);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[monthNum] || '';
  const today = new Date();
  const bday = new Date(today.getFullYear(), monthNum, day);
  const diff = Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    id: `bday-${member.id}`,
    studentId: member.matricNumber || member.id,
    studentName: member.name || '',
    dateOfBirth: member.dateOfBirth || '',
    birthDate: `${day} ${month}`,
    photoUrl: member.photoUrl || '',
    daysUntilBirthday: diff >= 0 ? diff : diff + 365,
    isToday: diff === 0,
    month,
    day,
  };
}

function mapQuizAttempt(a: any) {
  return {
    id: `qa-${a.submittedAtMs || Date.now()}`,
    memberId: a.memberId,
    courseCode: a.courseCode || '',
    mode: a.mode as 'practice' | 'exam',
    score: Number(a.score || 0),
    questionCount: Number(a.questionCount || 0),
    percent: Number(a.percent || 0),
    durationSeconds: Number(a.durationSeconds || 0),
    submittedAtMs: Number(a.submittedAtMs || 0),
  };
}

/* ── In-memory auth store ────────────────────────────────── */

let _bridgeUser: User | null = null;

/* ── Provider (bridge-only, zero mock fallback) ──────────── */

export const bridgeProvider: DataProvider = {
  auth: {
    async login(email, password) {
      requireBridge();
      const backend = getBackend();
      await backend.signInRep(email, password);
      return new Promise<User>((resolve, reject) => {
        const unsub = backend.onAuth((supabaseUser: any, role: any) => {
          unsub();
          if (supabaseUser && role) {
            _bridgeUser = mapBridgeUser(supabaseUser, role);
            resolve(_bridgeUser);
          } else {
            reject(new Error('Login failed'));
          }
        });
        setTimeout(() => { unsub(); reject(new Error('Login timed out')); }, 15000);
      });
    },

    async logout() {
      requireBridge();
      _bridgeUser = null;
      clearCache();
      await getBackend().signOutRep();
    },

    async getCurrentUser() {
      if (_bridgeUser) return _bridgeUser;
      requireBridge();
      return new Promise((resolve) => {
        const unsub = getBackend().onAuth((supabaseUser: any, role: any) => {
          unsub();
          if (supabaseUser && role) {
            _bridgeUser = mapBridgeUser(supabaseUser, role);
            resolve(_bridgeUser);
          } else {
            resolve(null);
          }
        });
      });
    },
  },

  students: {
    async search(query) {
      requireBridge();
      const q = query.toLowerCase();
      const members = await fetchCached('members', () => getBackend().fetchMembers());
      return members.filter((m: any) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.matricNumber || '').toLowerCase().includes(q)
      ).map(mapBridgeMember);
    },
    async getById(id) {
      requireBridge();
      const members = await fetchCached('members', () => getBackend().fetchMembers());
      const member = members.find((m: any) => m.id === id);
      return member ? mapBridgeMember(member) : null;
    },
    async getAll() {
      requireBridge();
      const members = await fetchCached('members', () => getBackend().fetchMembers());
      return members.map(mapBridgeMember);
    },
  },

  profiles: {
    async getByStudentId(id) {
      requireBridge();
      const members = await fetchCached('members', () => getBackend().fetchMembers());
      const member = members.find((m: any) => m.matricNumber === id || m.id === id);
      if (!member) return null;
      return {
        id: `prof-${member.id}`,
        studentId: member.matricNumber || member.id,
        fullName: member.name || '',
        matricNumber: member.matricNumber || '',
        birthday: member.dateOfBirth || '',
        photoUrl: member.photoUrl || '',
        profileCompleted: !!member.photoUrl,
        createdAt: member.createdAtMs ? new Date(Number(member.createdAtMs)).toISOString() : new Date().toISOString(),
        updatedAt: member.lastSeenAtMs ? new Date(Number(member.lastSeenAtMs)).toISOString() : new Date().toISOString(),
      };
    },
    async getAll() {
      requireBridge();
      const members = await fetchCached('members', () => getBackend().fetchMembers());
      return members.map((m: any) => ({
        id: `prof-${m.id}`,
        studentId: m.matricNumber || m.id,
        fullName: m.name || '',
        matricNumber: m.matricNumber || '',
        birthday: m.dateOfBirth || '',
        photoUrl: m.photoUrl || '',
        profileCompleted: !!m.photoUrl,
        createdAt: m.createdAtMs ? new Date(Number(m.createdAtMs)).toISOString() : new Date().toISOString(),
        updatedAt: m.lastSeenAtMs ? new Date(Number(m.lastSeenAtMs)).toISOString() : new Date().toISOString(),
      }));
    },
    async create(_profile) { requireBridge(); throw new Error('Bridge: profile creation not supported'); },
    async updatePhoto(_id, _url) { requireBridge(); throw new Error('Bridge: photo update not supported'); },
  },

  birthdays: {
    async getUpcoming(month) {
      requireBridge();
      const members = await fetchCached('members', () => getBackend().fetchMembers());
      let birthdays = members.filter((m: any) => m.dateOfBirth).map(mapBridgeBirthday).filter(Boolean) as Birthday[];
      if (month !== undefined) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const target = monthNames[month] || '';
        birthdays = birthdays.filter((b) => b.month === target);
      }
      return birthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
    },
    async getByStudentId(studentId) {
      requireBridge();
      const members = await fetchCached('members', () => getBackend().fetchMembers());
      const member = members.find((m: any) => m.matricNumber === studentId || m.id === studentId);
      return member?.dateOfBirth ? mapBridgeBirthday(member) : null;
    },
  },

  resources: {
    async create(_resource) { requireBridge(); throw new Error('Bridge: resource upload via backend.uploadResource()'); },
    async getAll() {
      requireBridge();
      const resources = await fetchCached('resources', () => getBackend().fetchResources());
      return resources.map(mapBridgeResource);
    },
    async getByCourse(courseCode) {
      requireBridge();
      const resources = await fetchCached('resources', () => getBackend().fetchResources());
      return resources.filter((r: any) => r.courseCode === courseCode).map(mapBridgeResource);
    },
    async delete(id) {
      requireBridge();
      const resources = await fetchCached('resources', () => getBackend().fetchResources());
      const resource = resources.find((r: any) => r.id === id);
      if (!resource) throw new Error('Resource not found');
      await getBackend().deleteResource(resource);
    },
  },

  receipts: {
    async upload() { requireBridge(); return [] as any; },
    async getAll() { requireBridge(); return []; },
    async getById() { requireBridge(); return null; },
    async verify() { requireBridge(); throw new Error('Bridge: receipt verification not supported'); },
    async getPending() { requireBridge(); return []; },
  },

  announcements: {
    async publish(announcement) {
      requireBridge();
      await getBackend().postAnnouncement({
        title: announcement.title,
        message: announcement.content,
        ...(announcement.author ? { author: announcement.author } : {}),
      });
      return { ...announcement, id: `ann-bridge-${Date.now()}` };
    },
    async getAll() {
      requireBridge();
      const announcements = await fetchCached('announcements', () => getBackend().fetchAnnouncements());
      return announcements.map(mapBridgeAnnouncement);
    },
    async getActive() {
      requireBridge();
      const announcements = await fetchCached('announcements', () => getBackend().fetchAnnouncements());
      return announcements.map(mapBridgeAnnouncement);
    },
  },

  courses: {
    async getAll() { requireBridge(); return []; },
    async getById() { requireBridge(); return null; },
  },

  notifications: {
    async getAll() { requireBridge(); return []; },
    async getUnread() { requireBridge(); return []; },
    async markAsRead() { requireBridge(); },
  },

  activity: {
    async getRecent() { requireBridge(); return []; },
    async log() { requireBridge(); },
  },

  analytics: {
    async getSummary(): Promise<AnalyticsSummary> {
      requireBridge();
      const [attempts, events] = await Promise.all([
        fetchCached('quizAttempts', () => getBackend().fetchQuizAttempts()),
        fetchCached('studyEvents', () => getBackend().fetchStudyEvents()),
      ]);
      const total = attempts.length;
      const totalQ = attempts.reduce((sum: number, a: any) => sum + Number(a.questionCount || 0), 0);
      const totalScore = attempts.reduce((sum: number, a: any) => sum + Number(a.score || 0), 0);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return {
        totalAttempts: total,
        avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
        uniqueStudents: new Set(attempts.map((a: any) => a.memberId)).size,
        avgDuration: total ? Math.round(attempts.reduce((sum: number, a: any) => sum + Number(a.durationSeconds || 0), 0) / total) : 0,
        totalQuizzes: attempts.filter((a: any) => a.mode === 'practice').length,
        totalExams: attempts.filter((a: any) => a.mode === 'exam').length,
        totalStudyMinutes: Math.round(attempts.reduce((sum: number, a: any) => sum + Number(a.durationSeconds || 0), 0) / 60),
        activeToday: new Set(events.filter((e: any) => e.createdAtMs >= Date.now() - 86400000).map((e: any) => e.memberId)).size,
        activeWeek: new Set(events.filter((e: any) => e.createdAtMs >= weekAgo).map((e: any) => e.memberId)).size,
        topStreak: 0,
        topStreakMember: '',
        classAverage: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
      };
    },

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
      requireBridge();
      const [members, attempts] = await Promise.all([
        fetchCached('members', () => getBackend().fetchMembers()),
        fetchCached('quizAttempts', () => getBackend().fetchQuizAttempts()),
      ]);
      return members
        .map((m: any) => {
          const mine = attempts.filter((a: any) => a.memberId === m.id);
          const totalQ = mine.reduce((sum: number, a: any) => sum + Number(a.questionCount || 0), 0);
          const totalScore = mine.reduce((sum: number, a: any) => sum + Number(a.score || 0), 0);
          return {
            memberId: m.id,
            memberName: m.name || '',
            matricNumber: m.matricNumber || '',
            attemptCount: mine.length,
            avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
            streak: 0,
            lastActive: Math.max(...mine.map((a: any) => a.submittedAtMs || 0), 0),
          };
        })
        .filter((e: any) => e.attemptCount > 0)
        .sort((a: any, b: any) => b.attemptCount - a.attemptCount);
    },

    async getWeeklyActivity(days = 7): Promise<WeeklyActivity[]> {
      requireBridge();
      const events = await fetchCached('studyEvents', () => getBackend().fetchStudyEvents());
      const result: WeeklyActivity[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const count = new Set(events.filter((e: any) => new Date(e.createdAtMs).toISOString().slice(0, 10) === key).map((e: any) => e.memberId)).size;
        result.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), value: count });
      }
      return result;
    },

    async getEngagementRing(): Promise<EngagementRing> {
      requireBridge();
      const [resources, progress] = await Promise.all([
        fetchCached('resources', () => getBackend().fetchResources()),
        fetchCached('resourceProgress', () => getBackend().fetchResourceProgress()),
      ]);
      const total = resources.length || 1;
      const opened = progress.length;
      const reading = progress.filter((p: any) => ['reading', 'urgent', 'done'].includes(p.status)).length;
      const done = progress.filter((p: any) => p.status === 'done').length;
      return {
        total, opened, reading, done,
        notStarted: total - opened,
        percentOpened: Math.round((opened / total) * 100),
      };
    },

    async getMemberHistory(memberId: string): Promise<MemberStudyHistory> {
      requireBridge();
      const [members, attempts, topics] = await Promise.all([
        fetchCached('members', () => getBackend().fetchMembers()),
        fetchCached('quizAttempts', () => getBackend().fetchQuizAttempts()),
        fetchCached('topicPerformance', () => getBackend().fetchTopicPerformance()),
      ]);
      const member = members.find((m: any) => m.id === memberId);
      const memberAttempts = attempts.filter((a: any) => a.memberId === memberId).sort((a: any, b: any) => b.submittedAtMs - a.submittedAtMs).map(mapQuizAttempt);
      const memberTopics = topics.filter((t: any) => t.memberId === memberId).map((t: any) => ({
        memberId: t.memberId,
        topic: t.topic || '',
        accuracy: Number(t.accuracy || 0),
        attempts: Number(t.attempts || 0),
      }));
      return {
        member: { id: memberId, name: member?.name || 'Unknown', matricNumber: member?.matricNumber || '' },
        attempts: memberAttempts,
        topics: memberTopics,
        streak: 0,
      };
    },

    async getRecentUploads(days = 7): Promise<Resource[]> {
      requireBridge();
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const resources = await fetchCached('resources', () => getBackend().fetchResources());
      return resources
        .filter((r: any) => Number(r.createdAtMs || 0) >= cutoff)
        .sort((a: any, b: any) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
        .map(mapBridgeResource);
    },

    async getCourseResourceStats(): Promise<{ courseCode: string; count: number; lastUpload: number }[]> {
      requireBridge();
      const resources = await fetchCached('resources', () => getBackend().fetchResources());
      const perCourse: Record<string, { count: number; lastUpload: number }> = {};
      resources.forEach((r: any) => {
        if (!perCourse[r.courseCode]) perCourse[r.courseCode] = { count: 0, lastUpload: 0 };
        perCourse[r.courseCode].count++;
        perCourse[r.courseCode].lastUpload = Math.max(perCourse[r.courseCode].lastUpload, Number(r.createdAtMs || 0));
      });
      return Object.entries(perCourse).map(([courseCode, stats]) => ({ courseCode, ...stats })).sort((a, b) => b.count - a.count);
    },
  },

  suggestions: {
    async getAll(): Promise<Suggestion[]> {
      requireBridge();
      const suggestions = await fetchCached('suggestions', () => getBackend().fetchSuggestions());
      return suggestions.map((sg: any) => ({
        id: sg.id,
        name: sg.name || '',
        matricNumber: sg.matricNumber || '',
        category: sg.category || '',
        message: sg.message || '',
        status: (sg.status || 'pending') as 'pending' | 'reviewed' | 'addressed',
        createdAtMs: Number(sg.createdAtMs || 0),
      }));
    },
    async getById(id: string): Promise<Suggestion | null> {
      requireBridge();
      const suggestions = await fetchCached('suggestions', () => getBackend().fetchSuggestions());
      const sg = suggestions.find((s: any) => s.id === id);
      if (!sg) return null;
      return {
        id: sg.id,
        name: sg.name || '',
        matricNumber: sg.matricNumber || '',
        category: sg.category || '',
        message: sg.message || '',
        status: (sg.status || 'pending') as 'pending' | 'reviewed' | 'addressed',
        createdAtMs: Number(sg.createdAtMs || 0),
      };
    },
    async deleteSuggestion(id: string): Promise<void> {
      requireBridge();
      await getBackend().deleteSuggestion(id);
    },
  },
};
