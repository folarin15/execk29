import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  children?: ReactNode;
}

const base = 'inline-flex items-center justify-center gap-2 font-[560] cursor-pointer transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<string, string> = {
  primary: 'bg-[#171b1f] text-[#fffaf0] hover:translate-y-[-1px]',
  secondary: 'border border-[rgba(0,121,97,0.18)] bg-[rgba(224,248,239,0.68)] text-[#16735c] hover:translate-y-[-1px]',
  ghost: 'border border-[#e3ddd0] bg-[#fffdf8] shadow-[0_18px_50px_rgba(31,34,30,0.11)] hover:translate-y-[-1px]',
  danger: 'bg-transparent text-[#c3423f] hover:underline',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-6 py-3 text-[15px]',
};

export function Button({ variant = 'primary', size = 'md', icon, loading, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${variant !== 'ghost' && variant !== 'secondary' ? '' : 'rounded-[12px]'} ${variant === 'primary' ? 'rounded-[14px]' : ''} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="material-symbols-rounded animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-rounded text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
