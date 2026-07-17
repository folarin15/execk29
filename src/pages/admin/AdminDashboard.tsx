import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useLocation } from '../../hooks/useLocation';
import { analyticsService } from '../../services';
import type { AnalyticsSummary } from '../../types';

const modules = [
  { icon: 'badge', label: 'Manage Representatives', desc: 'Oversee and assign territories to regional executive leads.', path: '/representative' },
  { icon: 'school', label: 'Manage Academics', desc: 'Coordinate curriculum standards and faculty credentialing.', path: '/academic' },
  { icon: 'palette', label: 'Manage Designers', desc: 'Review design assets, brand guidelines, and creative staff.', path: '/designer' },
  { icon: 'payments', label: 'Manage Finance', desc: 'Audit expenditures, approve payroll, and financial reports.', path: '/finance' },
  { icon: 'diversity_3', label: 'Manage Students', desc: 'Directory of enrolled students, enrollment status, and records.', path: '/members' },
  { icon: 'language', label: 'Website Settings', desc: 'Coming soon — CMS, SEO, and security configuration.', path: '/settings', badge: 'Coming Soon' },
];

export function AdminDashboard() {
  const { navigate } = useLocation();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    analyticsService.getSummary().then(setSummary);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Fraunces',serif] text-[28px] font-[600] text-[#171b1a]">Welcome back, Admin.</h1>
        <p className="text-[14px] text-[#67706c]">System status is operational.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summary ? [
          { label: 'Class Members', value: '—', icon: 'group' },
          { label: 'Attempts', value: summary.totalAttempts, icon: 'quiz' },
          { label: 'Class Average', value: `${summary.classAverage}%`, icon: 'trending_up' },
          { label: 'Active This Week', value: summary.activeWeek, icon: 'calendar_view_week' },
        ].map(card => (
          <div key={card.label} className="phys-card p-4">
            <p className="phys-eyebrow">{card.label}</p>
            <p className="phys-metric mt-1">{card.value}</p>
          </div>
        )) : (
          <>
            {[1,2,3,4].map(i => (
              <div key={i} className="phys-card p-4">
                <LoadingSkeleton lines={2} />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map(m => (
          <Card key={m.label} hover padding="lg" className="cursor-pointer flex flex-col" onClick={() => navigate(m.path)}>
            <div className="flex flex-col items-center text-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center">
                <span className="material-symbols-rounded text-[#2a9d7f] text-[24px]">{m.icon}</span>
              </div>
              <h3 className="font-['Fraunces',serif] text-[18px] font-[500] text-[#171b1a]">{m.label}</h3>
              <p className="text-[12px] text-[#67706c]">{m.desc}</p>
            </div>
            {m.badge && (
              <div className="mt-3 pt-3 border-t border-[#e3ddd0] flex justify-center">
                <Badge variant="plum">{m.badge}</Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
