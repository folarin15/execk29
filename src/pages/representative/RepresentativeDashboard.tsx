import { useState, useEffect } from 'react';
import { Card, LoadingSkeleton, Badge, ActivityFeed } from '../../components/ui';
import { RoleGuard, PermissionGuard } from '../../permissions';
import { announcementService, analyticsService } from '../../services';
import type { Announcement, AnalyticsSummary } from '../../types';
import { useLocation } from '../../hooks/useLocation';

const modules = [
  { icon: 'campaign', label: 'Manage Announcements', desc: 'Broadcast critical updates, schedule faculty posts, and manage priorities.', path: '/suggestions' },
  { icon: 'cloud_upload', label: 'Upload Resources', desc: 'Store academic materials, guidelines, and compliance documentation securely.', path: '/academic' },
  { icon: 'group_add', label: 'Manage Students', desc: 'Update student profiles, track performance clusters, and manage enrollment status.', path: '/members' },
  { icon: 'cake', label: 'Birthday Records', desc: 'Maintain celebration logs and automated greeting schedules for the community.', path: '/designer' },
];

export function RepresentativeDashboard() {
  const { navigate } = useLocation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      announcementService.getActive(),
      analyticsService.getSummary(),
    ]).then(([anns, sum]) => {
      setAnnouncements(anns);
      setSummary(sum);
      setLoading(false);
    });
  }, []);

  return (
    <RoleGuard roles={['admin', 'representative']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-['Fraunces',serif] text-[28px] font-[600] text-[#171b1a]">Representative Portal</h1>
          <p className="text-[14px] text-[#67706c]">Manage your organisational unit's key activities.</p>
        </div>

        {/* Rep summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Attempts', value: summary?.totalAttempts ?? '—', icon: 'quiz' },
            { label: 'Active This Week', value: summary?.activeWeek ?? '—', icon: 'calendar_view_week' },
            { label: 'Quizzes', value: summary?.totalQuizzes ?? '—', icon: 'checklist' },
            { label: 'Exams', value: summary?.totalExams ?? '—', icon: 'fact_check' },
          ].map(card => (
            <div key={card.label} className="phys-card p-4">
              <p className="phys-eyebrow">{card.label}</p>
              <p className="phys-metric mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map(m => (
            <Card key={m.label} hover padding="lg" className="cursor-pointer min-h-[160px] flex flex-col justify-between" onClick={() => navigate(m.path)}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center">
                    <span className="material-symbols-rounded text-[#2a9d7f] text-[20px]">{m.icon}</span>
                  </div>
                  {m.label === 'Manage Announcements' && (
                    <Badge variant="mint">{announcements.length} ACTIVE</Badge>
                  )}
                  {m.label === 'Birthday Records' && (
                    <span className="text-[12px] text-[#67706c] italic">Today: 3 Records</span>
                  )}
                </div>
                <h3 className="font-['Fraunces',serif] text-[18px] font-[500] text-[#171b1a] mb-1">{m.label}</h3>
                <p className="text-[12px] text-[#67706c]">{m.desc}</p>
              </div>
              <PermissionGuard permission="activity.view">
                <div className="flex items-center gap-1 mt-3 text-[#2a9d7f] font-[500] text-[13px] min-h-[44px]">
                  <span>Enter Module</span>
                  <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
                </div>
              </PermissionGuard>
            </Card>
          ))}
        </div>

        <section className="border-t border-[#e3ddd0] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Fraunces',serif] text-[18px] font-[500] text-[#171b1a]">Recent Portal Activity</h2>
            <button className="text-[13px] font-[500] text-[#67706c] hover:text-[#2a9d7f] transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent min-h-[44px] px-2">
              View Audit Log <span className="material-symbols-rounded text-[14px]">open_in_new</span>
            </button>
          </div>
          <Card padding="md">
            {loading ? (
              <LoadingSkeleton lines={4} />
            ) : (
              <ActivityFeed limit={5} />
            )}
          </Card>
        </section>
      </div>
    </RoleGuard>
  );
}
