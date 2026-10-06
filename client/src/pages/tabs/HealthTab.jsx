import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function HealthTab() {
  const { selectedRepo } = useStore();
  const navigate = useNavigate();

  const [weights, setWeights] = useState({
    readmeDocs: 30,
    activity: 30,
    community: 20,
    codeQuality: 20
  });

  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      setHealthData(null);
      return;
    }
    setLoading(true);
    API.get(`/health/${repoId}`)
      .then((res) => {
        setHealthData(res.data?.data || null);
        if (res.data?.data?.weights) {
          setWeights(res.data.data.weights);
        }
      })
      .catch(() => {
        setHealthData(null);
      })
      .finally(() => setLoading(false));
  }, [selectedRepo]);

  const totalWeight = weights.readmeDocs + weights.activity + weights.community + weights.codeQuality;

  const handleUpdateWeights = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      const res = await API.put('/health/weights', {
        repoId,
        weights
      });
      setHealthData(res.data?.data);
      toast.success('Health score weights updated & normalized!');
    } catch (err) {
      toast.error('Failed to update health weights');
    }
  };

  const repoId = selectedRepo?.id || selectedRepo?._id;

  if (!repoId || (!loading && !healthData)) {
    return (
      <div className="space-y-8 text-[#1F2A37]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">Repository Health Score</h1>
          <p className="text-xs text-[#5B6778]">0-100 overall fitness score with customizable weightage sliders and historical trend analytics.</p>
        </div>
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4 shadow-sm">
          <Activity className="w-12 h-12 text-[#5B6778] mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2A37]">No repository health score calculated yet</h3>
          <p className="text-xs text-[#5B6778] max-w-md mx-auto">
            {!repoId ? 'Select or connect a repository to view health score metrics.' : 'Run a scan on this repository to generate health index metrics.'}
          </p>
          <button
            onClick={() => navigate('/app/scan')}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            Run your first scan <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const scoreDisplay = healthData?.healthScore !== undefined && healthData?.healthScore !== null ? healthData.healthScore : '-';

  return (
    <div className="space-y-8 text-[#1F2A37]">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Repository Health Score</h1>
        <p className="text-xs text-[#5B6778]">0-100 overall fitness score with customizable weightage sliders and historical trend analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Gauge & Score Card */}
        <div className="lg:col-span-5 p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <span className="text-xs font-mono uppercase tracking-wider text-[#5B6778]">Current Health Index</span>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#E8ECF1" strokeWidth="10" fill="transparent" />
              <circle
                cx="50" cy="50" r="40" stroke="url(#healthGrad)" strokeWidth="10" fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={scoreDisplay === '-' ? 251.2 : 251.2 - (251.2 * (healthData?.healthScore || 0)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2F6FDE" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-[#1F2A37]">{scoreDisplay}</span>
              <span className="text-[10px] font-mono text-[#5B6778]">OUT OF 100</span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#EFF6FF] border border-[#2F6FDE]/20 text-[#2F6FDE] text-xs font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Status: {healthData?.trend || 'neutral'}
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Historical Health Trend</h3>
          {(!healthData?.trendData || healthData.trendData.length < 2) ? (
            <div className="h-56 w-full flex items-center justify-center text-center p-6 border border-dashed border-[#D3D9E2] rounded-2xl">
              <p className="text-xs text-[#5B6778] font-mono">Not enough history yet. Run another scan to build a trend.</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D3D9E2" />
                  <XAxis dataKey="week" stroke="#5B6778" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#5B6778" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#F7F8FA', borderColor: '#D3D9E2', borderRadius: '16px', color: '#1F2A37' }} />
                  <Line type="monotone" dataKey="score" stroke="#2F6FDE" strokeWidth={3} dot={{ fill: '#2563EB', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Customizable Weight Sliders */}
      <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#1F2A37]">Customize Score Weightage</h3>
            <p className="text-xs text-[#5B6778]">Adjust percentages according to project priorities (Auto-normalized to 100%)</p>
          </div>
          <span className={`px-3 py-1 rounded-2xl text-xs font-mono font-bold ${
            totalWeight === 100 ? 'bg-[#F0FDF4] text-[#2E8B57] border border-[#2E8B57]/20' : 'bg-[#FEFCE8] text-[#B7791F]'
          }`}>
            Total: {totalWeight}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'readmeDocs', label: 'README & Documentation' },
            { key: 'activity', label: 'Commit Activity' },
            { key: 'community', label: 'Community & Issues' },
            { key: 'codeQuality', label: 'Code Quality' }
          ].map(w => (
            <div key={w.key} className="space-y-2 p-4 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2]">
              <div className="flex justify-between text-xs font-medium text-[#1F2A37]">
                <span>{w.label}</span>
                <span className="font-mono text-[#2F6FDE] font-bold">{weights[w.key]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights[w.key]}
                onChange={(e) => setWeights({ ...weights, [w.key]: Number(e.target.value) })}
                className="w-full h-2 rounded-lg bg-[#E8ECF1] accent-[#2F6FDE] cursor-pointer"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleUpdateWeights}
          className="w-full py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs shadow-sm cursor-pointer"
        >
          Save & Re-calculate Health Score
        </button>
      </div>

      {/* Actionable Recommendations */}
      {healthData?.recommendations && healthData.recommendations.length > 0 && (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Actionable Recommendations</h3>
          <div className="space-y-3">
            {healthData.recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] flex items-center justify-between gap-4">
                <span className="text-xs text-[#1F2A37]">{rec}</span>
                <button
                  onClick={() => navigate('/app/readme')}
                  className="px-3.5 py-1.5 rounded-2xl bg-[#EFF6FF] text-[#2F6FDE] hover:bg-[#2F6FDE]/10 text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Resolve Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
