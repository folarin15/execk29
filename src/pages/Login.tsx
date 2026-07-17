import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LANDING, APP_NAME } from '../constants';
import buildingImg from '../assets/physiology-building.png';
import uiLogo from '../assets/ui-logo.jpeg';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = buildingImg;
  }, []);

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
      setError('Invalid credentials. Please check your email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6ef] relative overflow-hidden">

      {/* ── Building — responsive architectural texture ── */}
      <style>{`
        .building-bg {
          background-image: url(${buildingImg});
          background-position: 25% center;
          background-repeat: no-repeat;
          background-size: 300% auto;
        }
        @media (min-width: 768px) {
          .building-bg { background-size: auto; }
        }
      `}</style>
      <div
        className="building-bg absolute inset-0 pointer-events-none select-none transition-opacity duration-500"
        style={{
          opacity: imageLoaded ? 1 : 0,
          filter: 'sepia(0.12) hue-rotate(110deg) saturate(0.3)',
          maskImage: 'linear-gradient(to right, transparent 12%, rgba(0,0,0,0.20) 25%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.60) 80%, rgba(0,0,0,0.65) 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 12%, rgba(0,0,0,0.20) 25%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.60) 80%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 w-full flex items-center gap-2 px-6 h-16">
        <span className="material-symbols-rounded text-[#2a9d7f] text-[22px]">account_balance</span>
        <span className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">{APP_NAME}</span>
      </header>

      {/* ── Login card ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px] bg-[#fffdf8] border border-[#e3ddd0] rounded-[24px] p-8 shadow-[0_18px_50px_rgba(31,34,30,0.11)] space-y-6">
          <div className="text-center space-y-3">
            <img
              src={uiLogo}
              alt="University of Ibadan"
              className="w-12 h-12 object-contain mx-auto"
              style={{ aspectRatio: '1' }}
            />
            <h1 className="font-['Fraunces',serif] text-[24px] font-[500] text-[#171b1f]">Access Control</h1>
            <p className="text-[14px] text-[#67706c]">Sign in to the Executive Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
              <span>Email</span>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[#67706c] text-[18px]">person</span>
                <input
                  className="w-full pl-10 pr-3.5 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)] transition-all"
                  placeholder="you@ui.edu.ng"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
              <span>Password</span>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[#67706c] text-[18px]">key</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)] transition-all"
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] cursor-pointer border-none" onClick={() => setShowPass(!showPass)}>
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
        </div>
      </main>
    </div>
  );
}
