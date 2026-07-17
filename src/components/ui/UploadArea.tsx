import type { DragEvent } from 'react';

interface UploadAreaProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  hint?: string;
}

export function UploadArea({ onFile, accept, label, hint }: UploadAreaProps) {
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      className="border-2 border-dashed border-[#e3ddd0] hover:border-[#2a9d7f] transition-colors rounded-[16px] p-8 flex flex-col items-center justify-center bg-[#fffefa] cursor-pointer"
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept || '';
        input.onchange = () => { if (input.files?.[0]) onFile(input.files[0]); };
        input.click();
      }}
    >
      <span className="material-symbols-rounded text-[40px] text-[#67706c] mb-3">cloud_upload</span>
      {label && <p className="text-[15px] font-[500] text-[#171b1f]">{label}</p>}
      {hint && <p className="text-[13px] text-[#67706c] mt-1">{hint}</p>}
    </div>
  );
}
