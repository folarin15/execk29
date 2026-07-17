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

/* ── Mock implementation ─────────────────────────────────── */

const MOCK_RECEIPTS: Receipt[] = [
  { id: 'rec-1', receiptNumber: 'RCP/2025/001', purpose: 'Annual Dues', amount: 5000, date: '2025-01-15', uploadedBy: '3', uploaderRole: 'treasurer', students: ['m1', 'm2'], status: 'verified', verifiedBy: '1', verifiedAt: '2025-01-16' },
  { id: 'rec-2', receiptNumber: 'RCP/2025/002', purpose: 'Lab Fee', amount: 3000, date: '2025-02-20', uploadedBy: '3', uploaderRole: 'treasurer', students: ['m3'], status: 'pending' },
];

class MockReceiptService implements IReceiptService {
  async upload(receipt: Omit<Receipt, 'id' | 'status'>): Promise<Receipt> {
    const r: Receipt = { ...receipt, id: `rec-${Date.now()}`, status: 'pending' };
    MOCK_RECEIPTS.push(r);
    return r;
  }

  async getAll(): Promise<Receipt[]> {
    return [...MOCK_RECEIPTS];
  }

  async getById(id: string): Promise<Receipt | null> {
    return MOCK_RECEIPTS.find(r => r.id === id) || null;
  }

  async verify(id: string, userId: string): Promise<Receipt> {
    const r = MOCK_RECEIPTS.find(r => r.id === id);
    if (!r) throw new Error('Receipt not found');
    r.status = 'verified';
    r.verifiedBy = userId;
    r.verifiedAt = new Date().toISOString();
    return r;
  }

  async getPending(): Promise<Receipt[]> {
    return MOCK_RECEIPTS.filter(r => r.status === 'pending');
  }
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
      students: receipt.students,
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
      students: r.students || [],
      status: r.status || 'pending',
      verifiedBy: r.verified_by,
      verifiedAt: r.verified_at,
    };
  }
}

/* ── Singleton ───────────────────────────────────────────── */

let _impl: IReceiptService = new MockReceiptService();

export function useSupabaseReceiptService(): void {
  _impl = new SupabaseReceiptService();
}

export const receiptService: IReceiptService = {
  upload: r => _impl.upload(r),
  getAll: () => _impl.getAll(),
  getById: id => _impl.getById(id),
  verify: (id, uid) => _impl.verify(id, uid),
  getPending: () => _impl.getPending(),
};
