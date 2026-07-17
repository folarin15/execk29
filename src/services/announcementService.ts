import type { Announcement } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class AnnouncementService {
  async publish(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    return ServiceRegistry.announcements.publish(announcement);
  }

  async getAll(): Promise<Announcement[]> {
    return ServiceRegistry.announcements.getAll();
  }

  async getActive(): Promise<Announcement[]> {
    return ServiceRegistry.announcements.getActive();
  }
}

export const announcementService = new AnnouncementService();
