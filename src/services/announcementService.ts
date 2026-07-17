import type { Announcement } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface IAnnouncementService {
  publish(announcement: Omit<Announcement, 'id'>): Promise<Announcement>;
  getAll(): Promise<Announcement[]>;
  getActive(): Promise<Announcement[]>;
}




/* ── Supabase implementation ─────────────────────────────── */

function supabaseMap(row: any): Announcement {
  return {
    id: row.id,
    title: row.title || '',
    content: row.message || '',
    date: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    status: 'live',
    author: row.author || '',
  };
}

class SupabaseAnnouncementService implements IAnnouncementService {
  async publish(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('announcements').insert({
      title: announcement.title,
      message: announcement.content,
      priority: 'Normal',
      posted_by: userData?.user?.id || '',
      author: announcement.author || '',
    });
    if (error) throw error;
    return { ...announcement, id: `ann-${Date.now()}` };
  }

  async getAll(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(supabaseMap);
  }

  async getActive(): Promise<Announcement[]> {
    return this.getAll();
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: IAnnouncementService = new SupabaseAnnouncementService();

export const announcementService: IAnnouncementService = {
  publish: a => _impl.publish(a),
  getAll: () => _impl.getAll(),
  getActive: () => _impl.getActive(),
};
