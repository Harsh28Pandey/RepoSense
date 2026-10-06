import React, { useState } from 'react';
import { Wrench, RefreshCw, GitPullRequest } from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function FixTab() {
  const { selectedRepo } = useStore();

  const [detecting, setDetecting] = useState(false);
  const [creatingPr, setCreatingPr] = useState(false);
  const [fixReport, setFixReport] = useState(null);

  const handleDetectFixes = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setDetecting(true);
      const res = await API.post('/fix/detect', {
        repoId
      });
      setFixReport(res.data?.data || null);
      toast.success('Auto-fixable issues detected!');
    } catch (err) {
      toast.error('Failed to detect code issues');
    } finally {
      setDetecting(false);
    }
  };

  const handleCreateFixPR = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setCreatingPr(true);
      const selected = fixReport?.fixes?.filter(f => f.selected).map(f => f.id);
      const res = await API.post('/fix/create-pr', {
        repoId,
        selectedFixIds: selected
      });
      toast.success(res.data?.data?.message || 'Fix PR created successfully!');
    } catch (err) {
      toast.error('Failed to create fix PR');
    } finally {
      setCreatingPr(false);
    }
  };

  const toggleFixSelection = (id) => {
    if (!fixReport) return;
    const updated = fixReport.fixes.map(f => f.id === id ? { ...f, selected: !f.selected } : f);
    setFixReport({ ...fixReport, fixes: updated });
  };

  return (
    <div className="space-y-8 text-[#1F2A37]">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Auto-Fix Center</h1>
        <p className="text-xs text-[#5B6778]">Scan and automatically resolve small issues like formatting, unused imports, and simple linting errors.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-4 shadow-sm">
        <button
          onClick={handleDetectFixes}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          {detecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
          {detecting ? 'Detecting Auto-Fixable Code Issues...' : 'Detect Auto-Fixable Code Issues'}
        </button>
      </div>

      {!fixReport ? (
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4 shadow-sm">
          <Wrench className="w-12 h-12 text-[#5B6778] mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2A37]">No auto-fix scan run yet</h3>
          <p className="text-xs text-[#5B6778] max-w-md mx-auto">
            Click "Detect Auto-Fixable Code Issues" to analyze your repository for lint errors and unused imports.
          </p>
          <button
            onClick={handleDetectFixes}
            disabled={detecting}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            Detect Auto-Fixable Code Issues
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#D3D9E2] pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1F2A37]">Auto-Fixable Issues Found ({fixReport.fixes?.length || 0})</h2>
              <p className="text-xs text-[#5B6778]">Select fixes to include in the pull request.</p>
            </div>
            <button
              onClick={handleCreateFixPR}
              disabled={creatingPr}
              className="px-5 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-2"
            >
              <GitPullRequest className="w-4 h-4" /> {creatingPr ? 'Creating PR...' : 'Create Fix PR Now'}
            </button>
          </div>

          <div className="space-y-4">
            {fixReport.fixes?.map((fix) => (
              <div key={fix.id} className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fix.selected}
                      onChange={() => toggleFixSelection(fix.id)}
                      className="rounded bg-[#FAFBFC] border-[#D3D9E2] text-[#2F6FDE] focus:ring-0"
                    />
                    <span className="font-mono text-xs text-[#1F2A37] font-semibold">{fix.filePath}</span>
                  </label>
                  <span className="px-2.5 py-0.5 rounded-2xl bg-[#EFF6FF] text-[#2F6FDE] border border-[#2F6FDE]/20 text-[10px] font-mono font-bold uppercase">
                    {fix.category}
                  </span>
                </div>

                <p className="text-xs text-[#5B6778]">{fix.explanation}</p>

                {/* Diff Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#C93C3C]/20 space-y-1">
                    <span className="text-[10px] text-[#C93C3C] font-bold uppercase block">Before (Original)</span>
                    <pre className="text-[#1F2A37] overflow-x-auto"><code>{fix.before}</code></pre>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#2E8B57]/20 space-y-1">
                    <span className="text-[10px] text-[#2E8B57] font-bold uppercase block">After (Auto-Fixed)</span>
                    <pre className="text-[#1F2A37] overflow-x-auto"><code>{fix.after}</code></pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
