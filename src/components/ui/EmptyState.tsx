interface EmptyStateProps {
  icon?: string;
  message: string;
  description?: string;
}

export function EmptyState({ icon = 'inbox', message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="material-symbols-rounded text-[48px] text-[#67706c] mb-3">{icon}</span>
      <p className="text-[15px] font-[500] text-[#67706c]">{message}</p>
      {description && <p className="text-[13px] text-[#67706c]/70 mt-1">{description}</p>}
    </div>
  );
}
