import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Bell, ExternalLink, ShieldCheck, UserCheck, AlertTriangle,
  Key, Trash2, Edit3, X
} from 'lucide-react';
import Avatar from './ui/Avatar';
import { useStore } from '../store/useStore';
import { clearQueryCache } from '../api/queryCache';
import toast from 'react-hot-toast';

export default function UserMenu({
  isOpen,
  onClose,
  onOpenNotifications,
  direction = 'down' // 'up' for sidebar bottom, 'down' for top bar
}) {
  const { user, logout, updateProfile, changePassword, deleteAccount } = useStore();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null); // 'editName' | 'changePassword' | 'deleteAccount'

  // Modal form states
  const [newName, setNewName] = useState(user?.fullName || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [deleteInput, setDeleteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    setNewName(user?.fullName || '');
  }, [user]);

  // Accessibility: Esc key & outside click listeners
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    onClose();
    clearQueryCache();
    await logout();
    navigate('/signin', { replace: true });
  };

  const handleUpdateNameSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setIsSubmitting(true);
      await updateProfile({ fullName: newName.trim() });
      toast.success('Name updated successfully');
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPasswordOtp = async () => {
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
      setIsSubmitting(true);
      await API.post('/auth/change-password', {
        otpCode: otpCode.trim(),
        newPassword
      });
      toast.success('Password changed successfully');
      setActiveModal(null);
      setOtpSent(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (deleteInput !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      setIsSubmitting(true);
      await deleteAccount({ password: currentPassword });
      toast.success('Account deleted cleanly');
      onClose();
      clearQueryCache();
      navigate('/signin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuPositionClass = direction === 'up'
    ? 'bottom-full mb-2 left-0'
    : 'top-full mt-2 right-0';

  return (
    <>
      {/* DROPDOWN MENU */}
      <div
        ref={menuRef}
        role="menu"
        aria-label="User account menu"
        className={`absolute ${menuPositionClass} w-[280px] bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl shadow-xl z-50 p-4 text-xs space-y-3 transition-all animate-in fade-in zoom-in-95`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#D3D9E2]">
          <Avatar user={user} size={48} />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-[#1F2A37] truncate">
              {user?.fullName || user?.githubUsername || 'Developer'}
            </h4>
            <p className="text-[12px] text-[#5B6778] truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-xl bg-[#E8ECF1] text-[#1F2A37] text-[10px] font-mono font-medium">
              Developer
            </span>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="space-y-1.5 py-1">
          {/* Email Verified */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2E8B57]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E8B57]" />
            <span>Email Verified</span>
          </div>

          {/* GitHub Verified */}
          {user?.githubConnected && user?.githubUsername ? (
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[11px] font-semibold text-[#2E8B57] hover:underline group"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#2E8B57]" />
                <span>github.com/{user.githubUsername}</span>
              </span>
              <ExternalLink className="w-3 h-3 text-[#2E8B57] group-hover:translate-x-0.5 transition-transform" />
            </a>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#D97706]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>GitHub Unreachable / Not Connected</span>
            </div>
          )}
        </div>

        <div className="border-t border-[#D3D9E2]" />

        {/* Actions */}
        <div className="space-y-1" role="none">
          {/* Notifications */}
          <button
            role="menuitem"
            onClick={() => {
              onClose();
              if (onOpenNotifications) onOpenNotifications();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1F2A37] hover:bg-[#E8ECF1] transition-colors cursor-pointer text-left font-medium"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#5B6778]" />
              Notifications
            </span>
          </button>

          {/* Edit Name */}
          <button
            role="menuitem"
            onClick={() => setActiveModal('editName')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#1F2A37] hover:bg-[#E8ECF1] transition-colors cursor-pointer text-left font-medium"
          >
            <Edit3 className="w-4 h-4 text-[#5B6778]" />
            Edit Profile Name
          </button>

          {/* Change Password */}
          <button
            role="menuitem"
            onClick={() => setActiveModal('changePassword')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#1F2A37] hover:bg-[#E8ECF1] transition-colors cursor-pointer text-left font-medium"
          >
            <Key className="w-4 h-4 text-[#5B6778]" />
            Change Password
          </button>

          {/* Delete Account */}
          <button
            role="menuitem"
            onClick={() => setActiveModal('deleteAccount')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#C93C3C] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left font-medium"
          >
            <Trash2 className="w-4 h-4 text-[#C93C3C]" />
            Delete Account
          </button>

          <div className="border-t border-[#D3D9E2] my-1" />

          {/* Sign Out */}
          <button
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#C93C3C] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left font-semibold"
          >
            <LogOut className="w-4 h-4 text-[#C93C3C]" />
            Sign out
          </button>
        </div>
      </div>

      {/* MODALS FOR ACCOUNT ACTIONS */}
      {activeModal === 'editName' && (
        <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
              <h3 className="font-bold text-sm text-[#1F2A37]">Edit Profile Name</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-xl text-[#5B6778]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateNameSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#5B6778] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 rounded-2xl bg-[#E8ECF1] text-xs text-[#1F2A37] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-2xl bg-[#2F6FDE] text-[#FAFBFC] text-xs font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'changePassword' && (
        <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#2F6FDE]" />
                <h3 className="font-bold text-sm text-[#1F2A37]">Change Password</h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
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
                  onClick={handleSendPasswordOtp}
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
                      onClick={handleSendPasswordOtp}
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
                      {showNew ? <X className="w-4 h-4 rotate-45" /> : <Key className="w-4 h-4" />}
                    </button>
                  </div>
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
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-[#C93C3C] mt-0.5">Passwords do not match</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setOtpSent(false);
                    }}
                    className="px-3.5 py-1.5 rounded-2xl bg-[#E8ECF1] text-xs text-[#1F2A37] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-2xl bg-[#2F6FDE] text-[#FAFBFC] text-xs font-semibold shadow-xs hover:bg-[#2459B8]"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeModal === 'deleteAccount' && (
        <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FAFBFC] border border-[#C93C3C] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
              <h3 className="font-bold text-sm text-[#C93C3C] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Delete Account Permanently
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-xl text-[#5B6778]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#5B6778]">
              This action cannot be undone. All your repositories, scans, READMEs, chat sessions, and notifications will be wiped permanently.
            </p>
            <form onSubmit={handleDeleteAccountSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#5B6778] mb-1">Your Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs text-[#1F2A37] focus:outline-none focus:border-[#C93C3C]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5B6778] mb-1">Type "DELETE" to confirm</label>
                <input
                  type="text"
                  required
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs text-[#1F2A37] focus:outline-none focus:border-[#C93C3C]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 rounded-2xl bg-[#E8ECF1] text-xs text-[#1F2A37] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || deleteInput !== 'DELETE'}
                  className="px-4 py-1.5 rounded-2xl bg-[#C93C3C] text-[#FAFBFC] text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Everything'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
