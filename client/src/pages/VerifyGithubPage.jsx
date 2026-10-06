import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API from '../api/client';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function VerifyGithubPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useStore();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    async function handleVerify() {
      if (!code) {
        setVerifying(false);
        setError('No authorization code provided in URL.');
        return;
      }

      try {
        await API.get(`/auth/github/callback?code=${code}&state=${state || ''}`);
        toast.success('GitHub account connected successfully!');
        await fetchUser();
        navigate('/app/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify GitHub connection.');
        setVerifying(false);
      }
    }

    handleVerify();
  }, [searchParams, navigate, fetchUser]);

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#1F2A37]">GitHub Verification</h1>
        <p className="text-xs text-[#5B6778]">
          Verifying your GitHub authentication status
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm space-y-6">
        {verifying ? (
          <div className="space-y-4">
            <div className="w-8 h-8 border-2 border-[#2F6FDE] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#5B6778]">Connecting your GitHub account...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#F87171]/20 text-[#DC2626] text-xs">
              {error}
            </div>
            <Link
              to="/signin"
              className="inline-block w-full py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
            >
              Return to Sign In
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
