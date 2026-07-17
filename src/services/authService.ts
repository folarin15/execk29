import type { User } from '../types';
import { ServiceRegistry } from '../providers/ServiceRegistry';

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    const user = await ServiceRegistry.auth.login(email, password);
    this.currentUser = user;
    localStorage.setItem('exec_user', JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    await ServiceRegistry.auth.logout();
    this.currentUser = null;
    localStorage.removeItem('exec_user');
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    const stored = localStorage.getItem('exec_user');
    if (stored) {
      this.currentUser = JSON.parse(stored) as User;
      return this.currentUser;
    }
    return null;
  }
}

export const authService = new AuthService();
