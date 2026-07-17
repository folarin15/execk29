import type { Course } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class CourseService {
  async getAll(): Promise<Course[]> {
    return ServiceRegistry.courses.getAll();
  }

  async getById(id: string): Promise<Course | null> {
    return ServiceRegistry.courses.getById(id);
  }
}

export const courseService = new CourseService();
