import type { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

/* ── Interface ───────────────────────────────────────────── */

export interface IAuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

/* ── Mock implementation ─────────────────────────────────── */

class MockAuthService implements IAuthService {
  async login(_email: string, _password: string): Promise<User> {
    throw new Error('Supabase auth is required. Configure staff_roles table.');
  }

  async logout(): Promise<void> {
    localStorage.removeItem('exec_user');
  }

  async getCurrentUser(): Promise<User | null> {
    return null;
  }
}

/* ── Supabase implementation ─────────────────────────────── */

async function fetchRole(uid: string): Promise<{ role: UserRole; displayName: string; mustChangePassword: boolean } | null> {
  if (!uid) return null;
  const { data, error } = await supabase.from('staff_roles').select('role, display_name, must_change_password').eq('user_id', uid).maybeSingle();
  if (error || !data) return null;
  return { role: data.role as UserRole, displayName: data.display_name || '', mustChangePassword: data.must_change_password ?? true };
}

class SupabaseAuthService implements IAuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    const roleInfo = await fetchRole(data.user.id);
    const user: User = {
      id: data.user.id,
      name: roleInfo?.displayName || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || '',
      role: roleInfo?.role || 'representative',
      mustChangePassword: roleInfo?.mustChangePassword ?? true,
    };
    this.currentUser = user;
    return user;
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;

    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;

    const roleInfo = await fetchRole(data.session.user.id);
    const user: User = {
      id: data.session.user.id,
      name: roleInfo?.displayName || data.session.user.email?.split('@')[0] || 'User',
      email: data.session.user.email || '',
      role: roleInfo?.role || 'representative',
      mustChangePassword: roleInfo?.mustChangePassword ?? true,
    };
    this.currentUser = user;
    return user;
  }
}

/* ── Singleton (auto-selects implementation) ─────────────── */

let _impl: IAuthService = new MockAuthService();

export function useSupabaseAuth(): void {
  _impl = new SupabaseAuthService();
}

export const authService: IAuthService = {
  login: (email, password) => _impl.login(email, password),
  logout: () => _impl.logout(),
  getCurrentUser: () => _impl.getCurrentUser(),
};
