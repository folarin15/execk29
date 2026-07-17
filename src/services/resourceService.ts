import type { Resource } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface IResourceService {
  create(resource: Omit<Resource, 'id' | 'uploadDate'>): Promise<Resource>;
  getAll(): Promise<Resource[]>;
  getByCourse(courseCode: string): Promise<Resource[]>;
  delete(id: string): Promise<void>;
}




/* ── Supabase implementation ─────────────────────────────── */

const STORAGE_BUCKET = 'class-resources';

async function createSignedUrl(storagePath: string): Promise<string> {
  if (!storagePath) return '';
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(storagePath, 3600);
  return error ? '' : data?.signedUrl || '';
}

async function signRows(rows: any[]): Promise<any[]> {
  return Promise.all(rows.map(async r => {
    if (!r.storage_path) return r;
    r.download_url = await createSignedUrl(r.storage_path);
    return r;
  }));
}

function supabaseMap(r: any): Resource {
  const ext = r.file_name?.split('.').pop()?.toLowerCase() || '';
  const fileType = (['pdf', 'pptx', 'xlsx', 'docx'].includes(ext) ? ext : 'other') as Resource['fileType'];
  return {
    id: r.id,
    course: r.course_code || '',
    courseCode: r.course_code || '',
    week: 0,
    title: r.title || r.file_name || '',
    fileName: r.file_name || '',
    fileType,
    fileSize: 0,
    uploadDate: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    uploadedBy: r.uploaded_by || '',
    fileUrl: r.download_url || '',
  };
}

class SupabaseResourceService implements IResourceService {
  async create(_resource: Omit<Resource, 'id' | 'uploadDate'>): Promise<Resource> {
    throw new Error('Use uploadResource() — direct create not supported');
  }

  async getAll(): Promise<Resource[]> {
    const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const signed = await signRows(data || []);
    return signed.map(supabaseMap);
  }

  async getByCourse(courseCode: string): Promise<Resource[]> {
    const { data, error } = await supabase.from('resources').select('*').eq('course_code', courseCode).order('created_at', { ascending: false });
    if (error) throw error;
    const signed = await signRows(data || []);
    return signed.map(supabaseMap);
  }

  async delete(id: string): Promise<void> {
    const { data: resource } = await supabase.from('resources').select('storage_path').eq('id', id).maybeSingle();
    if (resource?.storage_path) {
      await supabase.storage.from(STORAGE_BUCKET).remove([resource.storage_path]).catch(() => {});
    }
    const { error: delErr } = await supabase.from('resources').delete().eq('id', id);
    if (delErr) throw delErr;
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: IResourceService = new SupabaseResourceService();

export const resourceService: IResourceService = {
  create: r => _impl.create(r),
  getAll: () => _impl.getAll(),
  getByCourse: c => _impl.getByCourse(c),
  delete: id => _impl.delete(id),
};
