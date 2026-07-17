import type { Resource } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class ResourceService {
  async create(resource: Omit<Resource, 'id' | 'uploadDate'>): Promise<Resource> {
    return ServiceRegistry.resources.create(resource);
  }

  async getAll(): Promise<Resource[]> {
    return ServiceRegistry.resources.getAll();
  }

  async getByCourse(courseCode: string): Promise<Resource[]> {
    return ServiceRegistry.resources.getByCourse(courseCode);
  }

  async delete(id: string): Promise<void> {
    return ServiceRegistry.resources.delete(id);
  }
}

export const resourceService = new ResourceService();
