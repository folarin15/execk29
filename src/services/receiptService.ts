import type { Receipt } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface IReceiptService {
  upload(receipt: Omit<Receipt, 'id' | 'status'>): Promise<Receipt>;
  getAll(): Promise<Receipt[]>;
  getById(id: string): Promise<Receipt | null>;
  verify(id: string, userId: string): Promise<Receipt>;
  getPending(): Promise<Receipt[]>;
}




/* ── Supabase implementation ─────────────────────────────── */

class SupabaseReceiptService implements IReceiptService {
  async upload(receipt: Omit<Receipt, 'id' | 'status'>): Promise<Receipt> {
    const { data, error } = await supabase.from('receipts').insert({
      receipt_number: receipt.receiptNumber,
      purpose: receipt.purpose,
      amount: receipt.amount,
      date: receipt.date,
      uploaded_by: receipt.uploadedBy,
      uploader_role: receipt.uploaderRole,
      student_ids: receipt.studentIds || [], // Added
      status: 'pending',
    }).select().single();
    if (error) throw error;
    return this.mapRow(data);
  }

  async getAll(): Promise<Receipt[]> {
    const { data, error } = await supabase.from('receipts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(this.mapRow);
  }

  async getById(id: string): Promise<Receipt | null> {
    const { data, error } = await supabase.from('receipts').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.mapRow(data) : null;
  }

  async verify(id: string, userId: string): Promise<Receipt> {
    const { data, error } = await supabase.from('receipts').update({
      status: 'verified',
      verified_by: userId,
      verified_at: new Date().toISOString(),
    }).eq('id', id).select().single();
    if (error) throw error;
    return this.mapRow(data);
  }

  async getPending(): Promise<Receipt[]> {
    const { data, error } = await supabase.from('receipts').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(this.mapRow);
  }

  private mapRow(r: any): Receipt {
    return {
      id: r.id,
      receiptNumber: r.receipt_number || '',
      purpose: r.purpose || '',
      amount: Number(r.amount || 0),
      date: r.date || '',
      uploadedBy: r.uploaded_by || '',
      uploaderRole: r.uploader_role || '',
      studentIds: r.student_ids || [], // Added
      status: r.status || 'pending',
      verifiedBy: r.verified_by,
      verifiedAt: r.verified_at,
    };
  }
}

/* ── Singleton export ────────────────────────────────────── */

let _impl: IReceiptService = new SupabaseReceiptService();

export const receiptService: IReceiptService = {
  upload: r => _impl.upload(r),
  getAll: () => _impl.getAll(),
  getById: id => _impl.getById(id),
  verify: (id, uid) => _impl.verify(id, uid),
  getPending: () => _impl.getPending(),
};
