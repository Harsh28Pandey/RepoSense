import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Tag } from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function IssuesTab() {
  const { selectedRepo } = useStore();
  const [similarityThreshold, setSimilarityThreshold] = useState(75);
  const [triaging, setTriaging] = useState(false);
  const [applying, setApplying] = useState(false);
  const [triageReport, setTriageReport] = useState(null);

  const handleTriage = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setTriaging(true);
      const res = await API.post('/issues/triage', {
        repoId,
        similarityThreshold
      });
      setTriageReport(res.data?.data || null);
      toast.success('Issues triaged & duplicate scan completed!');
    } catch (err) {
      toast.error('Failed to triage issues');
    } finally {
      setTriaging(false);
    }
  };

  const handleApplyLabels = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setApplying(true);
      await API.post('/issues/apply-labels', {
        repoId
      });
      toast.success('Labels & duplicate links applied to GitHub!');
    } catch (err) {
      toast.error('Failed to apply labels');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8 text-[#1F2A37]">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Issue Triage & Duplicate Management</h1>
        <p className="text-xs text-[#5B6778]">Auto-assign bug/feature labels, sort by priority, and link duplicate issues using vector embeddings.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <label className="font-semibold text-[#1F2A37]">Duplicate Sensitivity Threshold</label>
            <span className="font-mono text-[#2F6FDE] font-bold">{similarityThreshold}% Match</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
            className="w-full h-2 rounded-lg bg-[#E8ECF1] accent-[#2F6FDE] cursor-pointer"
          />
        </div>

        <button
          onClick={handleTriage}
          disabled={triaging}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          {triaging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          {triaging ? 'Running Issue Triage & Vector Matching...' : 'Run Issue Triage & Duplicate Scan'}
        </button>
      </div>

      {!triageReport ? (
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-[#5B6778] mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2A37]">No issues triaged yet</h3>
          <p className="text-xs text-[#5B6778] max-w-md mx-auto">
            Click "Run Issue Triage & Duplicate Scan" to scan repository issues, categorize priority, and detect duplicates.
          </p>
          <button
            onClick={handleTriage}
            disabled={triaging}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            Run Issue Triage & Duplicate Scan
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#D3D9E2] pb-4 gap-4">
            <h2 className="text-xl font-bold text-[#1F2A37]">Triaged Issues ({triageReport.issues?.length || 0})</h2>
            <button
              onClick={handleApplyLabels}
              disabled={applying}
              className="px-4 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Tag className="w-4 h-4" /> {applying ? 'Applying...' : 'Apply Labels & Link Duplicates to GitHub'}
            </button>
          </div>

          <div className="space-y-4">
            {triageReport.issues?.map((issue) => (
              <div
                key={issue.issueNumber}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  issue.isDuplicate ? 'bg-[#FEFCE8] border-[#B7791F]/30' : 'bg-[#FAFBFC] border-[#D3D9E2]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#2F6FDE] text-xs font-bold">#{issue.issueNumber}</span>
                    <h4 className="font-semibold text-sm text-[#1F2A37]">{issue.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-2xl text-[10px] font-mono font-bold uppercase ${
                      issue.priority === 'High' ? 'bg-[#FEF2F2] text-[#C93C3C] border border-[#C93C3C]/20' :
                      issue.priority === 'Medium' ? 'bg-[#FEFCE8] text-[#B7791F] border border-[#B7791F]/20' :
                      'bg-[#EFF6FF] text-[#2F6FDE] border border-[#2F6FDE]/20'
                    }`}>
                      {issue.priority} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded-2xl bg-[#EFF6FF] text-[#2F6FDE] border border-[#2F6FDE]/20 text-[10px] font-mono font-bold uppercase">
                      Suggested: {issue.suggestedLabel}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#5B6778] line-clamp-2">{issue.body}</p>

                {issue.isDuplicate && (
                  <div className="p-3 rounded-2xl bg-[#FEFCE8] border border-[#B7791F]/20 text-[#B7791F] text-xs flex items-center justify-between">
                    <span>⚠️ Potential Duplicate of Issue #{issue.duplicateOf}</span>
                    <span className="font-mono text-[11px] font-bold">{issue.similarityScore}% Vector Match</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
