import React, { useState, useEffect } from 'react';
import {
  GitPullRequest, CheckCircle2, RefreshCw
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function ReviewTab() {
  const { selectedRepo } = useStore();

  const [depth, setDepth] = useState('Detailed');
  const [styleGuide, setStyleGuide] = useState('Default');
  const [reviewing, setReviewing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [reviewReport, setReviewReport] = useState(null);
  const [openPRs, setOpenPRs] = useState([]);
  const [selectedPrNumber, setSelectedPrNumber] = useState(1);

  useEffect(() => {
    if (selectedRepo) {
      fetchPRs();
    } else {
      setOpenPRs([]);
    }
  }, [selectedRepo]);

  const fetchPRs = async () => {
    try {
      const repoId = selectedRepo?.id || selectedRepo?._id;
      if (!repoId) return;
      const res = await API.get('/review/prs', { params: { repoId } });
      const list = res.data?.data || [];
      setOpenPRs(list);
      if (list.length > 0) {
        setSelectedPrNumber(list[0].prNumber || list[0].number || 1);
      }
    } catch (err) {}
  };

  const handleRunReview = async () => {
    if (!selectedRepo) {
      toast.error('Please select a repository first.');
      return;
    }
    try {
      setReviewing(true);
      const res = await API.post('/review', {
        repoId: selectedRepo?.id || selectedRepo?._id,
        prNumber: selectedPrNumber,
        depth,
        styleGuide
      });
      setReviewReport(res.data?.data);
      toast.success('PR Code Review completed!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to complete review');
    } finally {
      setReviewing(false);
    }
  };

  const handlePostComments = async () => {
    if (!reviewReport?._id) return;
    try {
      setPosting(true);
      await API.post(`/review/${reviewReport._id}/post-comments`);
      toast.success('Comments posted directly to GitHub PR!');
    } catch (err) {
      toast.error('Failed to post comments');
    } finally {
      setPosting(false);
    }
  };

  if (!selectedRepo) {
    return (
      <div className="space-y-8 text-[#1F2A37]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">Automated Code Review Hub</h1>
          <p className="text-xs text-[#5B6778]">Context-aware line-by-line pull request code review with automated quality scoring.</p>
        </div>
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#2F6FDE]/20 flex items-center justify-center mx-auto text-[#2F6FDE]">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1F2A37]">No repository selected</h3>
            <p className="text-xs text-[#5B6778] max-w-md mx-auto">
              Select or connect a GitHub repository to review pull request diffs and security checks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#1F2A37]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Automated Code Review Hub</h1>
        <p className="text-xs text-[#5B6778]">Context-aware line-by-line pull request code review with automated quality scoring for <strong className="text-[#2F6FDE] font-mono">{selectedRepo.fullName}</strong>.</p>
      </div>

      {/* PR Selection & Configuration */}
      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PR Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">PR Number</label>
            <input
              type="number"
              value={selectedPrNumber}
              onChange={(e) => setSelectedPrNumber(Number(e.target.value))}
              placeholder="e.g. 1"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            />
          </div>

          {/* Review Depth */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Review Depth</label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            >
              <option value="Quick">Quick Check (Style & Logic)</option>
              <option value="Detailed">Detailed Deep Analysis</option>
            </select>
          </div>

          {/* Style Guide */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Style Guide</label>
            <select
              value={styleGuide}
              onChange={(e) => setStyleGuide(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            >
              <option value="Default">Default RepoSense Standard</option>
              <option value="Custom Rules">Custom ESLint Rules</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRunReview}
          disabled={reviewing}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          {reviewing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitPullRequest className="w-4 h-4" />}
          {reviewing ? 'Analyzing Pull Request Diffs...' : 'Run Automated PR Review'}
        </button>
      </div>

      {/* Review Output */}
      {reviewReport ? (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#D3D9E2] pb-4 gap-4">
            <div>
              <span className="text-xs font-mono text-[#2F6FDE]">PR #{reviewReport.prNumber}</span>
              <h2 className="text-xl font-bold text-[#1F2A37]">{reviewReport.prTitle}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-2xl bg-[#F0FDF4] border border-[#2E8B57]/20 text-[#2E8B57] font-mono text-sm font-bold">
                Quality Score: {reviewReport.qualityScore}/100
              </span>
              <button
                onClick={handlePostComments}
                disabled={posting}
                className="px-4 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] text-xs font-semibold shadow-sm cursor-pointer"
              >
                {posting ? 'Posting...' : 'Post Comments to GitHub'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#2E8B57]/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2E8B57] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> VERDICT: SAFE TO MERGE
            </span>
            <span className="text-xs text-[#5B6778]">
              Summary: {reviewReport.summary?.criticalCount || 0} Critical, {reviewReport.summary?.minorCount || 0} Minor
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Line-by-Line Code Feedback</h3>
            
            {reviewReport.suggestions?.map((s, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#2F6FDE] font-semibold">{s.file}: Line {s.line}</span>
                  <span className={`px-2.5 py-0.5 rounded-2xl text-[10px] font-mono font-bold uppercase ${
                    s.type === 'critical' ? 'bg-[#FEF2F2] text-[#C93C3C] border border-[#C93C3C]/20' :
                    s.type === 'minor' ? 'bg-[#FEFCE8] text-[#B7791F] border border-[#B7791F]/20' :
                    'bg-[#EFF6FF] text-[#2F6FDE] border border-[#2F6FDE]/20'
                  }`}>
                    {s.type}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#1F2A37]">{s.title}</p>
                <p className="text-xs text-[#5B6778]">{s.explanation}</p>

                {s.codeSnippet && (
                  <pre className="p-3 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] font-mono text-xs text-[#1F2A37] overflow-x-auto">
                    <code>{s.codeSnippet}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-2">
          <p className="text-xs text-[#5B6778]">No review report generated yet for this pull request. Click "Run Automated PR Review" above.</p>
        </div>
      )}
    </div>
  );
}
