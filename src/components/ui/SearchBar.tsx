import type { InputHTMLAttributes } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchBar({ onSearch, className = '', ...props }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-[#67706c] text-[18px]">search</span>
      <input
        className="w-full pl-10 pr-4 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[14px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)] transition-all placeholder:text-[#67706c]/50"
        placeholder="Search..."
        onChange={e => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  );
}
