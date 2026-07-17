import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function ForcePasswordChange() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      const { error: rpcError } = await supabase.rpc('clear_must_change_password', { uid: user!.id });
      if (rpcError) {
        const { error: directError } = await supabase
          .from('staff_roles')
          .update({ must_change_password: false })
          .eq('user_id', user!.id);
        if (directError) throw directError;
      }

      setSuccess(true);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-[#fffdf8] rounded-[24px] p-8 max-w-[400px] w-full text-center space-y-4 shadow-[0_18px_50px_rgba(31,34,30,0.11)]">
          <span className="material-symbols-rounded text-[48px] text-[#2a9d7f]">check_circle</span>
          <h2 className="font-['Fraunces',serif] text-[22px] font-[500] text-[#171b1f]">Password Updated</h2>
          <p className="text-[14px] text-[#67706c]">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#fffdf8] rounded-[24px] p-8 max-w-[440px] w-full shadow-[0_18px_50px_rgba(31,34,30,0.11)] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center mx-auto">
            <span className="material-symbols-rounded text-[28px] text-[#2a9d7f]">lock_reset</span>
          </div>
          <h1 className="font-['Fraunces',serif] text-[24px] font-[500] text-[#171b1f]">Change Your Password</h1>
          <p className="text-[14px] text-[#67706c]">First-time sign-in detected. Please set a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
            <span>Current Password</span>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)] transition-all"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
            <span>New Password</span>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)] transition-all"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[14px] font-[500]">
            <span>Confirm New Password</span>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)] transition-all"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && (
            <p className="text-[13px] text-[#c3423f] bg-[rgba(195,66,63,0.1)] px-3 py-2 rounded-[10px]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2a9d7f] text-white rounded-full font-[600] text-[15px] hover:bg-[#16735c] transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            {loading ? (
              <span className="material-symbols-rounded animate-spin text-[18px]">progress_activity</span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
