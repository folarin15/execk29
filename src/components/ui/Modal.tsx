import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handler);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#fffdf8] rounded-[24px] max-w-[540px] w-full p-7 shadow-[0_18px_50px_rgba(31,34,30,0.11)] animate-[fadeIn_0.2s_ease]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[20px] font-[500] font-['Fraunces',serif] text-[#171b1f]">{title}</h2>
          <button className="w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-transparent hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none" onClick={onClose}>
            <span className="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>
        <div className="space-y-5">{children}</div>
        {footer && <div className="mt-6 pt-5 border-t border-[#e3ddd0] flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
