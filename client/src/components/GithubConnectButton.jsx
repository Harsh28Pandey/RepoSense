import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, AlertTriangle, ExternalLink, Shield, Key, Trash2, RefreshCw
} from 'lucide-react';
import { GithubIcon as Github } from './GithubIcon';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function GithubConnectButton({ onOpenModal }) {
  const popoverRef = useRef(null);

  const [statusData, setStatusData] = useState({
    connected: false,
    status: 'disconnected',
    githubUsername: '',
    maskedToken: ''
  });
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await API.get('/github/status');
      if (res.data?.data) {
        setStatusData(res.data.data);
      }
    } catch (err) {
      setStatusData({ connected: false, status: 'disconnected' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setPopoverOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [popoverOpen]);

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect your GitHub account and personal access token?')) return;
    try {
      await API.delete('/github/token');
      setStatusData({ connected: false, status: 'disconnected' });
      setPopoverOpen(false);
      toast.success('GitHub account disconnected');
    } catch (err) {
      toast.error('Failed to disconnect GitHub account');
    }
  };

  if (loading) {
    return (
      <div className="px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs text-[#5B6778] flex items-center gap-2 font-semibold cursor-wait">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> GitHub Status...
      </div>
    );
  }

  if (!statusData.connected) {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs font-semibold text-[#1F2A37] hover:border-[#2F6FDE] hover:bg-[#FAFBFC] transition-colors cursor-pointer"
      >
        <Github className="w-4 h-4 text-[#2F6FDE]" />
        <span>{statusData.status === 'needs_attention' ? 'Reconnect GitHub' : 'Connect GitHub'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        title={`Connected as @${statusData.githubUsername}`}
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F0FDF4] border border-[#2E8B57]/30 text-xs font-semibold text-[#2E8B57] hover:border-[#2E8B57] transition-colors cursor-pointer"
      >
        <Github className="w-4 h-4 text-[#2E8B57]" />
        <span className="w-2 h-2 rounded-full bg-[#2E8B57]" />
        <span>GitHub connected</span>
      </button>

      {/* Connected Status Popover */}
      {popoverOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] shadow-xl p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-[#F0FDF4] border border-[#2E8B57]/20 text-[#2E8B57] font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
            <span className="text-[10px] font-mono text-[#5B6778]">Fine-grained PAT</span>
          </div>

          <div className="space-y-1.5">
            <a
              href={`https://github.com/${statusData.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between font-semibold text-[#1F2A37] hover:text-[#2F6FDE] hover:underline"
            >
              <span>github.com/{statusData.githubUsername}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="p-2 rounded-xl bg-[#E8ECF1] border border-[#D3D9E2] font-mono text-[11px] text-[#5B6778]">
              Token: {statusData.maskedToken || 'github_pat_••••abcd'}
            </div>
          </div>

          <div className="border-t border-[#D3D9E2] pt-2 flex flex-col gap-1.5">
            <button
              onClick={() => { setPopoverOpen(false); onOpenModal(); }}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#2F6FDE] font-semibold transition-colors cursor-pointer text-xs"
            >
              <Key className="w-3.5 h-3.5" /> Replace token
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#C93C3C] font-semibold transition-colors cursor-pointer text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
