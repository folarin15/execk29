import { useState } from 'react';
import type { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { NotificationCenter, useNotificationCount } from '../ui/NotificationCenter';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../constants';

interface TopBarProps {
  user: User;
}

export function TopBar({ user }: TopBarProps) {
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = useNotificationCount();

  return (
    <header className="relative flex justify-between items-center w-full h-16 px-6 bg-[#f8f6ef] border-b border-[#e3ddd0] shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[#2a9d7f] text-[22px]">account_balance</span>
          <span className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">PhysioK29</span>
        </div>
        <span className="w-px h-6 bg-[#e3ddd0]" />
        <span className="text-[13px] font-[500] text-[#67706c] uppercase tracking-[0.5px]">{ROLE_LABELS[user.role] || user.role}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="material-symbols-rounded text-[#67706c]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#d96f4d] text-white text-[9px] font-[700] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationCenter open={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none">
          <span className="material-symbols-rounded text-[#67706c]">settings</span>
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#e3ddd0]">
          <div className="text-right">
            <p className="text-[13px] font-[500] text-[#171b1f] leading-tight">{user.name}</p>
          </div>
          <Avatar src={user.avatar} name={user.name} size="md" />
          <button onClick={logout} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none" title="Sign out">
            <span className="material-symbols-rounded text-[#67706c]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
