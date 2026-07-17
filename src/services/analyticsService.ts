import type { AnalyticsSummary, LeaderboardEntry, WeeklyActivity, EngagementRing, MemberStudyHistory, Resource } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface IAnalyticsService {
  getSummary(): Promise<AnalyticsSummary>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getWeeklyActivity(days?: number): Promise<WeeklyActivity[]>;
  getEngagementRing(): Promise<EngagementRing>;
  getMemberHistory(memberId: string): Promise<MemberStudyHistory>;
  getRecentUploads(days?: number): Promise<Resource[]>;
  getCourseResourceStats(): Promise<{ courseCode: string; count: number; lastUpload: number }[]>;
}

/* ── Mock data ───────────────────────────────────────────── */

const MOCK_ATTEMPTS = [
  { memberId: 'm1', courseCode: 'ANA101', mode: 'practice', score: 8, questionCount: 10, percent: 80, durationSeconds: 600, submittedAtMs: Date.now() - 86400000 },
  { memberId: 'm1', courseCode: 'PHS102', mode: 'exam', score: 15, questionCount: 20, percent: 75, durationSeconds: 1200, submittedAtMs: Date.now() - 86400000 * 2 },
  { memberId: 'm2', courseCode: 'ANA101', mode: 'practice', score: 9, questionCount: 10, percent: 90, durationSeconds: 500, submittedAtMs: Date.now() - 3600000 },
  { memberId: 'm3', courseCode: 'BCH101', mode: 'exam', score: 12, questionCount: 20, percent: 60, durationSeconds: 1500, submittedAtMs: Date.now() - 86400000 * 3 },
];

const MOCK_EVENTS = [
  { memberId: 'm1', createdAtMs: Date.now() - 3600000 },
  { memberId: 'm1', createdAtMs: Date.now() - 7200000 },
  { memberId: 'm2', createdAtMs: Date.now() - 1800000 },
  { memberId: 'm3', createdAtMs: Date.now() - 86400000 * 5 },
];

const MOCK_MEMBERS = [
  { id: 'm1', name: 'John Doe', matricNumber: '20/1234' },
  { id: 'm2', name: 'Jane Smith', matricNumber: '20/5678' },
  { id: 'm3', name: 'Samuel Green', matricNumber: '20/9012' },
];

const MOCK_TOPIC_PERF = [
  { memberId: 'm1', topic: 'Cardiovascular', accuracy: 85, attempts: 3 },
  { memberId: 'm1', topic: 'Respiratory', accuracy: 70, attempts: 2 },
  { memberId: 'm2', topic: 'Cardiovascular', accuracy: 92, attempts: 4 },
];

/* ── Mock implementation ─────────────────────────────────── */

class MockAnalyticsService implements IAnalyticsService {
  async getSummary(): Promise<AnalyticsSummary> {
    const total = MOCK_ATTEMPTS.length;
    const totalQ = MOCK_ATTEMPTS.reduce((s, a) => s + a.questionCount, 0);
    const totalScore = MOCK_ATTEMPTS.reduce((s, a) => s + a.score, 0);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      totalAttempts: total,
      avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
      uniqueStudents: new Set(MOCK_ATTEMPTS.map(a => a.memberId)).size,
      avgDuration: total ? Math.round(MOCK_ATTEMPTS.reduce((s, a) => s + a.durationSeconds, 0) / total) : 0,
      totalQuizzes: MOCK_ATTEMPTS.filter(a => a.mode === 'practice').length,
      totalExams: MOCK_ATTEMPTS.filter(a => a.mode === 'exam').length,
      totalStudyMinutes: Math.round(MOCK_ATTEMPTS.reduce((s, a) => s + a.durationSeconds, 0) / 60),
      activeToday: new Set(MOCK_EVENTS.filter(e => e.createdAtMs >= Date.now() - 86400000).map(e => e.memberId)).size,
      activeWeek: new Set(MOCK_EVENTS.filter(e => e.createdAtMs >= weekAgo).map(e => e.memberId)).size,
      topStreak: 0,
      topStreakMember: '',
      classAverage: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
    };
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return (MOCK_MEMBERS ?? []).map((m: any) => {
      const mine = MOCK_ATTEMPTS.filter(a => a.memberId === m.id);
      const totalQ = mine.reduce((s, a) => s + a.questionCount, 0);
      const totalScore = mine.reduce((s, a) => s + a.score, 0);
      return {
        memberId: m.id,
        memberName: m.name || '',
        matricNumber: m.matricNumber || '',
        attemptCount: mine.length,
        avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
        streak: 0,
        lastActive: Math.max(...mine.map(a => a.submittedAtMs || 0), 0),
      };
    }).filter((e: any) => e.attemptCount > 0).sort((a: any, b: any) => b.attemptCount - a.attemptCount);
  }

  async getWeeklyActivity(days = 7): Promise<WeeklyActivity[]> {
    const result: WeeklyActivity[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = new Set(MOCK_EVENTS.filter(e => new Date(e.createdAtMs).toISOString().slice(0, 10) === key).map(e => e.memberId)).size;
      result.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), value: count });
    }
    return result;
  }

  async getEngagementRing(): Promise<EngagementRing> {
    return { total: 3, opened: 2, reading: 1, done: 1, notStarted: 1, percentOpened: 67 };
  }

  async getMemberHistory(memberId: string): Promise<MemberStudyHistory> {
    const member = (MOCK_MEMBERS ?? []).find((m: any) => m.id === memberId);
    const attempts = MOCK_ATTEMPTS.filter(a => a.memberId === memberId).sort((a, b) => b.submittedAtMs - a.submittedAtMs).map(a => ({
      id: `qa-${a.submittedAtMs}`,
      memberId: a.memberId,
      courseCode: a.courseCode,
      mode: a.mode as 'practice' | 'exam',
      score: a.score,
      questionCount: a.questionCount,
      percent: a.percent,
      durationSeconds: a.durationSeconds,
      submittedAtMs: a.submittedAtMs,
    }));
    const topics = MOCK_TOPIC_PERF.filter(t => t.memberId === memberId);
    return {
      member: { id: memberId, name: member?.name || 'Unknown', matricNumber: member?.matricNumber || '' },
      attempts,
      topics,
      streak: 0,
    };
  }

  async getRecentUploads(_days = 7): Promise<Resource[]> {
    return [];
  }

  async getCourseResourceStats(): Promise<{ courseCode: string; count: number; lastUpload: number }[]> {
    return [];
  }
}

/* ── Supabase implementation ─────────────────────────────── */

class SupabaseAnalyticsService implements IAnalyticsService {
  async getSummary(): Promise<AnalyticsSummary> {
    const [attempts, events] = await Promise.all([
      supabase.from('quiz_attempts').select('*'),
      supabase.from('study_events').select('*'),
    ]);
    const a = attempts.data || [];
    const e = events.data || [];
    const total = a.length;
    const totalQ = a.reduce((s: number, r: any) => s + Number(r.question_count || 0), 0);
    const totalScore = a.reduce((s: number, r: any) => s + Number(r.score || 0), 0);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const aMs = a.map((r: any) => ({ memberId: r.member_id, submittedAtMs: r.submitted_at ? new Date(r.submitted_at).getTime() : 0 }));
    const eMs = e.map((r: any) => ({ memberId: r.member_id, createdAtMs: r.created_at ? new Date(r.created_at).getTime() : 0 }));
    return {
      totalAttempts: total,
      avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
      uniqueStudents: new Set(aMs.map((r: any) => r.memberId)).size,
      avgDuration: total ? Math.round(a.reduce((s: number, r: any) => s + Number(r.duration_seconds || 0), 0) / total) : 0,
      totalQuizzes: a.filter((r: any) => r.mode === 'practice').length,
      totalExams: a.filter((r: any) => r.mode === 'exam').length,
      totalStudyMinutes: Math.round(a.reduce((s: number, r: any) => s + Number(r.duration_seconds || 0), 0) / 60),
      activeToday: new Set(eMs.filter((r: any) => r.createdAtMs >= Date.now() - 86400000).map((r: any) => r.memberId)).size,
      activeWeek: new Set(eMs.filter((r: any) => r.createdAtMs >= weekAgo).map((r: any) => r.memberId)).size,
      topStreak: 0,
      topStreakMember: '',
      classAverage: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
    };
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const [members, attempts] = await Promise.all([
      supabase.from('members').select('id, full_name, name, matric_number'),
      supabase.from('quiz_attempts').select('*'),
    ]);
    const m = members.data || [];
    const a = attempts.data || [];
    return m.map((row: any) => {
      const mine = a.filter((r: any) => r.member_id === row.id);
      const totalQ = mine.reduce((s: number, r: any) => s + Number(r.question_count || 0), 0);
      const totalScore = mine.reduce((s: number, r: any) => s + Number(r.score || 0), 0);
      return {
        memberId: row.id,
        memberName: row.full_name || row.name || '',
        matricNumber: row.matric_number || '',
        attemptCount: mine.length,
        avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
        streak: 0,
        lastActive: Math.max(...mine.map((r: any) => r.submitted_at ? new Date(r.submitted_at).getTime() : 0), 0),
      };
    }).filter(e => e.attemptCount > 0).sort((a, b) => b.attemptCount - a.attemptCount);
  }

  async getWeeklyActivity(days = 7): Promise<WeeklyActivity[]> {
    const { data, error } = await supabase.from('study_events').select('created_at, member_id');
    if (error) return [];
    const events = (data || []).map(r => ({ memberId: r.member_id, createdAtMs: r.created_at ? new Date(r.created_at).getTime() : 0 }));
    const result: WeeklyActivity[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = new Set(events.filter(e => new Date(e.createdAtMs).toISOString().slice(0, 10) === key).map(e => e.memberId)).size;
      result.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), value: count });
    }
    return result;
  }

  async getEngagementRing(): Promise<EngagementRing> {
    const [resources, progress] = await Promise.all([
      supabase.from('resources').select('id'),
      supabase.from('resource_progress').select('status'),
    ]);
    const total = (resources.data || []).length || 1;
    const p = progress.data || [];
    const opened = p.length;
    const reading = p.filter(r => ['reading', 'urgent', 'done'].includes(r.status)).length;
    const done = p.filter(r => r.status === 'done').length;
    return { total, opened, reading, done, notStarted: total - opened, percentOpened: Math.round((opened / total) * 100) };
  }

  async getMemberHistory(memberId: string): Promise<MemberStudyHistory> {
    const [member, attempts, topics] = await Promise.all([
      supabase.from('members').select('id, full_name, name, matric_number').eq('id', memberId).maybeSingle(),
      supabase.from('quiz_attempts').select('*').eq('member_id', memberId).order('submitted_at', { ascending: false }),
      supabase.from('topic_performance').select('*').eq('member_id', memberId),
    ]);
    const m = member.data;
    const a = (attempts.data || []).map((r: any) => ({
      id: `qa-${r.id}`,
      memberId: r.member_id,
      courseCode: r.course_code || '',
      mode: (r.mode || 'practice') as 'practice' | 'exam',
      score: Number(r.score || 0),
      questionCount: Number(r.question_count || 0),
      percent: Number(r.percent || 0),
      durationSeconds: Number(r.duration_seconds || 0),
      submittedAtMs: r.submitted_at ? new Date(r.submitted_at).getTime() : 0,
    }));
    const t = (topics.data || []).map((r: any) => ({
      memberId: r.member_id,
      topic: r.topic || '',
      accuracy: Number(r.accuracy || 0),
      attempts: Number(r.attempts || 0),
    }));
    return {
      member: { id: memberId, name: m?.full_name || m?.name || 'Unknown', matricNumber: m?.matric_number || '' },
      attempts: a,
      topics: t,
      streak: 0,
    };
  }

  async getRecentUploads(days = 7): Promise<Resource[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from('resources').select('*').gte('created_at', cutoff).order('created_at', { ascending: false });
    if (error) return [];
    const extMap: Record<string, Resource['fileType']> = { pdf: 'pdf', pptx: 'pptx', xlsx: 'xlsx', docx: 'docx' };
    return (data || []).map(r => ({
      id: r.id,
      course: r.course_code || '',
      courseCode: r.course_code || '',
      week: 0,
      title: r.title || r.file_name || '',
      fileName: r.file_name || '',
      fileType: extMap[r.file_name?.split('.').pop()?.toLowerCase() || ''] || 'other',
      fileSize: 0,
      uploadDate: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      uploadedBy: r.uploaded_by || '',
    }));
  }

  async getCourseResourceStats(): Promise<{ courseCode: string; count: number; lastUpload: number }[]> {
    const { data, error } = await supabase.from('resources').select('course_code, created_at');
    if (error) return [];
    const perCourse: Record<string, { count: number; lastUpload: number }> = {};
    (data || []).forEach((r: any) => {
      if (!perCourse[r.course_code]) perCourse[r.course_code] = { count: 0, lastUpload: 0 };
      perCourse[r.course_code].count++;
      const ts = r.created_at ? new Date(r.created_at).getTime() : 0;
      perCourse[r.course_code].lastUpload = Math.max(perCourse[r.course_code].lastUpload, ts);
    });
    return Object.entries(perCourse).map(([courseCode, stats]) => ({ courseCode, ...stats })).sort((a, b) => b.count - a.count);
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: IAnalyticsService = new SupabaseAnalyticsService();

export const analyticsService: IAnalyticsService = {
  getSummary: () => _impl.getSummary(),
  getLeaderboard: () => _impl.getLeaderboard(),
  getWeeklyActivity: d => _impl.getWeeklyActivity(d),
  getEngagementRing: () => _impl.getEngagementRing(),
  getMemberHistory: id => _impl.getMemberHistory(id),
  getRecentUploads: d => _impl.getRecentUploads(d),
  getCourseResourceStats: () => _impl.getCourseResourceStats(),
};
