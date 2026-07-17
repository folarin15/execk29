import { useState, useEffect, useRef } from 'react';
import type { Notification } from '../../types';
import { notificationService } from '../../services';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      notificationService.getAll().then(n => {
        setNotifications(n);
        setLoading(false);
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    if (open) setTimeout(() => window.addEventListener('click', handler), 0);
    return () => window.removeEventListener('click', handler);
  }, [open, onClose]);

  if (!open) return null;

  const unread = notifications.filter(n => !n.read);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const typeIcon: Record<string, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  return (
    <div ref={panelRef} className="fixed md:absolute top-14 md:top-16 right-4 md:right-6 w-[90vw] max-w-[380px] max-h-[80vh] md:max-h-[500px] phys-card flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e3ddd0]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[18px]">notifications</span>
          <span className="text-[15px] font-[500]">Notifications</span>
          {unread.length > 0 && (
            <span className="bg-[#d96f4d] text-white text-[11px] font-[600] px-2 py-0.5 rounded-full">{unread.length}</span>
          )}
        </div>
        <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] cursor-pointer border-none" onClick={onClose}>
          <span className="material-symbols-rounded text-[16px]">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-[#67706c] text-[14px]">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-[#67706c] text-[14px]">No notifications yet</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-5 py-3.5 border-b border-[#e3ddd0]/50 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-colors ${!n.read ? 'bg-[rgba(42,157,127,0.04)]' : ''}`}
              onClick={() => handleMarkRead(n.id)}
            >
              <span className={`material-symbols-rounded text-[18px] mt-0.5 ${
                n.type === 'success' ? 'text-[#2a9d7f]' :
                n.type === 'warning' ? 'text-[#d96f4d]' :
                n.type === 'error' ? 'text-[#c3423f]' : 'text-[#5fa8d3]'
              }`}>
                {typeIcon[n.type] || 'info'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-[500] text-[#171b1f]">{n.title}</p>
                <p className="text-[12px] text-[#67706c] mt-0.5">{n.message}</p>
              </div>
              <span className="text-[11px] text-[#67706c] shrink-0">{n.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function useNotificationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    notificationService.getUnread().then(n => setCount(n.length));
  }, []);

  return count;
}
