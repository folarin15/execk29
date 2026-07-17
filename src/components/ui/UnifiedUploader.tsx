import { useState, useRef } from 'react';

interface UploadConfig {
  accept?: string;
  maxSizeMB?: number;
  label: string;
  hint?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: number;
}

interface UnifiedUploaderProps {
  config: UploadConfig;
  onFile: (file: UploadedFile) => void;
  multiple?: boolean;
}

const acceptMap: Record<string, string> = {
  image: 'image/*',
  pdf: '.pdf',
  document: '.pdf,.doc,.docx,.ppt,.pptx',
  spreadsheet: '.xls,.xlsx,.csv',
  any: '*/*',
};

export function UnifiedUploader({ config, onFile, multiple = false }: UnifiedUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File) => {
    if (config.maxSizeMB && file.size > config.maxSizeMB * 1024 * 1024) return;
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    onFile({ file, preview, name: file.name, size: file.size });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      className={`border-2 border-dashed rounded-[18px] p-8 flex flex-col items-center justify-center bg-[#fffefa] cursor-pointer transition-all ${
        dragOver ? 'border-[#2a9d7f] bg-[rgba(42,157,127,0.07)]' : 'border-[#e3ddd0] hover:border-[#2a9d7f]'
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <span className="material-symbols-rounded text-[40px] text-[#67706c] mb-3">cloud_upload</span>
      <p className="text-[15px] font-[500] text-[#171b1f]">{config.label}</p>
      {config.hint && <p className="text-[13px] text-[#67706c] mt-1">{config.hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={config.accept || acceptMap.any}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export type { UploadConfig, UploadedFile };
