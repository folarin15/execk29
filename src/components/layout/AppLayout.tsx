import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6ef]">
      <TopBar user={user} />
      <Sidebar role={user.role} currentPath={pathname} />
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
