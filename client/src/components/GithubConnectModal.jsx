import React, { useState } from 'react';
import { X, ShieldCheck, Key, LogOut, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { GithubIcon as Github } from './GithubIcon';
import { useStore } from '../store/useStore';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function GithubConnectModal({ isOpen, onClose }) {
  const { user, fetchUser } = useStore();
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isConnected = !!user?.githubConnected;

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      toast.error('Please enter a valid GitHub token.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await API.post('/github/token', { token: tokenInput.trim(), tokenType: 'pat' });
      if (res.data?.success) {
        toast.success(`Connected to GitHub as @${res.data.data.githubUsername}`);
        setTokenInput('');
        await fetchUser();
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to connect GitHub token.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await API.delete('/github/token');
      toast.success('GitHub account disconnected.');
      await fetchUser();
      onClose();
    } catch (err) {
      toast.error('Failed to disconnect GitHub account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl p-6 space-y-6 shadow-xl relative text-[#1F2A37]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8ECF1] border border-[#D3D9E2] flex items-center justify-center text-[#2F6FDE]">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F2A37]">GitHub Connection</h3>
              <p className="text-[11px] text-[#5B6778]">OAuth & Personal Access Tokens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5B6778] hover:text-[#1F2A37] hover:bg-[#E8ECF1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status */}
        {isConnected ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#2E8B57]/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2E8B57] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#2E8B57]">GitHub Account Connected</p>
                <p className="text-[11px] text-[#1F2A37] font-mono mt-0.5">
                  Account: @{user?.githubUsername || user?.username}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5B6778] leading-relaxed">
              Your connected GitHub access token grants access to private repositories, automated README PR creation, line-by-line review comments, and issue triaging.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#D3D9E2]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-xs text-[#1F2A37] font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#C93C3C]/30 text-xs font-semibold text-[#C93C3C] cursor-pointer transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                {loading ? 'Disconnecting...' : 'Disconnect GitHub'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#2F6FDE]/30 text-xs text-[#2F6FDE] leading-relaxed space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-[#1F2A37]">
                <ShieldCheck className="w-4 h-4 text-[#2F6FDE]" /> Security Requirement
              </p>
              <p className="text-[11px] text-[#5B6778]">
                Connected GitHub login must match your signup username (<strong className="text-[#2F6FDE] font-mono">@{user?.githubUsername || user?.username}</strong>). Tokens are AES-256-GCM encrypted.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#C93C3C]/30 text-xs text-[#C93C3C] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#C93C3C] shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#1F2A37] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#2F6FDE]" /> Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#2F6FDE] hover:underline flex items-center gap-1 font-mono"
                >
                  Generate Token <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_1234567890abcdef..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#1F2A37] text-xs font-mono focus:outline-none focus:border-[#2F6FDE]"
              />
              <p className="text-[10px] text-[#5B6778] mt-1.5 font-mono">Required Scopes: <span className="text-[#2F6FDE]">repo, read:user</span></p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#D3D9E2]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-xs text-[#1F2A37] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] text-xs font-semibold shadow-sm cursor-pointer transition-all"
              >
                {loading ? 'Verifying & Connecting...' : 'Connect GitHub'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
