import type { ReactNode } from 'react';

type BadgeVariant = 'mint' | 'clay' | 'citron' | 'plum' | 'sky' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}

const pillStyle = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.78rem] font-[650]';

const map: Record<BadgeVariant, string> = {
  mint: 'bg-[rgba(42,157,127,0.12)] text-[#16735c] border border-[rgba(42,157,127,0.28)]',
  clay: 'bg-[rgba(217,111,77,0.12)] text-[#d96f4d] border border-[rgba(217,111,77,0.28)]',
  citron: 'bg-[rgba(216,199,77,0.12)] text-[#9a8a30] border border-[rgba(216,199,77,0.28)]',
  plum: 'bg-[rgba(92,63,125,0.12)] text-[#5c3f7d] border border-[rgba(92,63,125,0.28)]',
  sky: 'bg-[rgba(95,168,211,0.12)] text-[#3a7ca5] border border-[rgba(95,168,211,0.28)]',
  neutral: 'bg-[rgba(23,27,31,0.06)] text-[#67706c] border border-[rgba(23,27,31,0.1)]',
};

export function Badge({ variant = 'neutral', children, dot }: BadgeProps) {
  return (
    <span className={`${pillStyle} ${map[variant]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
