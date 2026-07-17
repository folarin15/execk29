import type { Suggestion } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface ISuggestionService {
  getAll(): Promise<Suggestion[]>;
  getById(id: string): Promise<Suggestion | null>;
  deleteSuggestion(id: string): Promise<void>;
}

/* ── Mock implementation ─────────────────────────────────── */

const MOCK: any[] = [
  { id: 's1', name: 'Alice Brown', matricNumber: '20/1111', category: 'Facilities', message: 'The library should open earlier on weekends.', status: 'pending', createdAtMs: Date.now() - 86400000 * 2 },
  { id: 's2', name: 'Bob White', matricNumber: '20/2222', category: 'Curriculum', message: 'More practical sessions in Anatomy.', status: 'reviewed', createdAtMs: Date.now() - 86400000 * 5 },
  { id: 's3', name: 'Carol Black', matricNumber: '20/3333', category: 'Other', message: 'Great lecture last week!', status: 'addressed', createdAtMs: Date.now() - 86400000 * 10 },
];

function mockMap(sg: any): Suggestion {
  return {
    id: sg.id,
    name: sg.name || '',
    matricNumber: sg.matricNumber || '',
    category: sg.category || '',
    message: sg.message || '',
    status: (sg.status || 'pending') as Suggestion['status'],
    createdAtMs: Number(sg.createdAtMs || 0),
  };
}

class MockSuggestionService implements ISuggestionService {
  async getAll(): Promise<Suggestion[]> {
    return MOCK.map(mockMap);
  }

  async getById(id: string): Promise<Suggestion | null> {
    const sg = MOCK.find(s => s.id === id);
    return sg ? mockMap(sg) : null;
  }

  async deleteSuggestion(id: string): Promise<void> {
    const idx = MOCK.findIndex(s => s.id === id);
    if (idx >= 0) MOCK.splice(idx, 1);
  }
}

/* ── Supabase implementation ─────────────────────────────── */

function supabaseMap(row: any): Suggestion {
  return {
    id: row.id,
    name: row.name || '',
    matricNumber: row.matric_number || '',
    category: row.category || '',
    message: row.message || '',
    status: (row.status || 'pending') as Suggestion['status'],
    createdAtMs: row.created_at ? new Date(row.created_at).getTime() : 0,
  };
}

class SupabaseSuggestionService implements ISuggestionService {
  async getAll(): Promise<Suggestion[]> {
    const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(supabaseMap);
  }

  async getById(id: string): Promise<Suggestion | null> {
    const { data, error } = await supabase.from('suggestions').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? supabaseMap(data) : null;
  }

  async deleteSuggestion(id: string): Promise<void> {
    const { error } = await supabase.from('suggestions').delete().eq('id', id);
    if (error) throw error;
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: ISuggestionService = new MockSuggestionService();

export function useSupabaseSuggestionService(): void {
  _impl = new SupabaseSuggestionService();
}

export const suggestionService: ISuggestionService = {
  getAll: () => _impl.getAll(),
  getById: id => _impl.getById(id),
  deleteSuggestion: id => _impl.deleteSuggestion(id),
};
