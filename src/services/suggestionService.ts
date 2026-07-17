import type { Suggestion } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface ISuggestionService {
  getAll(): Promise<Suggestion[]>;
  getById(id: string): Promise<Suggestion | null>;
  deleteSuggestion(id: string): Promise<void>;
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

let _impl: ISuggestionService = new SupabaseSuggestionService();

export const suggestionService: ISuggestionService = {
  getAll: () => _impl.getAll(),
  getById: id => _impl.getById(id),
  deleteSuggestion: id => _impl.deleteSuggestion(id),
};
