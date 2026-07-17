import type { Student, Birthday } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface IStudentService {
  search(query: string): Promise<Student[]>;
  getById(id: string): Promise<Student | null>;
  getAll(): Promise<Student[]>;
  getBirthdays(month?: number): Promise<Birthday[]>;
}




/* ── Supabase implementation ─────────────────────────────── */

function supabaseMapMember(row: any): Student {
  return {
    id: row.id,
    studentId: row.matric_number || '',
    name: row.full_name || row.name || '',
    email: '',
    dateOfBirth: row.date_of_birth || '',
    enrollmentStatus: 'active',
  };
}

function supabaseMapBirthday(row: any): Birthday | null {
  if (!row.date_of_birth) return null;
  const split = row.date_of_birth.split('-');
  const monthNum = Number(split[1]) - 1;
  const day = Number(split[2]);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[monthNum] || '';
  const today = new Date();
  const bday = new Date(today.getFullYear(), monthNum, day);
  const diff = Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    id: `bday-${row.id}`,
    studentId: row.matric_number || row.id,
    studentName: row.full_name || row.name || '',
    dateOfBirth: row.date_of_birth || '',
    birthDate: `${day} ${month}`,
    photoUrl: row.photo_url || '',
    daysUntilBirthday: diff >= 0 ? diff : diff + 365,
    isToday: diff === 0,
    month,
    day,
  };
}

class SupabaseStudentService implements IStudentService {
  async search(query: string): Promise<Student[]> {
    const q = `%${query.toLowerCase()}%`;
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`full_name.ilike.${q},matric_number.ilike.${q}`);
    if (error) throw error;
    return (data || []).map(supabaseMapMember);
  }

  async getById(id: string): Promise<Student | null> {
    const { data, error } = await supabase.from('members').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? supabaseMapMember(data) : null;
  }

  async getAll(): Promise<Student[]> {
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(supabaseMapMember);
  }

  async getBirthdays(month?: number): Promise<Birthday[]> {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let query = supabase.from('members').select('id, full_name, name, matric_number, date_of_birth, photo_url').not('date_of_birth', 'is', null);
    const { data, error } = await query;
    if (error) return [];
    let birthdays = (data || []).map(supabaseMapBirthday).filter(Boolean) as Birthday[];
    if (month !== undefined) {
      const target = monthNames[month] || '';
      birthdays = birthdays.filter(b => b.month === target);
    }
    return birthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: IStudentService = new SupabaseStudentService();

export const studentService: IStudentService = {
  search: q => _impl.search(q),
  getById: id => _impl.getById(id),
  getAll: () => _impl.getAll(),
  getBirthdays: m => _impl.getBirthdays(m),
};
