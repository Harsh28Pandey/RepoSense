import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    githubUsername: '',
    password: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [githubChecking, setGithubChecking] = useState(false);
  const [githubValid, setGithubValid] = useState(null);
  const [passwordShown, setPasswordShown] = useState(false);

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);

  const handleCheckGithub = async () => {
    if (!formData.githubUsername.trim()) return;
    try {
      setGithubChecking(true);
      const res = await API.get(`/auth/check-github-username?username=${encodeURIComponent(formData.githubUsername)}`);
      if (res.data?.data?.exists) {
        setGithubValid(true);
        toast.success('GitHub username verified!');
      } else {
        setGithubValid(false);
        toast.error('GitHub user not found on GitHub.');
      }
    } catch (err) {
      setGithubValid(false);
    } finally {
      setGithubChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (strength < 3) {
      toast.error('Password must be at least 8 characters and include uppercase, lowercase, and numbers.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post('/auth/signup', formData);
      toast.success(res.data?.data?.message || 'OTP sent to your email!');
      navigate('/verify-otp', { state: { email: formData.email, userId: res.data?.data?.userId } });
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2A37]">Create RepoSense Account</h1>
        <p className="text-xs text-[#5B6778]">Enter your details to register and verify via email OTP</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Harsh Pandey"
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="harsh.dev@example.com"
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">GitHub Username (Mandatory)</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.githubUsername}
                onChange={(e) => { setFormData({ ...formData, githubUsername: e.target.value }); setGithubValid(null); }}
                placeholder="e.g. octocat"
                className="flex-1 px-3.5 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
              />
              <button
                type="button"
                onClick={handleCheckGithub}
                disabled={githubChecking}
                className="px-3.5 py-2 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#1F2A37] font-medium text-xs border border-[#D3D9E2]"
              >
                {githubChecking ? 'Checking...' : 'Verify'}
              </button>
            </div>
            {githubValid === true && <p className="text-[11px] text-[#2E8B57] mt-1 font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Verified GitHub User</p>}
            {githubValid === false && <p className="text-[11px] text-[#C93C3C] mt-1 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> GitHub user not found</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#1F2A37] mb-1">Password</label>
            <input
              type={passwordShown ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 8 chars (upper, lower, number)"
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
            />
            
            {formData.password && (
              <div className="mt-1.5 space-y-1">
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
                <span className="text-[10px] text-[#5B6778]">
                  Strength: {strength >= 4 ? 'Strong' : strength >= 3 ? 'Moderate' : 'Weak'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6778] pt-0.5">
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
            className="w-full py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
          >
            {submitting ? 'Registering Account...' : 'Create Account & Send OTP'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#D3D9E2] text-xs text-[#5B6778]">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#2F6FDE] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

