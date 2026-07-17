import { useState, useEffect } from 'react';
import { Card, SearchBar, Badge, EmptyState, LoadingSkeleton, Button, PhotoViewer } from '../../components/ui';
import { RoleGuard } from '../../permissions';
import { birthdayService } from '../../services';
import type { Birthday } from '../../types';
import { getDaysLabel } from '../../utils/format';

const friendlyEmptyMessages = [
  { icon: 'celebration', message: 'No birthdays this week', description: 'Looks like everyone has been celebrated. Check back next week!' },
  { icon: 'cake', message: 'No birthdays found', description: 'Try a different search or browse the full calendar.' },
];

export function DesignerBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Birthday | null>(null);

  useEffect(() => {
    birthdayService.getUpcoming(6).then(b => {
      setBirthdays(b);
      setLoading(false);
    });
  }, []);

  const filtered = birthdays.filter(b =>
    b.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const emptyMsg = search ? friendlyEmptyMessages[1] : friendlyEmptyMessages[0];

  return (
    <RoleGuard roles={['admin', 'representative', 'designer']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Upcoming Birthdays</h1>
            <p className="text-[14px] text-[#67706c]">Celebrate and acknowledge students' milestones this month.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon="filter_list">Filter</Button>
            <Button variant="secondary" size="sm" icon="calendar_month">View Calendar</Button>
          </div>
        </div>

        <SearchBar placeholder="Search student..." onSearch={setSearch} className="max-w-sm" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="sm">
                <div className="aspect-[4/5] bg-[#e3ddd0] rounded-[10px] animate-pulse mb-3" />
                <LoadingSkeleton lines={2} />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={emptyMsg.icon} message={emptyMsg.message} description={emptyMsg.description} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(b => (
              <Card
                key={b.id}
                hover
                padding="sm"
                className="cursor-pointer overflow-hidden"
                onClick={() => setSelected(b)}
              >
                <div className="aspect-[4/5] relative rounded-[10px] overflow-hidden bg-[#f0ece2] mb-3">
                  {b.photoUrl ? (
                    <img src={b.photoUrl} alt={b.studentName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-rounded text-[48px] text-[#67706c]">person</span>
                    </div>
                  )}
                  {b.isToday && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="clay">
                        <span className="material-symbols-rounded text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>cake</span>
                        TODAY
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-['Fraunces',serif] text-[18px] font-[500] text-[#171b1f] leading-tight">{b.studentName}</h3>
                    <p className="text-[13px] text-[#67706c]">{b.birthDate}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e3ddd0] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${b.isToday ? 'bg-[#d96f4d] animate-pulse' : 'bg-[#67706c]'}`} />
                  <span className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[#67706c]">{b.isToday ? 'Birthday today' : getDaysLabel(b.daysUntilBirthday)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selected && (
          <PhotoViewer
            open={!!selected}
            onClose={() => setSelected(null)}
            photoUrl={selected.photoUrl}
            name={selected.studentName}
            subtitle={`${getDaysLabel(selected.daysUntilBirthday)}`}
            badge={selected.isToday ? 'TODAY' : undefined}
            meta={[
              { label: 'Birthday', value: selected.birthDate },
              { label: 'Status', value: selected.isToday ? 'Celebrate today!' : `Coming up in ${selected.daysUntilBirthday} days` },
            ]}
            onDownload={() => {}}
          />
        )}
      </div>
    </RoleGuard>
  );
}
