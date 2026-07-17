import type { UserRole } from '../../types';
import { APP_NAME, WORKSPACE, ROUTES } from '../../constants';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const allNavItems: NavItem[] = [
  { icon: 'space_dashboard', label: 'Dashboard', path: '#' },
  { icon: 'upload_file', label: 'Resources', path: ROUTES.ACADEMIC },
  { icon: 'receipt_long', label: 'Finance', path: ROUTES.FINANCE },
  { icon: 'verified', label: 'Audit', path: ROUTES.AUDITOR },
  { icon: 'cake', label: 'Birthdays', path: ROUTES.DESIGNER },
  { icon: 'admin_panel_settings', label: 'Admin', path: ROUTES.ADMIN },
  { icon: 'group', label: 'Representatives', path: ROUTES.REPRESENTATIVE },
];

interface SidebarProps {
  role: UserRole;
  currentPath: string;
}

export function Sidebar({ role, currentPath }: SidebarProps) {
  const filtered = allNavItems.filter(item => {
    if (role === 'admin') return true;
    if (role === 'representative') return !item.label.includes('Finance') && !item.label.includes('Audit') && !item.label.includes('Admin');
    if (role === 'academic') return item.label === 'Dashboard' || item.label === 'Resources';
    if (role === 'treasurer') return item.label === 'Dashboard' || item.label === 'Finance';
    if (role === 'auditor') return item.label === 'Dashboard' || item.label === 'Audit';
    if (role === 'designer') return item.label === 'Dashboard' || item.label === 'Birthdays';
    return false;
  });

  return (
    <aside className="w-[260px] bg-[#171b1a] text-white flex flex-col shrink-0 h-full">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#2a9d7f] flex items-center justify-center">
            <span className="material-symbols-rounded text-[18px]">account_balance</span>
          </div>
          <div>
            <p className="text-[13px] font-[500] font-['Fraunces',serif]">{APP_NAME}</p>
            <p className="text-[11px] text-[#67706c] tracking-[0.5px]">{WORKSPACE}</p>
          </div>
        </div>
        <nav className="space-y-0.5">
          {filtered.map(item => (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] transition-all duration-200 ${
                currentPath === item.path
                  ? 'bg-[#2a9d7f] text-white font-[500]'
                  : 'text-[#e3ddd0] hover:bg-[#222927]'
              }`}
              onClick={e => { e.preventDefault(); window.history.pushState({}, '', item.path); window.dispatchEvent(new Event('popstate')); }}
            >
              <span className="material-symbols-rounded text-[20px]">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mt-auto px-5 py-4 border-t border-[#222927]">
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] text-[#e3ddd0] hover:bg-[#222927] transition-all">
          <span className="material-symbols-rounded text-[20px]">contact_support</span>
          Support
        </a>
      </div>
    </aside>
  );
}
