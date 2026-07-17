import type { DataProvider } from './DataProvider';
import type { User, Student, Resource, Receipt, Birthday, Announcement, Course, Notification, ActivityEntry, StudentProfile, UserRole } from '../types';
import { mockProvider } from './MockProvider';

/* ── Bridge accessors ────────────────────────────────────── */

function getBackend(): any {
  return (window as any).__PHYSIOK29_BACKEND__;
}

function getState(): any {
  return (window as any).__PHYSIOK29_STATE__ || {};
}

function isBridgeConnected(): boolean {
  return !!getBackend();
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

function mapBridgeBirthday(member: any): Birthday {
  if (!member.dateOfBirth) return null as any;
  const parts = member.dateOfBirth.split('-');
  const monthNum = Number(parts[1]) - 1;
  const day = Number(parts[2]);
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

/* ── In-memory store replicating bridge state ────────────── */

let _bridgeUser: User | null = null;

/* ── Provider ────────────────────────────────────────────── */

export const bridgeProvider: DataProvider = {
  auth: {
    async login(email: string, password: string): Promise<User> {
      const backend = getBackend();
      if (!backend) return mockProvider.auth.login(email, password);

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
        setTimeout(() => { unsub(); reject(new Error('Login timed out. Check your credentials.')); }, 15000);
      });
    },

    async logout(): Promise<void> {
      const backend = getBackend();
      if (!backend) return mockProvider.auth.logout();
      _bridgeUser = null;
      await backend.signOutRep();
    },

    async getCurrentUser(): Promise<User | null> {
      if (_bridgeUser) return _bridgeUser;
      const backend = getBackend();
      if (!backend) return mockProvider.auth.getCurrentUser();
      return new Promise((resolve) => {
        const unsub = backend.onAuth((supabaseUser: any, role: any) => {
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
    async search(query: string): Promise<Student[]> {
      if (!isBridgeConnected()) return mockProvider.students.search(query);
      const members = getState().members || [];
      const q = query.toLowerCase();
      return members.filter((m: any) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.matricNumber || '').toLowerCase().includes(q)
      ).map(mapBridgeMember);
    },

    async getById(id: string): Promise<Student | null> {
      if (!isBridgeConnected()) return mockProvider.students.getById(id);
      const member = (getState().members || []).find((m: any) => m.id === id);
      return member ? mapBridgeMember(member) : null;
    },

    async getAll(): Promise<Student[]> {
      if (!isBridgeConnected()) return mockProvider.students.getAll();
      return (getState().members || []).map(mapBridgeMember);
    },
  },

  profiles: {
    async getByStudentId(id: string): Promise<StudentProfile | null> {
      if (!isBridgeConnected()) return mockProvider.profiles.getByStudentId(id);
      const member = (getState().members || []).find((m: any) => m.matricNumber === id || m.id === id);
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

    async getAll(): Promise<StudentProfile[]> {
      if (!isBridgeConnected()) return mockProvider.profiles.getAll();
      return (getState().members || []).map((m: any) => ({
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

    async create(profile: Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudentProfile> {
      return mockProvider.profiles.create(profile);
    },

    async updatePhoto(id: string, photoUrl: string): Promise<StudentProfile> {
      return mockProvider.profiles.updatePhoto(id, photoUrl);
    },
  },

  birthdays: {
    async getUpcoming(month?: number): Promise<Birthday[]> {
      if (!isBridgeConnected()) return mockProvider.birthdays.getUpcoming(month);
      const members = getState().members || [];
      let birthdays = members
        .filter((m: any) => m.dateOfBirth)
        .map(mapBridgeBirthday)
        .filter(Boolean);

      if (month !== undefined) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const target = monthNames[month] || '';
        birthdays = birthdays.filter((b: Birthday) => b.month === target);
      }

      return birthdays.sort((a: Birthday, b: Birthday) => a.daysUntilBirthday - b.daysUntilBirthday);
    },

    async getByStudentId(studentId: string): Promise<Birthday | null> {
      if (!isBridgeConnected()) return mockProvider.birthdays.getByStudentId(studentId);
      const member = (getState().members || []).find(
        (m: any) => m.matricNumber === studentId || m.id === studentId
      );
      return member?.dateOfBirth ? mapBridgeBirthday(member) : null;
    },
  },

  resources: {
    async create(resource: Omit<Resource, 'id' | 'uploadDate'>): Promise<Resource> {
      return mockProvider.resources.create(resource);
    },

    async getAll(): Promise<Resource[]> {
      if (!isBridgeConnected()) return mockProvider.resources.getAll();
      return (getState().resources || []).map(mapBridgeResource);
    },

    async getByCourse(courseCode: string): Promise<Resource[]> {
      if (!isBridgeConnected()) return mockProvider.resources.getByCourse(courseCode);
      return (getState().resources || [])
        .filter((r: any) => r.courseCode === courseCode)
        .map(mapBridgeResource);
    },

    async delete(id: string): Promise<void> {
      const backend = getBackend();
      if (!backend) return mockProvider.resources.delete(id);
      const resource = (getState().resources || []).find((r: any) => r.id === id);
      if (!resource) throw new Error('Resource not found');
      await backend.deleteResource(resource);
    },
  },

  receipts: {
    async upload(receipt: Omit<Receipt, 'id' | 'status'>): Promise<Receipt> {
      return mockProvider.receipts.upload(receipt);
    },
    async getAll(): Promise<Receipt[]> {
      return mockProvider.receipts.getAll();
    },
    async getById(id: string): Promise<Receipt | null> {
      return mockProvider.receipts.getById(id);
    },
    async verify(id: string, userId: string): Promise<Receipt> {
      return mockProvider.receipts.verify(id, userId);
    },
    async getPending(): Promise<Receipt[]> {
      return mockProvider.receipts.getPending();
    },
  },

  announcements: {
    async publish(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
      const backend = getBackend();
      if (!backend) return mockProvider.announcements.publish(announcement);
      await backend.postAnnouncement({
        title: announcement.title,
        message: announcement.content,
        ...(announcement.author ? { author: announcement.author } : {}),
      });
      return { ...announcement, id: `ann-bridge-${Date.now()}` };
    },

    async getAll(): Promise<Announcement[]> {
      if (!isBridgeConnected()) return mockProvider.announcements.getAll();
      return (getState().announcements || []).map(mapBridgeAnnouncement);
    },

    async getActive(): Promise<Announcement[]> {
      if (!isBridgeConnected()) return mockProvider.announcements.getActive();
      return (getState().announcements || []).map(mapBridgeAnnouncement);
    },
  },

  courses: {
    async getAll(): Promise<Course[]> {
      return mockProvider.courses.getAll();
    },
    async getById(id: string): Promise<Course | null> {
      return mockProvider.courses.getById(id);
    },
  },

  notifications: {
    async getAll(): Promise<Notification[]> {
      return mockProvider.notifications.getAll();
    },
    async getUnread(): Promise<Notification[]> {
      return mockProvider.notifications.getUnread();
    },
    async markAsRead(id: string): Promise<void> {
      return mockProvider.notifications.markAsRead(id);
    },
  },

  activity: {
    async getRecent(limit = 10): Promise<ActivityEntry[]> {
      return mockProvider.activity.getRecent(limit);
    },
    async log(entry: Omit<ActivityEntry, 'id'>): Promise<void> {
      return mockProvider.activity.log(entry);
    },
  },
};
