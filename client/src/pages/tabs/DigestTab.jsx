import React, { useState } from 'react';
import { Mail, Send, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function DigestTab() {
  const { selectedRepo } = useStore();

  const [frequency, setFrequency] = useState('weekly');
  const [delivery, setDelivery] = useState('dashboard');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [digest, setDigest] = useState(null);

  const handleGenerateNow = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setGenerating(true);
      const res = await API.post('/digest/generate', {
        repoId,
        frequency,
        delivery
      });
      setDigest(res.data?.data || null);
      toast.success('Latest digest generated!');
    } catch (err) {
      toast.error('Failed to generate digest');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setSending(true);
      await API.post('/digest/test-email', {});
      toast.success('Test email digest sent successfully!');
    } catch (err) {
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 text-[#1F2A37]">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Non-Technical Activity Digest</h1>
        <p className="text-xs text-[#5B6778]">Automated plain-language summary of commits, PRs, and progress for client stakeholders and project managers.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Digest Frequency</label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    frequency === f ? 'bg-[#2F6FDE] text-[#F7F8FA]' : 'bg-[#FAFBFC] text-[#5B6778] border border-[#D3D9E2]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Delivery Channel</label>
            <div className="flex gap-2">
              {['dashboard', 'email'].map(d => (
                <button
                  key={d}
                  onClick={() => setDelivery(d)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    delivery === d ? 'bg-[#2F6FDE] text-[#F7F8FA]' : 'bg-[#FAFBFC] text-[#5B6778] border border-[#D3D9E2]'
                  }`}
                >
                  {d === 'dashboard' ? 'Dashboard Only' : 'Email & Dashboard'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateNow}
            disabled={generating}
            className="flex-1 py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {generating ? 'Generating Digest...' : 'Generate New Digest Now'}
          </button>
          <button
            onClick={handleSendTestEmail}
            disabled={sending}
            className="px-5 py-3 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#1F2A37] text-xs font-semibold border border-[#D3D9E2] flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>

      {!digest ? (
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4 shadow-sm">
          <Mail className="w-12 h-12 text-[#5B6778] mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2A37]">No digests generated yet</h3>
          <p className="text-xs text-[#5B6778] max-w-md mx-auto">
            Click "Generate New Digest Now" to create a non-technical summary of your repository activity.
          </p>
          <button
            onClick={handleGenerateNow}
            disabled={generating}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            Generate New Digest Now
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1F2A37]">Latest Activity Digest</h2>
              <span className="text-xs text-[#5B6778]">Generated for {selectedRepo?.fullName || 'Selected Repository'}</span>
            </div>
            <span className="px-3 py-1 rounded-2xl bg-[#EFF6FF] text-[#2F6FDE] font-mono text-xs font-semibold uppercase">
              {frequency} Report
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-4">
            <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Plain Language Summary</h3>
            <p className="text-xs text-[#1F2A37] leading-relaxed whitespace-pre-line">{digest.summaryText}</p>

            {digest.highlights && digest.highlights.length > 0 && (
              <div className="pt-3 border-t border-[#D3D9E2] space-y-2">
                <span className="text-xs font-semibold text-[#1F2A37]">Key Highlights</span>
                <ul className="space-y-1.5 text-xs text-[#5B6778]">
                  {digest.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2E8B57] shrink-0" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
