import { useState, useEffect } from 'react';
import type { ActivityEntry } from '../../types';
import { ServiceRegistry } from '../../providers/ServiceRegistry';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

const categoryIcons: Record<string, string> = {
  upload: 'cloud_upload',
  verify: 'verified',
  publish: 'campaign',
  download: 'download',
  update: 'edit',
  create: 'add_circle',
};

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ServiceRegistry.activity.getRecent(limit).then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, [limit]);

  if (loading) return <LoadingSkeleton lines={4} />;

  if (entries.length === 0) {
    return <EmptyState icon="timeline" message="No activity yet" description="Actions will appear here as they happen." />;
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="flex gap-3 py-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center shrink-0">
              <span className="material-symbols-rounded text-[#2a9d7f] text-[16px]">{categoryIcons[entry.category] || 'circle'}</span>
            </div>
            {idx < entries.length - 1 && <div className="w-px flex-1 bg-[#e3ddd0] my-1" />}
          </div>
          <div className="flex-1 min-w-0 pb-3">
            <p className="text-[13px] text-[#171b1f]">
              <span className="font-[500]">{entry.actor}</span>
              <span className="text-[#67706c]"> {entry.action}</span>
              {entry.target && <span className="text-[#67706c]"> — </span>}
              {entry.target && <span className="font-[500] text-[#171b1f]">{entry.target}</span>}
            </p>
            <p className="text-[11px] text-[#67706c] mt-0.5">{entry.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
