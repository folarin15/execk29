import type { ActivityEntry } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class ActivityService {
  async getRecent(limit?: number): Promise<ActivityEntry[]> {
    return ServiceRegistry.activity.getRecent(limit);
  }

  async log(entry: Omit<ActivityEntry, 'id'>): Promise<void> {
    return ServiceRegistry.activity.log(entry);
  }
}

export const activityService = new ActivityService();
