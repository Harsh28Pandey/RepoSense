import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    try {
      setSubmitting(true);
      const res = await API.post('/auth/forgot-password', {
        githubUsername: identifier.trim(),
        email: identifier.trim()
      });
      toast.success(res.data?.data?.message || 'Password reset OTP sent to registered email.');
      navigate('/reset-password', {
        state: {
          githubUsername: identifier.trim(),
          maskedEmail: res.data?.data?.maskedEmail
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to send reset OTP');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2A37]">Reset Your Password</h1>
        <p className="text-xs text-[#5B6778]">Enter your GitHub username or email to receive a password reset OTP</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">GitHub Username or Email</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. octocat or user@example.com"
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
          >
            {submitting ? 'Sending OTP...' : 'Send Reset OTP'}
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

