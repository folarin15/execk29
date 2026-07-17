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
    <header className="relative flex justify-between items-center w-full h-14 md:h-16 px-3 md:px-6 bg-[#f8f6ef] border-b border-[#e3ddd0] shrink-0">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <span className="material-symbols-rounded text-[#2a9d7f] text-[20px] md:text-[22px]">account_balance</span>
          <span className="font-['Fraunces',serif] text-[17px] md:text-[20px] font-[500] text-[#171b1f]">PhysioK29</span>
        </div>
        <span className="w-px h-5 md:h-6 bg-[#e3ddd0] shrink-0" />
        <span className="text-[11px] md:text-[13px] font-[500] text-[#67706c] uppercase tracking-[0.5px] truncate">{ROLE_LABELS[user.role] || user.role}</span>
      </div>
      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        <div className="relative">
          <button
            className="relative w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="material-symbols-rounded text-[#67706c] text-[18px] md:text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-[#d96f4d] text-white text-[8px] md:text-[9px] font-[700] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationCenter open={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
        <button className="hidden md:flex w-9 h-9 rounded-full items-center justify-center hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none">
          <span className="material-symbols-rounded text-[#67706c]">settings</span>
        </button>
        <div className="flex items-center gap-1.5 md:gap-2.5 pl-2 md:pl-3 border-l border-[#e3ddd0]">
          <div className="hidden sm:block text-right">
            <p className="text-[12px] md:text-[13px] font-[500] text-[#171b1f] leading-tight truncate max-w-[100px]">{user.name}</p>
          </div>
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <button onClick={logout} className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none" title="Sign out">
            <span className="material-symbols-rounded text-[#67706c] text-[18px] md:text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
