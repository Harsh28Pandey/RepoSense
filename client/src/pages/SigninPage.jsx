import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/client';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function SigninPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useStore();

  const [githubUsername, setGithubUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!githubUsername || !password) {
      toast.error('Please enter your GitHub username and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post('/auth/signin', { githubUsername, password });

      if (res.data?.data?.requiresVerification) {
        toast.error('Account is unverified. OTP sent to your email.');
        navigate('/verify-otp', { state: { email: res.data.data.email, userId: res.data.data.userId } });
        return;
      }

      toast.success('Signed in successfully!');
      await fetchUser();
      navigate(from, { replace: true });
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[#1F2A37]">Sign In to RepoSense</h1>
        <p className="text-xs text-[#5B6778]">Enter your GitHub username and password to log in</p>
      </div>

      <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1.5">GitHub Username</label>
            <input
              type="text"
              required
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g. octocat"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-[#1F2A37]">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[#2F6FDE] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type={passwordShown ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6778]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={passwordShown}
                onChange={() => setPasswordShown(!passwordShown)}
                className="rounded text-[#2F6FDE]"
              />
              <span>Show password</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#D3D9E2] text-xs text-[#5B6778]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2F6FDE] font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
