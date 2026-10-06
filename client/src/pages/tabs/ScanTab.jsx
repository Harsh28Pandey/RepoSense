import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Play, CheckCircle2, AlertTriangle, FileText,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function ScanTab() {
  const { repos, selectedRepo, setSelectedRepo } = useStore();
  const navigate = useNavigate();

  const [inputUrl, setInputUrl] = useState(selectedRepo?.url || '');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState('');
  const [autoRescan, setAutoRescan] = useState(true);
  const [scanReport, setScanReport] = useState(null);

  const [focusToggles, setFocusToggles] = useState({
    readme: true,
    docs: true,
    onboarding: true,
    issues: true,
    health: true,
    activity: true
  });

  const handleRunScan = async () => {
    if (!inputUrl && !selectedRepo) {
      toast.error('Please enter a repo URL or select a connected repo.');
      return;
    }

    try {
      setIsScanning(true);
      setProgress(10);
      setStepMessage('Connecting to repository & fetching file tree...');
      setScanReport(null);

      const repoId = selectedRepo?.id || selectedRepo?._id;
      if (!repoId) {
        toast.error('Please select a connected repository.');
        setIsScanning(false);
        return;
      }

      const res = await API.post('/scans', { repoId, focusOptions: focusToggles });
      const scanObj = res.data?.data;

      const eventSource = new EventSource(`/api/v1/scans/${scanObj._id || scanObj.id}/stream`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress) setProgress(data.progress);
        if (data.step) setStepMessage(data.step);
        if (data.report) {
          setScanReport(data.report);
          setIsScanning(false);
          eventSource.close();
          toast.success('Deep scan completed!');
        }
      };

      eventSource.onerror = () => {
        setIsScanning(false);
        eventSource.close();
        toast.error('Scan stream interrupted.');
      };

    } catch (err) {
      setIsScanning(false);
      toast.error(err.response?.data?.error?.message || 'Failed to start scan.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Repo Deep Scan</h1>
        <p className="text-xs text-[#5B6778]">Run automated multidimensional evaluation across documentation, PRs, issues, and activity.</p>
      </div>

      {/* Configuration Card */}
      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Repo Source */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#1F2A37]">Repo Source</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste GitHub URL or select below"
                className="flex-1 px-4 py-3 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none focus:border-[#2F6FDE]"
              />
              <select
                onChange={(e) => {
                  const r = repos.find(item => (item.id || item._id) === e.target.value);
                  if (r) { setSelectedRepo(r); setInputUrl(r.url); }
                }}
                className="px-3 py-3 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
              >
                <option value="">Choose Connected Repo</option>
                {repos.map(r => (
                  <option key={r.id || r._id} value={r.id || r._id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto Re-scan Toggle */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#1F2A37]">Automated Webhook Triggers</label>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2]">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#1F2A37]">Auto Re-scan on GitHub Commit</span>
                <p className="text-[10px] text-[#5B6778]">Trigger scan on push & pull_request webhooks</p>
              </div>
              <button
                onClick={() => setAutoRescan(!autoRescan)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                  autoRescan ? 'bg-[#2F6FDE]' : 'bg-[#D3D9E2]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#FAFBFC] transition-transform ${
                  autoRescan ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Scan Focus Toggles */}
        <div className="space-y-3 pt-2 border-t border-[#D3D9E2]">
          <label className="block text-xs font-semibold text-[#1F2A37]">Scan Focus Areas</label>
          <div className="flex flex-wrap gap-3">
            {Object.keys(focusToggles).map((key) => (
              <button
                key={key}
                onClick={() => setFocusToggles({ ...focusToggles, [key]: !focusToggles[key] })}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all capitalize cursor-pointer ${
                  focusToggles[key]
                    ? 'bg-[#EFF6FF] text-[#2F6FDE] border border-[#2F6FDE]/40'
                    : 'bg-[#FAFBFC] text-[#5B6778] border border-[#D3D9E2]'
                }`}
              >
                {focusToggles[key] ? '✓ ' : ''}{key} Check
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-sm transition-all shadow-sm cursor-pointer"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-[#F7F8FA]" />}
          {isScanning ? 'Scanning Repository...' : 'Run Deep Scan'}
        </button>
      </div>

      {/* SSE Progress State */}
      {isScanning && (
        <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-[#1F2A37] font-semibold flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#2F6FDE] animate-spin" /> {stepMessage}
            </span>
            <span className="text-[#2F6FDE] font-mono font-bold">{progress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#E8ECF1] overflow-hidden">
            <div
              className="h-full bg-[#2F6FDE] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Output Report or Honest Empty State */}
      {scanReport ? (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#D3D9E2] pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1F2A37]">Full Deep Scan Report</h2>
              <p className="text-xs text-[#5B6778]">Target: {selectedRepo?.fullName || inputUrl}</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#F0FDF4] border border-[#2E8B57]/20 text-[#2E8B57] text-sm font-bold font-mono">
              Health Score: {scanReport.healthScore}/100
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* README Status */}
            <div className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3">
              <span className="text-xs text-[#5B6778]">README Status</span>
              {scanReport.readmeStatus === 'MISSING' ? (
                <div className="space-y-3">
                  <p className="text-lg font-extrabold text-[#C93C3C] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> README MISSING
                  </p>
                  <button
                    onClick={() => navigate('/app/readme')}
                    className="w-full py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Generate README Now
                  </button>
                </div>
              ) : (
                <p className="text-lg font-extrabold text-[#2E8B57] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> GOOD
                </p>
              )}
            </div>

            {/* Docs & Onboarding */}
            <div className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-2">
              <span className="text-xs text-[#5B6778]">Docs Completeness</span>
              <p className="text-2xl font-extrabold text-[#B7791F]">{scanReport.docsCompletenessScore}%</p>
              <p className="text-[11px] text-[#5B6778]">Onboarding Readiness: <span className="text-[#1F2A37] font-semibold">{scanReport.onboardingReadiness}</span></p>
            </div>

            {/* Issues & Activity */}
            <div className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-2">
              <span className="text-xs text-[#5B6778]">Activity & Issues</span>
              <p className="text-sm font-semibold text-[#1F2A37]">{scanReport.openIssuesCount || 0} Open Issues | {scanReport.pendingPrsCount || 0} Pending PRs</p>
              <p className="text-[11px] text-[#2F6FDE] font-mono">{scanReport.activityTrend || 'Stable'}</p>
            </div>
          </div>

          {/* AI Plain Language Summary */}
          <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-2">
            <h4 className="text-xs font-bold text-[#2F6FDE] uppercase tracking-wider font-mono">Plain Language AI Executive Summary</h4>
            <p className="text-xs text-[#1F2A37] leading-relaxed">{scanReport.plainSummary}</p>
          </div>
        </div>
      ) : !isScanning && (
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#2F6FDE]/20 flex items-center justify-center mx-auto text-[#2F6FDE]">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1F2A37]">No scans yet</h3>
            <p className="text-xs text-[#5B6778] max-w-md mx-auto">
              Run your first scan to evaluate repository documentation, open issues, and health metrics.
            </p>
          </div>
          <button
            onClick={handleRunScan}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#F7F8FA]" /> Run your first scan
          </button>
        </div>
      )}
    </div>
  );
}
