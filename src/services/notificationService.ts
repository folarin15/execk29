import type { Notification } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class NotificationService {
  async getAll(): Promise<Notification[]> {
    return ServiceRegistry.notifications.getAll();
  }

  async getUnread(): Promise<Notification[]> {
    return ServiceRegistry.notifications.getUnread();
  }

  async markAsRead(id: string): Promise<void> {
    return ServiceRegistry.notifications.markAsRead(id);
  }
}

export const notificationService = new NotificationService();
