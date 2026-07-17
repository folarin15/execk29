import type { ReactNode } from 'react';
import type { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from '../components/ui/EmptyState';

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) return null;

  if (!roles.includes(user.role)) {
    return fallback ?? (
      <EmptyState
        icon="lock"
        message="Access Restricted"
        description="You don't have permission to view this section."
      />
    );
  }

  return <>{children}</>;
}
