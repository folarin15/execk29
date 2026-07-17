import type { ActivityEntry } from '../types';

/* ── Interface ───────────────────────────────────────────── */

export interface IActivityService {
  getRecent(limit?: number): Promise<ActivityEntry[]>;
  log(entry: Omit<ActivityEntry, 'id'>): Promise<void>;
}

/* ── Mock implementation ─────────────────────────────────── */

const MOCK: ActivityEntry[] = [
  { id: 'act-1', action: 'Uploaded resource', actor: 'Admin', actorRole: 'admin', module: 'Resources', timestamp: new Date(Date.now() - 3600000).toISOString(), category: 'upload' },
  { id: 'act-2', action: 'Verified receipt', actor: 'Auditor', actorRole: 'auditor', module: 'Finance', timestamp: new Date(Date.now() - 7200000).toISOString(), category: 'verify' },
];

class MockActivityService implements IActivityService {
  async getRecent(limit?: number): Promise<ActivityEntry[]> {
    return limit ? MOCK.slice(0, limit) : [...MOCK];
  }
  async log(entry: Omit<ActivityEntry, 'id'>): Promise<void> {
    MOCK.unshift({ ...entry, id: `act-${Date.now()}` });
  }
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

let _impl: IActivityService = new MockActivityService();

export function useSupabaseActivityService(): void {
  _impl = new SupabaseActivityService();
}

export const activityService: IActivityService = {
  getRecent: l => _impl.getRecent(l),
  log: e => _impl.log(e),
};
