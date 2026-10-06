import React, { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileText, GitPullRequest, BookOpen, UserPlus,
  ShieldAlert, Activity, Mail, Wrench, MessageSquare,
  Bell, ChevronDown, Menu, X, Plus, ExternalLink
} from 'lucide-react';
import { GithubIcon as Github } from '../components/GithubIcon';
import GithubConnectModal from '../components/GithubConnectModal';
import GithubConnectButton from '../components/GithubConnectButton';
import ProfileAvatarMenu from '../components/ProfileAvatarMenu';
import Logo from '../components/Logo';
import Avatar from '../components/ui/Avatar';
import NotificationPanel from '../components/NotificationPanel';
import DelayedSkeleton from '../components/DelayedSkeleton';
import { useStore } from '../store/useStore';
import { prefetchRoute, prefetchAppRoutesIdle } from '../utils/prefetch';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const { user, repos, selectedRepo, setSelectedRepo, fetchRepos } = useStore();
  const location = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [githubConnectModalOpen, setGithubConnectModalOpen] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [connecting, setConnecting] = useState(false);

  const { connectRepoUrl } = useStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__appLayoutMountCount = (window.__appLayoutMountCount || 0) + 1;
    }
    fetchRepos();
    prefetchAppRoutesIdle();
  }, []);

  const tabs = [
    { id: 'dashboard', path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', path: '/app/scan', label: 'Scan', icon: Search },
    { id: 'readme', path: '/app/readme', label: 'ReadMe', icon: FileText, badge: 'Core' },
    { id: 'review', path: '/app/review', label: 'Review', icon: GitPullRequest },
    { id: 'docs', path: '/app/docs', label: 'Docs', icon: BookOpen },
    { id: 'onboard', path: '/app/onboard', label: 'Onboard', icon: UserPlus },
    { id: 'issues', path: '/app/issues', label: 'Issues', icon: ShieldAlert },
    { id: 'health', path: '/app/health', label: 'Health', icon: Activity },
    { id: 'digest', path: '/app/digest', label: 'Digest', icon: Mail },
    { id: 'fix', path: '/app/fix', label: 'Fix', icon: Wrench },
    { id: 'chat', path: '/app/chat', label: 'Chat', icon: MessageSquare, badge: 'AI' }
  ];

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!newRepoUrl) return;
    try {
      setConnecting(true);
      await connectRepoUrl(newRepoUrl);
      toast.success('Repository connected!');
      setConnectModalOpen(false);
      setNewRepoUrl('');
    } catch (err) {
    } finally {
      setConnecting(false);
    }
  };

  const isChatRoute = location.pathname.startsWith('/app/chat');
  const githubProfileUrl = user?.githubUsername
    ? `https://github.com/${user.githubUsername}`
    : 'https://github.com';
  const githubTooltip = user?.githubUsername
    ? `Open github.com/${user.githubUsername}`
    : 'Opens GitHub';

  return (
    <div className="h-[100dvh] w-full bg-[#EEF1F5] text-[#1F2A37] flex flex-col md:flex-row overflow-hidden">

      {/* DESKTOP SIDEBAR (11 Tabs) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#F7F8FA] border-r border-[#D3D9E2] h-full shrink-0 z-30 overflow-hidden">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-[#D3D9E2] flex items-center justify-between">
          <Link to="/" aria-label="RepoSense Home" onMouseEnter={() => prefetchRoute('/')}>
            <Logo variant="full" size={26} />
          </Link>
        </div>

        {/* 11 Tabs Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((t) => {
            const isActive = location.pathname === t.path || location.pathname.startsWith(t.path + '/');
            const Icon = t.icon;
            return (
              <Link
                key={t.id}
                to={t.path}
                onMouseEnter={() => prefetchRoute(t.path)}
                onFocus={() => prefetchRoute(t.path)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2F6FDE] text-[#FAFBFC] shadow-xs'
                    : 'text-[#5B6778] hover:text-[#1F2A37] hover:bg-[#E8ECF1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAFBFC]' : 'text-[#5B6778]'}`} />
                  <span>{t.label}</span>
                </div>
                {t.badge && (
                  <span className={`px-2 py-0.5 rounded-2xl text-[10px] font-mono font-bold ${
                    isActive ? 'bg-[#FAFBFC]/20 text-[#FAFBFC]' : 'bg-[#2F6FDE]/10 text-[#2F6FDE] border border-[#2F6FDE]/20'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Static Sidebar User Card (Requirement N1: Display-only, no click, no cursor pointer, no popup) */}
        <div className="p-3 border-t border-[#D3D9E2] bg-[#F7F8FA]">
          <div className="p-3 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] flex items-center gap-2.5 min-w-0 cursor-default select-none shadow-xs">
            <Avatar user={user} size={36} />
            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] font-semibold text-[#1F2A37] truncate"
                title={user?.fullName || user?.githubUsername || 'Developer'}
              >
                {user?.fullName || user?.githubUsername || 'Developer'}
              </p>
              <p className="text-[12px] text-[#5B6778]">Developer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
        
        {/* TOP BAR HEADER (Addenda O & P: Bell | GitHub Button | Go to GitHub | Profile Avatar Menu) */}
        <header className="h-16 shrink-0 bg-[#F7F8FA] border-b border-[#D3D9E2] px-4 sm:px-6 flex items-center justify-between gap-4 z-20">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile drawer toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-2xl text-[#5B6778] hover:text-[#1F2A37] hover:bg-[#E8ECF1] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Repo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs font-semibold text-[#1F2A37] hover:border-[#2F6FDE] transition-colors cursor-pointer"
              >
                <Github className="w-4 h-4 text-[#2F6FDE]" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedRepo?.fullName || selectedRepo?.name || 'Select Repo'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5B6778]" />
              </button>

              {/* Repo Dropdown Modal */}
              {repoDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-mono text-[#5B6778] uppercase tracking-wider font-bold">Connected Repositories</div>
                  {repos.map((r) => (
                    <button
                      key={r.id || r._id}
                      onClick={() => { setSelectedRepo(r); setRepoDropdownOpen(false); }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-[#E8ECF1] flex items-center justify-between cursor-pointer ${
                        selectedRepo?.id === r.id ? 'text-[#2F6FDE] font-bold bg-[#E8ECF1]' : 'text-[#1F2A37]'
                      }`}
                    >
                      <span className="truncate">{r.fullName || r.name}</span>
                      <span className="font-mono text-[10px] text-[#5B6778]">Score {r.healthScore || '-'}</span>
                    </button>
                  ))}
                  <div className="border-t border-[#D3D9E2] mt-1 pt-1 px-2">
                    <button
                      onClick={() => { setRepoDropdownOpen(false); setConnectModalOpen(true); }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-2xl bg-[#2F6FDE]/10 text-[#2F6FDE] hover:bg-[#2F6FDE]/20 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Connect New Repo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Global Header Actions: Bell | GitHub Button | Go to GitHub | Avatar Menu */}
          <div className="flex items-center gap-3">
            {/* 1. Notification Bell */}
            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="p-2.5 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#5B6778] hover:text-[#1F2A37] relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2F6FDE] animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2F6FDE]" />
              </button>

              <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            {/* 2. GitHub Connection Button (Requirement O2) */}
            <GithubConnectButton
              onOpenModal={() => setGithubConnectModalOpen(true)}
            />

            {/* 3. "Go to GitHub" External Link Button (Requirement P2) */}
            <a
              href={githubProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={githubTooltip}
              aria-label="Open your GitHub profile in a new tab"
              onClick={() => {
                setNotificationsOpen(false);
                setProfileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs font-semibold text-[#1F2A37] hover:bg-[#FAFBFC] hover:border-[#2F6FDE] transition-colors cursor-pointer"
            >
              <span>Go to GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5B6778]" style={{ strokeWidth: 1.5 }} />
            </a>

            {/* 4. Profile Avatar Button & Menu (Requirement O3) */}
            <ProfileAvatarMenu
              isOpen={profileMenuOpen}
              onToggle={() => {
                setNotificationsOpen(false);
                setProfileMenuOpen(!profileMenuOpen);
              }}
              onClose={() => setProfileMenuOpen(false)}
            />
          </div>
        </header>

        {/* MAIN ROUTE CONTENT AREA WITH INTERNAL SUSPENSE */}
        <main className={`flex-1 min-h-0 min-w-0 ${isChatRoute ? 'overflow-hidden p-4 sm:p-6' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'}`}>
          <Suspense fallback={<DelayedSkeleton />}>
            <Outlet />
          </Suspense>
        </main>

      </div>

      {/* MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-xs flex lg:hidden">
          <div className="w-64 bg-[#FAFBFC] border-r border-[#D3D9E2] h-full flex flex-col p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
              <Logo variant="full" size={24} />
              <button onClick={() => setMobileDrawerOpen(false)} className="p-1 rounded-xl text-[#5B6778]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {tabs.map((t) => {
                const isActive = location.pathname === t.path;
                const Icon = t.icon;
                return (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold ${
                      isActive ? 'bg-[#2F6FDE] text-[#FAFBFC]' : 'text-[#5B6778]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* CONNECT REPO MODAL */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="font-bold text-base text-[#1F2A37]">Connect GitHub Repository</h3>
            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none focus:border-[#2F6FDE]"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-[#E8ECF1] text-xs text-[#1F2A37] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-5 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#FAFBFC] text-xs font-semibold shadow-xs"
                >
                  {connecting ? 'Connecting...' : 'Connect Repo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GITHUB PAT CONNECT MODAL */}
      <GithubConnectModal
        isOpen={githubConnectModalOpen}
        onClose={() => setGithubConnectModalOpen(false)}
      />
    </div>
  );
}
