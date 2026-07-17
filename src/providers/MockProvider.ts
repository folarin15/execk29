import type { DataProvider } from './DataProvider';
import type { User, Resource, Receipt, Notification, ActivityEntry, StudentProfile } from '../types';
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
};
