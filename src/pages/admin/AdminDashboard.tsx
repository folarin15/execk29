import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLocation } from '../../hooks/useLocation';

const modules = [
  { icon: 'badge', label: 'Manage Representatives', desc: 'Oversee and assign territories to regional executive leads.', path: '/representative' },
  { icon: 'school', label: 'Manage Academics', desc: 'Coordinate curriculum standards and faculty credentialing.', path: '/academic' },
  { icon: 'palette', label: 'Manage Designers', desc: 'Review design assets, brand guidelines, and creative staff.', path: '/designer' },
  { icon: 'payments', label: 'Manage Finance', desc: 'Audit expenditures, approve payroll, and financial reports.', path: '/finance' },
  { icon: 'diversity_3', label: 'Manage Students', desc: 'Directory of enrolled students, enrollment status, and records.', path: '#' },
  { icon: 'language', label: 'Website Settings', desc: 'Coming soon — CMS, SEO, and security configuration.', path: '/settings', badge: 'Coming Soon' },
];

export function AdminDashboard() {
  const { navigate } = useLocation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Welcome back, Admin.</h1>
        <p className="text-[14px] text-[#67706c]">System status is operational. Select a module to manage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {modules.map(m => (
          <Card key={m.label} hover padding="lg" className="cursor-pointer flex flex-col" onClick={() => navigate(m.path)}>
            <div className="flex flex-col items-center text-center gap-3 flex-1">
              <div className="w-14 h-14 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center">
                <span className="material-symbols-rounded text-[#2a9d7f] text-[28px]">{m.icon}</span>
              </div>
              <h3 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">{m.label}</h3>
              <p className="text-[13px] text-[#67706c]">{m.desc}</p>
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
