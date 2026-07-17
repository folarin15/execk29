import type { Birthday } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class BirthdayService {
  async getUpcoming(month?: number): Promise<Birthday[]> {
    return ServiceRegistry.birthdays.getUpcoming(month);
  }

  async getByStudentId(studentId: string): Promise<Birthday | null> {
    return ServiceRegistry.birthdays.getByStudentId(studentId);
  }
}

export const birthdayService = new BirthdayService();
