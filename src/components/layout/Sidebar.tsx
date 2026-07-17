import type { UserRole } from '../../types';
import { APP_NAME, ROUTES, ROLE_LANDING } from '../../constants';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const allNavItems = (role: UserRole): NavItem[] => [
  { icon: 'space_dashboard', label: 'Dashboard', path: ROLE_LANDING[role] || ROUTES.ADMIN },
  { icon: 'analytics', label: 'Analytics', path: ROUTES.ANALYTICS },
  { icon: 'group', label: 'Members', path: ROUTES.MEMBERS },
  { icon: 'upload_file', label: 'Resources', path: ROUTES.ACADEMIC },
  { icon: 'receipt_long', label: 'Finance', path: ROUTES.FINANCE },
  { icon: 'verified', label: 'Audit', path: ROUTES.AUDITOR },
  { icon: 'cake', label: 'Birthdays', path: ROUTES.DESIGNER },
  { icon: 'forum', label: 'Suggestions', path: ROUTES.SUGGESTIONS },
  { icon: 'admin_panel_settings', label: 'Admin', path: ROUTES.ADMIN },
  { icon: 'group', label: 'Representatives', path: ROUTES.REPRESENTATIVE },
];

interface SidebarProps {
  role: UserRole;
  currentPath: string;
}

export function Sidebar({ role, currentPath }: SidebarProps) {
  const filtered = allNavItems(role).filter(item => {
    if (role === 'admin') return true;
    if (role === 'representative') return ['Dashboard', 'Analytics', 'Members', 'Resources', 'Suggestions'].includes(item.label);
    if (role === 'academic') return ['Dashboard', 'Analytics', 'Members', 'Resources'].includes(item.label);
    if (role === 'treasurer') return ['Dashboard', 'Finance'].includes(item.label);
    if (role === 'auditor') return ['Dashboard', 'Audit'].includes(item.label);
    if (role === 'designer') return ['Dashboard', 'Birthdays'].includes(item.label);
    return false;
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-[260px] bg-[#171b1a] text-white flex-col shrink-0 self-stretch">
        <div className="px-5 py-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-full bg-[#2a9d7f] flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">account_balance</span>
            </div>
            <p className="text-[13px] font-[500] font-['Fraunces',serif]">{APP_NAME}</p>
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
                onClick={e => { e.preventDefault(); navigate(item.path); }}
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

      {/* ── Mobile top nav bar ── */}
      <div className="flex lg:hidden w-full overflow-x-auto no-scrollbar bg-[#171b1a] shrink-0">
        <nav className="flex items-center gap-1 px-2 py-1.5 min-w-max">
          {filtered.map(item => (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[12px] whitespace-nowrap transition-all duration-200 ${
                currentPath === item.path
                  ? 'bg-[#2a9d7f] text-white font-[500]'
                  : 'text-[#e3ddd0] hover:bg-[#222927]'
              }`}
              onClick={e => { e.preventDefault(); navigate(item.path); }}
            >
              <span className="material-symbols-rounded text-[16px]">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
