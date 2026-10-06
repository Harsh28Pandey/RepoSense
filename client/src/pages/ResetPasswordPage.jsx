import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [githubUsername, setGithubUsername] = useState(location.state?.githubUsername || '');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const strength = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[a-z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const handleResend = async () => {
    if (!githubUsername.trim()) {
      toast.error('Please enter your GitHub username or email to resend OTP.');
      return;
    }
    try {
      setResending(true);
      const res = await API.post('/auth/forgot-password', {
        githubUsername: githubUsername.trim(),
        email: githubUsername.trim()
      });
      toast.success(res.data?.data?.message || 'New reset OTP sent to your email.');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubUsername || !otpCode || !newPassword || !confirmPassword) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (strength < 3) {
      toast.error('Password must be at least 8 characters and include uppercase, lowercase, and numbers.');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/auth/reset-password', {
        githubUsername: githubUsername.trim(),
        email: githubUsername.trim(),
        otpCode: otpCode.trim(),
        newPassword
      });
      toast.success('Password reset successfully! Please sign in with your new password.');
      navigate('/signin');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2A37]">Set New Password</h1>
        <p className="text-xs text-[#5B6778]">Enter the OTP sent to your email along with your new password</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">GitHub Username or Email</label>
            <input
              type="text"
              required
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g. octocat or user@example.com"
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#1F2A37]">6-Digit OTP Code</label>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="text-[11px] text-[#2F6FDE] font-semibold hover:underline disabled:text-[#8792A2]"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] font-mono text-center font-bold text-sm tracking-widest focus:outline-none focus:border-[#2F6FDE]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                maxLength={72}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars (upper, lower, number)"
                className="w-full pl-3.5 pr-9 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-[#5B6778]"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-1 space-y-0.5">
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`flex-1 rounded-full ${
                        lvl <= strength
                          ? strength >= 4 ? 'bg-[#2E8B57]' : strength >= 3 ? 'bg-[#B7791F]' : 'bg-[#C93C3C]'
                          : 'bg-[#D3D9E2]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-3.5 pr-9 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-[#5B6778]"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-[#C93C3C] mt-0.5 font-semibold">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm mt-1"
          >
            {submitting ? 'Resetting Password...' : 'Reset Password & Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#D3D9E2] text-xs text-[#5B6778]">
          Remembered your password?{' '}
          <Link to="/signin" className="text-[#2F6FDE] font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

