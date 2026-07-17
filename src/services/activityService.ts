import type { ActivityEntry } from '../types';

/* ── Interface ───────────────────────────────────────────── */

export interface IActivityService {
  getRecent(limit?: number): Promise<ActivityEntry[]>;
  log(entry: Omit<ActivityEntry, 'id'>): Promise<void>;
}




/* ── Supabase implementation ─────────────────────────────── */

class SupabaseActivityService implements IActivityService {
  async getRecent(_limit?: number): Promise<ActivityEntry[]> {
    return [];
  }
  async log(_entry: Omit<ActivityEntry, 'id'>): Promise<void> {
    // Not implemented in Supabase schema
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: IActivityService = new SupabaseActivityService();

export const activityService: IActivityService = {
  getRecent: l => _impl.getRecent(l),
  log: e => _impl.log(e),
};
