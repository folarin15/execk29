import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const typeStyles: Record<ToastType, string> = {
  success: 'bg-[#2a9d7f]',
  error: 'bg-[#c3423f]',
  info: 'bg-[#5fa8d3]',
  warning: 'bg-[#d96f4d]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(Date.now());
    setItems(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] flex flex-col gap-2 items-center" role="alert" aria-live="polite">
        {items.map(item => (
          <ToastItem key={item.id} item={item} onDone={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 4200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`px-6 py-3 rounded-full text-[14px] font-[500] text-white shadow-[0_18px_50px_rgba(31,34,30,0.11)] transition-opacity duration-300 ${typeStyles[item.type]} ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {item.message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
