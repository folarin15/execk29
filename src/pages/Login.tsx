import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LANDING, APP_NAME } from '../constants';

const roleHints = [
  { role: 'Admin', email: 'admin@portal.executive', label: 'Full system access' },
  { role: 'Representative', email: 'rep@portal.executive', label: 'Course reps' },
  { role: 'Academic', email: 'academic@portal.executive', label: 'Faculty & lecturers' },
  { role: 'Treasurer', email: 'treasurer@portal.executive', label: 'Finance & receipts' },
  { role: 'Auditor', email: 'auditor@portal.executive', label: 'Read-only verification' },
  { role: 'Designer', email: 'designer@portal.executive', label: 'Birthday & creative' },
];

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      const landing = ROLE_LANDING[u.role];
      window.history.pushState({}, '', landing);
      window.dispatchEvent(new Event('popstate'));
    } catch {
      setError('Invalid credentials. Try the demo accounts below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6ef]">
      <header className="w-full flex items-center gap-2 px-6 h-16">
        <span className="material-symbols-rounded text-[#2a9d7f] text-[22px]">account_balance</span>
        <span className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">{APP_NAME}</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[440px] bg-[#fffdf8] border border-[#e3ddd0] rounded-[24px] p-8 shadow-[0_18px_50px_rgba(31,34,30,0.11)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center mx-auto">
              <span className="material-symbols-rounded text-[#2a9d7f] text-[28px]">lock_open</span>
            </div>
            <h1 className="font-['Fraunces',serif] text-[24px] font-[500] text-[#171b1f]">Access Control</h1>
            <p className="text-[14px] text-[#67706c]">Authenticate to enter your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
              <span>Corporate Identity</span>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[#67706c] text-[18px]">person</span>
                <input
                  className="w-full pl-10 pr-3.5 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)]"
                  placeholder="email@portal.executive"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
              <span>Security Credential</span>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[#67706c] text-[18px]">key</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)]"
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] cursor-pointer border-none" onClick={() => setShowPass(!showPass)}>
                  <span className="material-symbols-rounded text-[#67706c] text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </label>

            {error && <p className="text-[13px] text-[#c3423f] bg-[rgba(195,66,63,0.1)] px-3 py-2 rounded-[10px]">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#2a9d7f] text-white rounded-full font-[600] text-[15px] hover:bg-[#16735c] transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none">
              {loading ? (
                <span className="material-symbols-rounded animate-spin text-[18px]">progress_activity</span>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#e3ddd0] pt-5">
            <p className="text-[12px] font-[600] text-[#67706c] uppercase tracking-[0.5px] text-center mb-3">Demo Accounts</p>
            <div className="space-y-1.5">
              {roleHints.map(h => (
                <button
                  key={h.email}
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[13px] hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer border-none"
                  onClick={() => { setEmail(h.email); setPassword('password'); }}
                >
                  <span className="font-[500] text-[#171b1f]">{h.role}</span>
                  <span className="text-[#67706c] text-[12px]">{h.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
