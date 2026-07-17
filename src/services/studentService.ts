import type { Student, Birthday } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class StudentService {
  async search(query: string): Promise<Student[]> {
    return ServiceRegistry.students.search(query);
  }

  async getById(id: string): Promise<Student | null> {
    return ServiceRegistry.students.getById(id);
  }

  async getAll(): Promise<Student[]> {
    return ServiceRegistry.students.getAll();
  }

  async getBirthdays(month?: number): Promise<Birthday[]> {
    return ServiceRegistry.birthdays.getUpcoming(month);
  }
}

export const studentService = new StudentService();
