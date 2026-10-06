import React, { useState } from 'react';
import { BookOpen, RefreshCw, GitPullRequest } from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function DocsTab() {
  const { selectedRepo } = useStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [creatingPr, setCreatingPr] = useState(false);
  const [docsReport, setDocsReport] = useState(null);

  const handleAnalyzeDocs = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setAnalyzing(true);
      const res = await API.post('/docs/analyze', { repoId });
      setDocsReport(res.data?.data || null);
      toast.success('Documentation analysis complete!');
    } catch (err) {
      toast.error('Failed to analyze documentation');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateDocsPR = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setCreatingPr(true);
      const res = await API.post('/docs/create-pr', { repoId });
      toast.success(res.data?.data?.message || 'Docs update PR opened!');
    } catch (err) {
      toast.error('Failed to create PR');
    } finally {
      setCreatingPr(false);
    }
  };

  return (
    <div className="space-y-8 text-[#1F2A37]">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Documentation Manager</h1>
        <p className="text-xs text-[#5B6778]">Keep API references, CHANGELOGs, and wiki pages updated automatically as codebase evolves.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-4 shadow-sm">
        <button
          onClick={handleAnalyzeDocs}
          disabled={analyzing}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          {analyzing ? 'Analyzing Repository Documentation...' : 'Analyze Repository Documentation'}
        </button>
      </div>

      {!docsReport ? (
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4 shadow-sm">
          <BookOpen className="w-12 h-12 text-[#5B6778] mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2A37]">No documentation report generated yet</h3>
          <p className="text-xs text-[#5B6778] max-w-md mx-auto">
            Click "Analyze Repository Documentation" to scan your repository for missing API references, CHANGELOG entries, and docstrings.
          </p>
          <button
            onClick={handleAnalyzeDocs}
            disabled={analyzing}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            Analyze Repository Documentation
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-4">
            <h2 className="text-xl font-bold text-[#1F2A37]">Documentation Audit Summary</h2>
            <span className="px-3 py-1.5 rounded-2xl bg-[#FEFCE8] border border-[#B7791F]/20 text-[#B7791F] font-mono text-xs font-bold">
              Completeness Score: {docsReport.completenessScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Undocumented Functions & Routes */}
            <div className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3">
              <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Undocumented Code Items ({docsReport.missingDocs?.length || 0})</h3>
              <div className="space-y-2">
                {docsReport.missingDocs?.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] space-y-1 text-xs">
                    <p className="font-semibold text-[#2F6FDE]">{item.name}</p>
                    <p className="text-[11px] text-[#5B6778] font-mono">{item.path}</p>
                    <p className="text-[11px] text-[#5B6778]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-Drafted Doc Updates & CHANGELOG */}
            <div className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-4">
              <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Auto-Drafted Documentation Updates</h3>
              
              {docsReport.draftUpdates?.map((draft, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#1F2A37]">{draft.title}</span>
                    <span className="text-[10px] font-mono text-[#2F6FDE]">{draft.target}</span>
                  </div>
                  <pre className="p-3 rounded-2xl bg-[#FAFBFC] font-mono text-[11px] text-[#1F2A37] overflow-x-auto">
                    <code>{draft.content}</code>
                  </pre>
                </div>
              ))}

              <button
                onClick={handleCreateDocsPR}
                disabled={creatingPr}
                className="w-full py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] text-xs font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <GitPullRequest className="w-4 h-4" /> {creatingPr ? 'Creating PR...' : 'Create Documentation Update PR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
