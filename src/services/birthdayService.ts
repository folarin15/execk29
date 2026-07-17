import type { Birthday } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface IBirthdayService {
  getUpcoming(month?: number): Promise<Birthday[]>;
  getByStudentId(studentId: string): Promise<Birthday | null>;
}

/* ── Mock implementation ─────────────────────────────────── */

const MOCK_MEMBERS = [
  { id: 'm1', name: 'John Doe', matricNumber: '20/1234', dateOfBirth: '2002-05-15', photoUrl: '' },
  { id: 'm2', name: 'Jane Smith', matricNumber: '20/5678', dateOfBirth: '2003-08-22', photoUrl: '' },
  { id: 'm3', name: 'Samuel Green', matricNumber: '20/9012', dateOfBirth: '2001-12-01', photoUrl: '' },
];

function mapBirthday(m: any): Birthday | null {
  if (!m.dateOfBirth) return null;
  const split = m.dateOfBirth.split('-');
  const monthNum = Number(split[1]) - 1;
  const day = Number(split[2]);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[monthNum] || '';
  const today = new Date();
  const bday = new Date(today.getFullYear(), monthNum, day);
  const diff = Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    id: `bday-${m.id}`,
    studentId: m.matricNumber || m.id,
    studentName: m.name || '',
    dateOfBirth: m.dateOfBirth || '',
    birthDate: `${day} ${month}`,
    photoUrl: m.photoUrl || '',
    daysUntilBirthday: diff >= 0 ? diff : diff + 365,
    isToday: diff === 0,
    month,
    day,
  };
}

class MockBirthdayService implements IBirthdayService {
  async getUpcoming(month?: number): Promise<Birthday[]> {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let birthdays = MOCK_MEMBERS.filter(m => m.dateOfBirth).map(mapBirthday).filter(Boolean) as Birthday[];
    if (month !== undefined) {
      const target = monthNames[month] || '';
      birthdays = birthdays.filter(b => b.month === target);
    }
    return birthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
  }

  async getByStudentId(studentId: string): Promise<Birthday | null> {
    const m = MOCK_MEMBERS.find(m => m.matricNumber === studentId || m.id === studentId);
    return m?.dateOfBirth ? mapBirthday(m) : null;
  }
}

/* ── Supabase implementation ─────────────────────────────── */

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

class SupabaseBirthdayService implements IBirthdayService {
  async getUpcoming(month?: number): Promise<Birthday[]> {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const { data, error } = await supabase.from('members').select('id, full_name, name, matric_number, date_of_birth, photo_url').not('date_of_birth', 'is', null);
    if (error) return [];
    let birthdays = (data || []).map(supabaseMapBirthday).filter(Boolean) as Birthday[];
    if (month !== undefined) {
      const target = monthNames[month] || '';
      birthdays = birthdays.filter(b => b.month === target);
    }
    return birthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
  }

  async getByStudentId(studentId: string): Promise<Birthday | null> {
    const { data, error } = await supabase.from('members').select('id, full_name, name, matric_number, date_of_birth, photo_url').or(`id.eq.${studentId},matric_number.eq.${studentId}`).maybeSingle();
    if (error || !data) return null;
    return supabaseMapBirthday(data);
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: IBirthdayService = new MockBirthdayService();

export function useSupabaseBirthdayService(): void {
  _impl = new SupabaseBirthdayService();
}

export const birthdayService: IBirthdayService = {
  getUpcoming: m => _impl.getUpcoming(m),
  getByStudentId: id => _impl.getByStudentId(id),
};
