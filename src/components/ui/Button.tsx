import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  children?: ReactNode;
}

const base = 'inline-flex items-center justify-center gap-2 font-[500] cursor-pointer transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<string, string> = {
  primary: 'bg-[#2a9d7f] text-white hover:bg-[#16735c]',
  secondary: 'bg-transparent text-[#171b1f] border border-[#e3ddd0] hover:border-[#2a9d7f] hover:text-[#2a9d7f]',
  ghost: 'bg-transparent text-[#2a9d7f] hover:underline',
  danger: 'bg-transparent text-[#c3423f] hover:underline',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-full',
  md: 'px-5 py-2.5 text-[15px] rounded-full',
  lg: 'px-6 py-3 text-[15px] rounded-full',
};

export function Button({ variant = 'primary', size = 'md', icon, loading, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="material-symbols-rounded animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-rounded text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
