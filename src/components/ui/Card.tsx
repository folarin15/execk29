import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-6' };

export function Card({ children, hover = false, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-[#fffdf8] border border-[#e3ddd0] rounded-[16px] shadow-[0_10px_28px_rgba(31,34,30,0.08)] ${paddings[padding]} ${hover ? 'hover:shadow-[0_18px_50px_rgba(31,34,30,0.11)] hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
