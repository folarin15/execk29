import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
}

export function Input({ label, icon, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
      {label && <span className="text-[#171b1f]">{label}</span>}
      <div className="relative">
        {icon && (
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[#67706c] text-[18px]">{icon}</span>
        )}
        <input
          className={`w-full px-3.5 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] transition-all outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)] placeholder:text-[#67706c]/50 ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}
