import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout';
import { LoginPage } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RepresentativeDashboard } from './pages/representative/RepresentativeDashboard';
import { AcademicResources } from './pages/academic/AcademicResources';
import { FinanceTreasurer } from './pages/finance/FinanceTreasurer';
import { AuditorVerify } from './pages/auditor/AuditorVerify';
import { DesignerBirthdays } from './pages/designer/DesignerBirthdays';
import { StudyAnalytics } from './pages/admin/StudyAnalytics';
import { MemberList } from './pages/admin/MemberList';
import { Suggestions } from './pages/admin/Suggestions';
import { SettingsPlaceholder, ForcePasswordChange } from './components/ui';
import { useLocation } from './hooks/useLocation';
import { ROUTES } from './constants';
import { LoadingSkeleton } from './components/ui';

const routeMap: Record<string, () => React.ReactElement> = {
  [ROUTES.ADMIN]: () => <AdminDashboard />,
  [ROUTES.REPRESENTATIVE]: () => <RepresentativeDashboard />,
  [ROUTES.ACADEMIC]: () => <AcademicResources />,
  [ROUTES.FINANCE]: () => <FinanceTreasurer />,
  [ROUTES.AUDITOR]: () => <AuditorVerify />,
  [ROUTES.DESIGNER]: () => <DesignerBirthdays />,
  [ROUTES.ANALYTICS]: () => <StudyAnalytics />,
  [ROUTES.MEMBERS]: () => <MemberList />,
  [ROUTES.SUGGESTIONS]: () => <Suggestions />,
  '/settings': () => <SettingsPlaceholder />,
};

function Router() {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6ef]">
        <div className="text-center space-y-4">
          <span className="material-symbols-rounded animate-spin text-[#2a9d7f] text-[32px]">progress_activity</span>
          <LoadingSkeleton lines={2} width="200px" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.mustChangePassword) {
    return <ForcePasswordChange />;
  }

  const page = routeMap[pathname] ?? (() => <AdminDashboard />);

  return <AppLayout>{page()}</AppLayout>;
}

export default function App() {
  return <Router />;
}
