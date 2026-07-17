import { useState, useEffect } from 'react';
import { Card, LoadingSkeleton, Badge, ActivityFeed } from '../../components/ui';
import { RoleGuard, PermissionGuard } from '../../permissions';
import { announcementService } from '../../services';
import type { Announcement } from '../../types';
import { useLocation } from '../../hooks/useLocation';

const modules = [
  { icon: 'campaign', label: 'Manage Announcements', desc: 'Broadcast critical updates, schedule faculty posts, and manage priorities.', path: '#' },
  { icon: 'cloud_upload', label: 'Upload Resources', desc: 'Store academic materials, guidelines, and compliance documentation securely.', path: '/academic' },
  { icon: 'group_add', label: 'Manage Students', desc: 'Update student profiles, track performance clusters, and manage enrollment status.', path: '#' },
  { icon: 'cake', label: 'Birthday Records', desc: 'Maintain celebration logs and automated greeting schedules for the community.', path: '/designer' },
];

export function RepresentativeDashboard() {
  const { navigate } = useLocation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementService.getActive().then(anns => {
      setAnnouncements(anns);
      setLoading(false);
    });
  }, []);

  return (
    <RoleGuard roles={['admin', 'representative']}>
      <div className="space-y-8">
        <div>
          <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Representative Portal</h1>
          <p className="text-[14px] text-[#67706c]">Manage your organisational unit's key activities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map(m => (
            <Card key={m.label} hover padding="lg" className="cursor-pointer min-h-[180px] flex flex-col justify-between" onClick={() => navigate(m.path)}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center">
                    <span className="material-symbols-rounded text-[#2a9d7f] text-[24px]">{m.icon}</span>
                  </div>
                  {m.label === 'Manage Announcements' && (
                    <Badge variant="mint">{announcements.length} ACTIVE</Badge>
                  )}
                  {m.label === 'Birthday Records' && (
                    <span className="text-[12px] text-[#67706c] italic">Today: 3 Records</span>
                  )}
                </div>
                <h3 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f] mb-1">{m.label}</h3>
                <p className="text-[13px] text-[#67706c]">{m.desc}</p>
              </div>
              <PermissionGuard permission="activity.view">
                <div className="flex items-center gap-1 mt-4 text-[#2a9d7f] font-[500] text-[13px]">
                  <span>Enter Module</span>
                  <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
                </div>
              </PermissionGuard>
            </Card>
          ))}
        </div>

        <section className="border-t border-[#e3ddd0] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">Recent Portal Activity</h2>
            <button className="text-[13px] font-[500] text-[#67706c] hover:text-[#2a9d7f] transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent">
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
