import type { ReactNode } from 'react';
import type { Permission } from './permissions';
import { hasPermission } from './permissions';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) return null;

  if (!hasPermission(user.role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
