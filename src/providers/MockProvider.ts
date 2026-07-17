import type { DataProvider } from './DataProvider';
import type { User, Resource, Receipt, Notification, ActivityEntry, StudentProfile, Suggestion, QuizAttempt, AnalyticsSummary, LeaderboardEntry, WeeklyActivity, EngagementRing, MemberStudyHistory } from '../types';
import { mockUsers } from '../mock/users';
import { mockStudents } from '../mock/students';
import { mockResources } from '../mock/resources';
import { mockReceipts } from '../mock/receipts';
import { mockBirthdays } from '../mock/birthdays';
import { mockCourses } from '../mock/courses';
import { mockAnnouncements } from '../mock/announcements';

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

let receiptsStore = [...mockReceipts];
let resourcesStore = [...mockResources];
let announcementsStore = [...mockAnnouncements];
let notificationsStore: Notification[] = [
  { id: 'not-001', title: 'Birthday Profile Submitted', message: '3 new birthday profiles need review.', type: 'info', read: false, timestamp: '1 hour ago' },
  { id: 'not-002', title: 'Receipt Uploaded', message: '12 receipts awaiting verification.', type: 'warning', read: false, timestamp: '3 hours ago' },
  { id: 'not-003', title: 'PHY102 Slides Uploaded', message: 'Week 4 materials are ready for review.', type: 'success', read: true, timestamp: 'Yesterday' },
];
let activityStore: ActivityEntry[] = [
  { id: 'act-001', action: 'Uploaded receipt', actor: 'Treasurer', actorRole: 'treasurer', module: 'Finance', timestamp: '10:41 AM', category: 'upload' },
  { id: 'act-002', action: 'Downloaded birthday photo', actor: 'Designer', actorRole: 'designer', module: 'Birthdays', target: "Mary's photo", timestamp: '10:38 AM', category: 'download' },
  { id: 'act-003', action: 'Published announcement', actor: 'Representative', actorRole: 'representative', module: 'Announcements', timestamp: '10:10 AM', category: 'publish' },
  { id: 'act-004', action: 'Uploaded PHY102 Week 4 Slides', actor: 'Academic', actorRole: 'academic', module: 'Resources', timestamp: 'Yesterday', category: 'upload' },
  { id: 'act-005', action: 'Verified receipt REC-99020', actor: 'Auditor', actorRole: 'auditor', module: 'Audit', timestamp: 'Yesterday', category: 'verify' },
];

let suggestionsStore: Suggestion[] = [
  { id: 'sg-001', name: 'Amara Okafor', matricNumber: 'K29/001', category: 'Course Material', message: 'The PHY102 slides for week 3 seem incomplete. Could you please review?', status: 'pending', createdAtMs: Date.now() - 3600000 },
  { id: 'sg-002', name: 'Elena Rossi', matricNumber: 'K29/002', category: 'Timetable', message: 'Can we adjust the lab schedule for next week? Conflicts with CHM101.', status: 'pending', createdAtMs: Date.now() - 7200000 },
  { id: 'sg-003', name: 'Marcus Chen', matricNumber: 'K29/003', category: 'General', message: 'Great work on the new portal! The quiz feature is very helpful.', status: 'reviewed', createdAtMs: Date.now() - 86400000 },
];

let mockQuizAttempts: QuizAttempt[] = [
  { id: 'qa-001', memberId: 'stu-001', memberName: 'Amara Okafor', courseCode: 'PHY101', mode: 'practice', score: 8, questionCount: 10, percent: 80, durationSeconds: 420, submittedAtMs: Date.now() - 86400000 },
  { id: 'qa-002', memberId: 'stu-001', memberName: 'Amara Okafor', courseCode: 'PHY101', mode: 'exam', score: 18, questionCount: 20, percent: 90, durationSeconds: 1200, submittedAtMs: Date.now() - 43200000 },
  { id: 'qa-003', memberId: 'stu-002', memberName: 'Babatunde Lawal', courseCode: 'CHM101', mode: 'practice', score: 6, questionCount: 10, percent: 60, durationSeconds: 360, submittedAtMs: Date.now() - 172800000 },
  { id: 'qa-004', memberId: 'stu-002', memberName: 'Babatunde Lawal', courseCode: 'CHM101', mode: 'exam', score: 14, questionCount: 20, percent: 70, durationSeconds: 900, submittedAtMs: Date.now() - 86400000 },
  { id: 'qa-005', memberId: 'stu-003', memberName: 'Chinelo Eze', courseCode: 'BIO201', mode: 'practice', score: 9, questionCount: 10, percent: 90, durationSeconds: 300, submittedAtMs: Date.now() - 21600000 },
  { id: 'qa-006', memberId: 'stu-004', memberName: 'David Adeyemi', courseCode: 'PHY101', mode: 'practice', score: 5, questionCount: 10, percent: 50, durationSeconds: 480, submittedAtMs: Date.now() - 3600000 },
  { id: 'qa-007', memberId: 'stu-005', memberName: 'Ester Nwosu', courseCode: 'MTH201', mode: 'exam', score: 16, questionCount: 20, percent: 80, durationSeconds: 1500, submittedAtMs: Date.now() - 7200000 },
  { id: 'qa-008', memberId: 'stu-001', memberName: 'Amara Okafor', courseCode: 'BIO201', mode: 'practice', score: 7, questionCount: 10, percent: 70, durationSeconds: 390, submittedAtMs: Date.now() - 1800000 },
];

let profileStore: StudentProfile[] = [
  { id: 'prof-001', studentId: 'STU-8821', fullName: 'Amara Okafor', matricNumber: 'K29/001', birthday: '2012-07-18', photoUrl: mockBirthdays[0]?.photoUrl, profileCompleted: true, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
  { id: 'prof-002', studentId: 'STU-8865', fullName: 'Elena Rossi', matricNumber: 'K29/002', birthday: '2012-07-20', profileCompleted: false, createdAt: '2026-06-05', updatedAt: '2026-06-05' },
];

export const mockProvider: DataProvider = {
  auth: {
    async login(email: string) {
      await delay(500);
      const user = mockUsers.find(u => u.email === email);
      if (!user) throw new Error('Invalid credentials');
      return user;
    },
    async logout() { await delay(200); },
    async getCurrentUser() {
      await delay(100);
      const stored = localStorage.getItem('exec_user');
      return stored ? JSON.parse(stored) as User : null;
    },
  },
  students: {
    async search(query) {
      await delay();
      const q = query.toLowerCase();
      return mockStudents.filter(s => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q));
    },
    async getById(id) { await delay(); return mockStudents.find(s => s.id === id) ?? null; },
    async getAll() { await delay(); return mockStudents; },
  },
  profiles: {
    async getByStudentId(id) { await delay(); return profileStore.find(p => p.studentId === id) ?? null; },
    async getAll() { await delay(); return profileStore; },
    async create(profile) {
      await delay(300);
      const now = new Date().toISOString();
      const newProfile: StudentProfile = { ...profile, id: `prof-${String(profileStore.length + 1).padStart(3, '0')}`, createdAt: now, updatedAt: now };
      profileStore.push(newProfile);
      return newProfile;
    },
    async updatePhoto(id, photoUrl) {
      await delay(200);
      const p = profileStore.find(p => p.id === id);
      if (!p) throw new Error('Profile not found');
      p.photoUrl = photoUrl;
      p.updatedAt = new Date().toISOString();
      return { ...p };
    },
  },
  birthdays: {
    async getUpcoming() { await delay(); return [...mockBirthdays].sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday); },
    async getByStudentId(studentId) { await delay(); return mockBirthdays.find(b => b.studentId === studentId) ?? null; },
  },
  resources: {
    async create(resource) {
      await delay(400);
      const newResource: Resource = { ...resource, id: `res-${String(resourcesStore.length + 1).padStart(3, '0')}`, uploadDate: new Date().toISOString() };
      resourcesStore = [newResource, ...resourcesStore];
      return newResource;
    },
    async getAll() { await delay(); return [...resourcesStore]; },
    async getByCourse(courseCode) { await delay(); return resourcesStore.filter(r => r.courseCode === courseCode); },
    async delete(id) { await delay(200); resourcesStore = resourcesStore.filter(r => r.id !== id); },
  },
  receipts: {
    async upload(receipt) {
      await delay(600);
      const newReceipt: Receipt = { ...receipt, id: `rec-${String(receiptsStore.length + 1).padStart(3, '0')}`, status: 'pending' };
      receiptsStore = [newReceipt, ...receiptsStore];
      return newReceipt;
    },
    async getAll() { await delay(); return [...receiptsStore]; },
    async getById(id) { await delay(); return receiptsStore.find(r => r.id === id) ?? null; },
    async verify(id, userId) {
      await delay(600);
      const receipt = receiptsStore.find(r => r.id === id);
      if (!receipt) throw new Error('Receipt not found');
      receipt.status = 'verified';
      receipt.verifiedBy = userId;
      receipt.verifiedAt = new Date().toISOString();
      return { ...receipt };
    },
    async getPending() { await delay(); return receiptsStore.filter(r => r.status === 'pending'); },
  },
  announcements: {
    async publish(announcement) {
      await delay(400);
      const newAnn = { ...announcement, id: `ann-${String(announcementsStore.length + 1).padStart(3, '0')}` };
      announcementsStore = [newAnn, ...announcementsStore];
      return newAnn;
    },
    async getAll() { await delay(); return [...announcementsStore]; },
    async getActive() { await delay(); return announcementsStore.filter(a => a.status === 'live'); },
  },
  courses: {
    async getAll() { await delay(); return [...mockCourses]; },
    async getById(id) { await delay(); return mockCourses.find(c => c.id === id) ?? null; },
  },
  notifications: {
    async getAll() { await delay(); return [...notificationsStore]; },
    async getUnread() { await delay(); return notificationsStore.filter(n => !n.read); },
    async markAsRead(id) { await delay(); const n = notificationsStore.find(n => n.id === id); if (n) n.read = true; },
  },
  activity: {
    async getRecent(limit = 10) { await delay(); return activityStore.slice(0, limit); },
    async log(entry) {
      activityStore = [{ id: `act-${String(activityStore.length + 1).padStart(3, '0')}`, ...entry }, ...activityStore];
    },
  },

  analytics: {
    async getSummary(): Promise<AnalyticsSummary> {
      await delay();
      const total = mockQuizAttempts.length;
      const totalQ = mockQuizAttempts.reduce((sum, a) => sum + a.questionCount, 0);
      const totalScore = mockQuizAttempts.reduce((sum, a) => sum + a.score, 0);
      return {
        totalAttempts: total,
        avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
        uniqueStudents: new Set(mockQuizAttempts.map(a => a.memberId)).size,
        avgDuration: total ? Math.round(mockQuizAttempts.reduce((sum, a) => sum + a.durationSeconds, 0) / total) : 0,
        totalQuizzes: mockQuizAttempts.filter(a => a.mode === 'practice').length,
        totalExams: mockQuizAttempts.filter(a => a.mode === 'exam').length,
        totalStudyMinutes: Math.round(mockQuizAttempts.reduce((sum, a) => sum + a.durationSeconds, 0) / 60),
        activeToday: 12,
        activeWeek: 45,
        topStreak: 7,
        topStreakMember: 'Amara Okafor',
        classAverage: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
      };
    },

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
      await delay();
      return mockStudents
        .map(s => {
          const mine = mockQuizAttempts.filter(a => a.memberId === s.id);
          const totalQ = mine.reduce((sum, a) => sum + a.questionCount, 0);
          const totalScore = mine.reduce((sum, a) => sum + a.score, 0);
          return {
            memberId: s.id,
            memberName: s.name,
            matricNumber: s.studentId,
            attemptCount: mine.length,
            avgPercent: totalQ ? Math.round((totalScore / totalQ) * 100) : 0,
            streak: Math.floor(Math.random() * 14),
            lastActive: Date.now() - Math.floor(Math.random() * 86400000),
          };
        })
        .filter(e => e.attemptCount > 0)
        .sort((a, b) => b.attemptCount - a.attemptCount);
    },

    async getWeeklyActivity(): Promise<WeeklyActivity[]> {
      await delay();
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map(day => ({ day, value: Math.floor(Math.random() * 20) + 1 }));
    },

    async getEngagementRing(): Promise<EngagementRing> {
      await delay();
      return { total: 45, opened: 32, reading: 12, done: 8, notStarted: 13, percentOpened: 71 };
    },

    async getMemberHistory(memberId: string): Promise<MemberStudyHistory> {
      await delay();
      const student = mockStudents.find(s => s.id === memberId);
      const attempts = mockQuizAttempts.filter(a => a.memberId === memberId);
      return {
        member: { id: memberId, name: student?.name || 'Unknown', matricNumber: student?.studentId || '' },
        attempts,
        topics: [
          { memberId, topic: 'Mechanics', accuracy: 82, attempts: 5 },
          { memberId, topic: 'Thermodynamics', accuracy: 65, attempts: 3 },
          { memberId, topic: 'Waves & Optics', accuracy: 90, attempts: 4 },
        ],
        streak: Math.floor(Math.random() * 10),
      };
    },

    async getRecentUploads(_days = 7): Promise<Resource[]> {
      await delay();
      return resourcesStore.slice(0, 5);
    },

    async getCourseResourceStats(): Promise<{ courseCode: string; count: number; lastUpload: number }[]> {
      await delay();
      const map: Record<string, number> = {};
      resourcesStore.forEach(r => { map[r.courseCode] = (map[r.courseCode] || 0) + 1; });
      return Object.entries(map).map(([courseCode, count]) => ({
        courseCode, count, lastUpload: Date.now() - Math.floor(Math.random() * 604800000),
      })).sort((a, b) => b.count - a.count);
    },
  },

  suggestions: {
    async getAll(): Promise<Suggestion[]> {
      await delay();
      return [...suggestionsStore];
    },
    async getById(id: string): Promise<Suggestion | null> {
      await delay();
      return suggestionsStore.find(s => s.id === id) ?? null;
    },
    async deleteSuggestion(id: string): Promise<void> {
      await delay(200);
      suggestionsStore = suggestionsStore.filter(s => s.id !== id);
    },
  },
};
