import type { Notification } from '../types';

/* ── Interface ───────────────────────────────────────────── */

export interface INotificationService {
  getAll(): Promise<Notification[]>;
  getUnread(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
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
