import { useEffect } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';

interface PhotoViewerProps {
  open: boolean;
  onClose: () => void;
  photoUrl?: string;
  name: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  onDownload?: () => void;
  badge?: string;
}

export function PhotoViewer({ open, onClose, photoUrl, name, subtitle, meta, onDownload, badge }: PhotoViewerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="flex flex-col md:flex-row max-w-4xl w-full max-h-[90vh] bg-[#fffdf8] rounded-[24px] overflow-hidden shadow-[0_18px_50px_rgba(31,34,30,0.11)]" onClick={e => e.stopPropagation()}>
        <div className="flex-1 relative bg-[#171b1a] flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-contain" />
          ) : (
            <span className="material-symbols-rounded text-[64px] text-[#67706c]">person</span>
          )}
          {badge && (
            <div className="absolute top-4 left-4">
              <Badge variant="clay">{badge}</Badge>
            </div>
          )}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer border-none"
            onClick={onClose}
          >
            <span className="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>
        <div className="w-full md:w-[320px] p-6 flex flex-col gap-5 overflow-y-auto">
          <div>
            <h2 className="font-['Fraunces',serif] text-[24px] font-[500] text-[#171b1f] leading-tight">{name}</h2>
            {subtitle && <p className="text-[14px] text-[#67706c] mt-1">{subtitle}</p>}
          </div>

          {meta && (
            <div className="space-y-3">
              {meta.map(m => (
                <div key={m.label}>
                  <p className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[#67706c]">{m.label}</p>
                  <p className="text-[14px] text-[#171b1f]">{m.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto space-y-2 pt-4 border-t border-[#e3ddd0]">
            {onDownload && (
              <Button className="w-full" icon="download" onClick={onDownload}>
                Download Original Photo
              </Button>
            )}
            <Button variant="secondary" className="w-full" icon="close" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
