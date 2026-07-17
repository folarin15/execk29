import type { Course } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface ICourseService {
  getAll(): Promise<Course[]>;
  getById(id: string): Promise<Course | null>;
}




/* ── Supabase implementation ─────────────────────────────── */

class SupabaseCourseService implements ICourseService {
  async getAll(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').order('code', { ascending: true });
    if (error) throw error;
    return (data || []).map((r: any) => ({ id: r.id, code: r.code || '', name: r.name || '', department: r.department }));
  }
  async getById(id: string): Promise<Course | null> {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? { id: data.id, code: data.code || '', name: data.name || '', department: data.department } : null;
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: ICourseService = new SupabaseCourseService();

export const courseService: ICourseService = {
  getAll: () => _impl.getAll(),
  getById: id => _impl.getById(id),
};
