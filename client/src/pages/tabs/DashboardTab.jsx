import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, FileText, GitPullRequest, ShieldAlert, Activity,
  Plus, CheckCircle2, AlertTriangle, Clock, FolderPlus
} from 'lucide-react';
import { GithubIcon as Github } from '../../components/GithubIcon';
import Avatar from '../../components/ui/Avatar';
import { useStore } from '../../store/useStore';

export default function DashboardTab() {
  const { user, repos, selectedRepo, setSelectedRepo } = useStore();
  const navigate = useNavigate();

  const missingReadmeCount = repos.filter(r => !r.hasReadme).length;
  const totalIssues = repos.reduce((acc, r) => acc + (r.openIssuesCount || 0), 0);
  const avgHealth = repos.length > 0 ? Math.round(repos.reduce((acc, r) => acc + (r.healthScore || 0), 0) / repos.length) : '-';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <Avatar user={user} size={48} />
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2A37]">
              Welcome back, <span className="text-[#2F6FDE]">{user?.fullName || user?.githubUsername || 'Developer'}</span> 👋
            </h1>
            <p className="text-xs text-[#5B6778]">
              {repos.length > 0 ? (
                <>You have <span className="text-[#1F2A37] font-semibold">{repos.length} repositories</span> connected. Overview & quick actions ready.</>
              ) : (
                <>No repositories connected to your account yet. Connect a repo to get started.</>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10">
          <button
            onClick={() => navigate('/app/scan')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Search className="w-4 h-4" /> Scan New Repo
          </button>
          <button
            onClick={() => navigate('/app/chat')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#1F2A37] font-semibold text-xs border border-[#D3D9E2] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#2F6FDE]" /> Ask RepoSense
          </button>
        </div>
      </div>

      {/* Overview Grid Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-2">
          <div className="flex items-center justify-between text-[#5B6778] text-xs font-medium">
            <span>README Missing</span>
            <FileText className="w-4 h-4 text-[#B7791F]" />
          </div>
          <p className="text-2xl font-extrabold text-[#B7791F]">{repos.length > 0 ? missingReadmeCount : '-'}</p>
          <p className="text-[10px] text-[#5B6778]">Requires README generator</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-2">
          <div className="flex items-center justify-between text-[#5B6778] text-xs font-medium">
            <span>Open Issues</span>
            <ShieldAlert className="w-4 h-4 text-[#C93C3C]" />
          </div>
          <p className="text-2xl font-extrabold text-[#1F2A37]">{repos.length > 0 ? totalIssues : '-'}</p>
          <p className="text-[10px] text-[#5B6778]">Requires triage & auto-labels</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-2">
          <div className="flex items-center justify-between text-[#5B6778] text-xs font-medium">
            <span>Pending PR Reviews</span>
            <GitPullRequest className="w-4 h-4 text-[#2F6FDE]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2F6FDE]">{repos.length > 0 ? 0 : '-'}</p>
          <p className="text-[10px] text-[#5B6778]">Ready for automated review</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-2">
          <div className="flex items-center justify-between text-[#5B6778] text-xs font-medium">
            <span>Average Health</span>
            <Activity className="w-4 h-4 text-[#2E8B57]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2E8B57]">{avgHealth !== '-' ? `${avgHealth}/100` : '-'}</p>
          <p className="text-[10px] text-[#5B6778]">Thriving repository status</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-2 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[#5B6778] text-xs font-medium">
            <span>Last Digest</span>
            <Clock className="w-4 h-4 text-[#2F6FDE]" />
          </div>
          <p className="text-sm font-bold text-[#1F2A37]">{repos.length > 0 ? 'Not sent yet' : '-'}</p>
          <p className="text-[10px] text-[#5B6778]">Weekly email summary</p>
        </div>
      </div>

      {/* Connected Repositories Grid or Honest Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1F2A37]">Connected Repositories</h2>
          {repos.length > 0 && (
            <button onClick={() => navigate('/app/scan')} className="text-xs text-[#2F6FDE] font-semibold hover:underline">
              View All Scans →
            </button>
          )}
        </div>

        {repos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <div
                key={repo.id || repo._id}
                onClick={() => setSelectedRepo(repo)}
                className={`p-6 rounded-2xl bg-[#F7F8FA] border transition-all cursor-pointer space-y-4 ${
                  (selectedRepo?.id || selectedRepo?._id) === (repo.id || repo._id) ? 'border-[#2F6FDE] shadow-md bg-[#EFF6FF]' : 'border-[#D3D9E2] hover:border-[#2F6FDE]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="w-5 h-5 text-[#2F6FDE]" />
                    <span className="font-bold text-sm text-[#1F2A37] truncate">{repo.name}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-2xl text-[10px] font-mono font-bold ${
                    repo.healthScore >= 80 ? 'bg-[#F0FDF4] text-[#2E8B57] border border-[#2E8B57]/20' : 'bg-[#FEFCE8] text-[#B7791F] border border-[#B7791F]/20'
                  }`}>
                    Score {repo.healthScore ? `${repo.healthScore}/100` : '-'}
                  </span>
                </div>

                <p className="text-xs text-[#5B6778] line-clamp-2">{repo.description || 'GitHub repository connected with RepoSense co-pilot.'}</p>

                <div className="flex items-center justify-between pt-2 border-t border-[#D3D9E2] text-xs">
                  <span className="flex items-center gap-1 text-[#5B6778]">
                    README: {repo.hasReadme ? (
                      <span className="text-[#2E8B57] font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> GOOD</span>
                    ) : (
                      <span className="text-[#C93C3C] font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> MISSING</span>
                    )}
                  </span>
                  <span className="text-[#5B6778] font-mono text-[11px]">{repo.openIssuesCount || 0} issues</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#2F6FDE]/20 flex items-center justify-center mx-auto text-[#2F6FDE]">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1F2A37]">No repositories saved yet</h3>
              <p className="text-xs text-[#5B6778] max-w-md mx-auto">
                Connect a public or private GitHub repository to generate documentation, automated reviews, and health metrics.
              </p>
            </div>
            <button
              onClick={() => navigate('/app/scan')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add a repository
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-4">
        <h2 className="text-base font-bold text-[#1F2A37]">Recent Activity Feed</h2>
        <div className="text-xs text-[#5B6778] py-6 text-center border-t border-[#D3D9E2]">
          No recent activity recorded yet. Run your first repository scan to generate activity logs.
        </div>
      </div>
    </div>
  );
}
