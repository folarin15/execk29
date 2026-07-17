import type { ReactNode } from 'react';

type BadgeVariant = 'mint' | 'clay' | 'citron' | 'plum' | 'sky' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}

const map: Record<BadgeVariant, string> = {
  mint: 'bg-[rgba(42,157,127,0.13)] text-[#16735c]',
  clay: 'bg-[rgba(217,111,77,0.13)] text-[#d96f4d]',
  citron: 'bg-[rgba(216,199,77,0.13)] text-[#8a7e20]',
  plum: 'bg-[rgba(92,63,125,0.13)] text-[#5c3f7d]',
  sky: 'bg-[rgba(95,168,211,0.13)] text-[#3a7ca5]',
  neutral: 'bg-[#e3ddd0] text-[#67706c]',
};

export function Badge({ variant = 'neutral', children, dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-[600] uppercase tracking-[0.5px] ${map[variant]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
