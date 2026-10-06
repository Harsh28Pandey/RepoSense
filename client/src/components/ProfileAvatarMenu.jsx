import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, X, Eye, EyeOff } from 'lucide-react';
import Avatar from './ui/Avatar';
import { useStore } from '../store/useStore';
import { clearQueryCache } from '../api/queryCache';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function ProfileAvatarMenu({ isOpen, onToggle, onClose }) {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Modal OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSignOut = async () => {
    onClose();
    clearQueryCache();
    await logout();
    navigate('/signin', { replace: true });
  };

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      await API.post('/auth/send-password-otp', { email: user?.email });
      toast.success('Password reset OTP sent to your email!');
      setOtpSent(true);
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setSubmitting(true);
      await API.post('/auth/change-password', {
        otpCode: otpCode.trim(),
        newPassword
      });
      toast.success('Password changed successfully');
      setChangePasswordOpen(false);
      setOtpSent(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[a-z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  return (
    <div className="relative">
      {/* 36px Round Avatar Button Trigger */}
      <button
        type="button"
        aria-label="User profile menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex items-center justify-center p-0.5 rounded-full border border-[#D3D9E2] hover:border-[#2F6FDE] transition-colors cursor-pointer"
      >
        <Avatar user={user} size={36} />
      </button>

      {/* Downward Profile Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Profile options"
          className="absolute right-0 mt-2 w-[260px] bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl shadow-xl z-50 p-4 text-xs space-y-3 transition-all animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#D3D9E2]">
            <Avatar user={user} size={48} />
            <div className="min-w-0 flex-1">
              <h4
                className="font-semibold text-sm text-[#1F2A37] truncate"
                title={user?.fullName || user?.githubUsername || 'Developer'}
              >
                {user?.fullName || user?.githubUsername || 'Developer'}
              </h4>
              <p className="text-[12px] text-[#5B6778] truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-xl bg-[#E8ECF1] text-[#1F2A37] text-[10px] font-mono font-medium">
                Developer
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1" role="none">
            <button
              role="menuitem"
              onClick={() => {
                onClose();
                setChangePasswordOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#1F2A37] hover:bg-[#E8ECF1] transition-colors cursor-pointer text-left font-medium"
            >
              <KeyRound className="w-4 h-4 text-[#5B6778]" />
              <span>Change password</span>
            </button>

            <button
              role="menuitem"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#C93C3C] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left font-semibold"
            >
              <LogOut className="w-4 h-4 text-[#C93C3C]" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#2F6FDE]" />
                <h3 className="font-bold text-sm text-[#1F2A37]">Change Password</h3>
              </div>
              <button
                onClick={() => {
                  setChangePasswordOpen(false);
                  setOtpSent(false);
                }}
                className="p-1 rounded-xl text-[#5B6778] hover:bg-[#E8ECF1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!otpSent ? (
              <div className="space-y-4 py-2">
                <p className="text-xs text-[#5B6778] leading-relaxed">
                  Click below to receive a 6-digit verification OTP on your email: <br />
                  <span className="font-semibold text-[#1F2A37] break-all">{user?.email}</span>
                </p>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#FAFBFC] font-semibold text-xs transition-colors shadow-xs"
                >
                  {sendingOtp ? 'Sending Verification OTP...' : 'Send Verification OTP'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#5B6778]">6-Digit OTP Code</label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={cooldown > 0 || sendingOtp}
                      className="text-[10px] text-[#2F6FDE] font-semibold hover:underline disabled:text-[#8792A2]"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : sendingOtp ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs font-mono font-bold text-center tracking-widest text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6778] mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={72}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars (upper, lower, num)"
                      className="w-full pl-3.5 pr-9 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
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
                      <div className="flex gap-1 h-1">
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
                  <label className="block text-[11px] font-semibold text-[#5B6778] mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-3.5 pr-9 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
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
                    <p className="text-[10px] text-[#C93C3C] mt-0.5">Passwords do not match</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChangePasswordOpen(false);
                      setOtpSent(false);
                    }}
                    className="px-3.5 py-1.5 rounded-2xl bg-[#E8ECF1] text-xs text-[#1F2A37] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-2xl bg-[#2F6FDE] text-[#FAFBFC] text-xs font-semibold shadow-xs hover:bg-[#2459B8]"
                  >
                    {submitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

