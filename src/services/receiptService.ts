import type { Receipt } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class ReceiptService {
  async upload(receipt: Omit<Receipt, 'id' | 'status'>): Promise<Receipt> {
    return ServiceRegistry.receipts.upload(receipt);
  }

  async getAll(): Promise<Receipt[]> {
    return ServiceRegistry.receipts.getAll();
  }

  async getById(id: string): Promise<Receipt | null> {
    return ServiceRegistry.receipts.getById(id);
  }

  async verify(id: string, userId: string): Promise<Receipt> {
    return ServiceRegistry.receipts.verify(id, userId);
  }

  async getPending(): Promise<Receipt[]> {
    return ServiceRegistry.receipts.getPending();
  }
}

export const receiptService = new ReceiptService();
