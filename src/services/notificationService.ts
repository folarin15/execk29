import type { Notification } from '../types';

/* ── Interface ───────────────────────────────────────────── */

export interface INotificationService {
  getAll(): Promise<Notification[]>;
  getUnread(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}

/* ── Mock implementation ─────────────────────────────────── */

const MOCK: Notification[] = [
  { id: 'n1', title: 'New Resource', message: 'Anatomy slides uploaded', type: 'info', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', title: 'Announcement', message: 'Exam schedule posted', type: 'warning', read: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
];

class MockNotificationService implements INotificationService {
  async getAll(): Promise<Notification[]> {
    return [...MOCK];
  }
  async getUnread(): Promise<Notification[]> {
    return MOCK.filter(n => !n.read);
  }
  async markAsRead(id: string): Promise<void> {
    const n = MOCK.find(n => n.id === id);
    if (n) n.read = true;
  }
}

/* ── Supabase implementation ─────────────────────────────── */

class SupabaseNotificationService implements INotificationService {
  async getAll(): Promise<Notification[]> {
    return [];
  }
  async getUnread(): Promise<Notification[]> {
    return [];
  }
  async markAsRead(_id: string): Promise<void> {
    // Not implemented in Supabase schema
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: INotificationService = new SupabaseNotificationService();

export const notificationService: INotificationService = {
  getAll: () => _impl.getAll(),
  getUnread: () => _impl.getUnread(),
  markAsRead: id => _impl.markAsRead(id),
};
