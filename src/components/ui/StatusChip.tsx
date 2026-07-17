type Status = 'live' | 'verified' | 'pending' | 'draft' | 'scheduled' | 'synced' | 'completed';

interface StatusChipProps {
  status: Status;
}

const chip: Record<Status, { label: string; style: string }> = {
  live: { label: 'LIVE', style: 'bg-[rgba(42,157,127,0.13)] text-[#16735c]' },
  verified: { label: 'VERIFIED', style: 'bg-[rgba(42,157,127,0.13)] text-[#16735c]' },
  pending: { label: 'PENDING', style: 'bg-[rgba(217,111,77,0.13)] text-[#d96f4d]' },
  draft: { label: 'DRAFT', style: 'bg-[rgba(216,199,77,0.13)] text-[#8a7e20]' },
  scheduled: { label: 'SCHEDULED', style: 'bg-[rgba(95,168,211,0.13)] text-[#3a7ca5]' },
  synced: { label: 'SYNCED', style: 'bg-[rgba(92,63,125,0.13)] text-[#5c3f7d]' },
  completed: { label: 'COMPLETED', style: 'bg-[#e3ddd0] text-[#67706c]' },
};

export function StatusChip({ status }: StatusChipProps) {
  const c = chip[status] || chip.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-[600] uppercase tracking-[0.5px] ${c.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}
