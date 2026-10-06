import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  FileText, Copy, Download, GitPullRequest, RefreshCw, Check, Code,
  Eye, Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function ReadMeTab() {
  const { selectedRepo } = useStore();

  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState('code');
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [committing, setCommitting] = useState(false);

  const [sections, setSections] = useState({
    Badges: true,
    Installation: true,
    Usage: true,
    FolderStructure: true,
    Contributing: true,
    License: true,
    Screenshots: false
  });

  const [markdownContent, setMarkdownContent] = useState('');

  const handleGenerate = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setGenerating(true);
      const selectedSectionsList = Object.keys(sections).filter(k => sections[k]);

      const res = await API.post('/readme/generate', {
        repoId,
        repoName: selectedRepo?.name || 'repo',
        tone,
        sections: selectedSectionsList,
        language,
        customInstruction
      });

      if (res.data?.data?.content) {
        setMarkdownContent(res.data.data.content);
        toast.success('README generated successfully!');
      }
    } catch (err) {
      toast.error('Failed to generate README');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!markdownContent) return;
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    toast.success('Markdown copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!markdownContent) return;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded README.md');
  };

  const handleCommitPR = async () => {
    const repoName = selectedRepo?.name;
    if (!repoName) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setCommitting(true);
      const res = await API.post('/readme/commit-pr', {
        repoName,
        content: markdownContent
      });
      toast.success(res.data?.data?.message || 'PR created successfully!');
      setPrModalOpen(false);
    } catch (err) {
      toast.error('Failed to commit PR');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-8 text-[#1F2A37]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#1F2A37]">ReadMe Generator & Editor</h1>
            <span className="px-3 py-1 rounded-2xl bg-[#EFF6FF] text-[#2F6FDE] font-mono text-xs font-bold border border-[#2F6FDE]/20">
              CORE FEATURE
            </span>
          </div>
          <p className="text-xs text-[#5B6778]">Target Repo: <span className="text-[#1F2A37] font-mono">{selectedRepo?.fullName || 'No repository selected'}</span></p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            disabled={!markdownContent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] disabled:opacity-50 text-[#1F2A37] text-xs font-semibold border border-[#D3D9E2] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2E8B57]" /> : <Copy className="w-3.5 h-3.5" />} Copy Code
          </button>
          <button
            onClick={handleDownload}
            disabled={!markdownContent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] disabled:opacity-50 text-[#1F2A37] text-xs font-semibold border border-[#D3D9E2] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download .md
          </button>
          <button
            onClick={() => setPrModalOpen(true)}
            disabled={!markdownContent || !selectedRepo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] disabled:opacity-50 text-[#F7F8FA] text-xs font-semibold shadow-sm cursor-pointer"
          >
            <GitPullRequest className="w-3.5 h-3.5" /> Commit to Repo as PR
          </button>
        </div>
      </div>

      {/* Generator Configuration Options */}
      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tone */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Writing Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            >
              <option value="Professional">Professional Maintainer</option>
              <option value="Beginner-friendly">Beginner-Friendly</option>
              <option value="Minimal">Minimal & Concise</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Output Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
            </select>
          </div>

          {/* Custom Instruction */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Custom LLM Instructions</label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. Include docker run commands, emphasize security..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Sections Checklist */}
        <div className="space-y-2 pt-2 border-t border-[#D3D9E2]">
          <label className="block text-xs font-semibold text-[#1F2A37]">Included Markdown Sections</label>
          <div className="flex flex-wrap gap-3">
            {Object.keys(sections).map((sec) => (
              <label key={sec} className="flex items-center gap-2 cursor-pointer text-xs text-[#1F2A37]">
                <input
                  type="checkbox"
                  checked={sections[sec]}
                  onChange={() => setSections({ ...sections, [sec]: !sections[sec] })}
                  className="rounded bg-[#FAFBFC] border-[#D3D9E2] text-[#2F6FDE] focus:ring-0"
                />
                <span>{sec}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating README Markdown...' : 'Generate README with AI'}
        </button>
      </div>

      {!markdownContent ? (
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4 shadow-sm">
          <FileText className="w-12 h-12 text-[#5B6778] mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2A37]">No README generated yet</h3>
          <p className="text-xs text-[#5B6778] max-w-md mx-auto">
            Select your target repository and click "Generate README with AI" to generate professional markdown documentation.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            Generate README with AI
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Toggle View Buttons */}
          <div className="md:hidden flex rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] p-1">
            <button
              onClick={() => setActiveMobileView('code')}
              className={`flex-1 py-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 ${
                activeMobileView === 'code' ? 'bg-[#2F6FDE] text-[#F7F8FA]' : 'text-[#5B6778]'
              }`}
            >
              <Code className="w-4 h-4" /> Markdown Code
            </button>
            <button
              onClick={() => setActiveMobileView('preview')}
              className={`flex-1 py-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 ${
                activeMobileView === 'preview' ? 'bg-[#2F6FDE] text-[#F7F8FA]' : 'text-[#5B6778]'
              }`}
            >
              <Eye className="w-4 h-4" /> Live GitHub Preview
            </button>
          </div>

          {/* SPLIT VIEW (LEFT Code Editor, RIGHT GitHub Preview) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px]">
            
            {/* LEFT: Raw Markdown Editor */}
            <div className={`p-4 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] flex flex-col space-y-3 ${
              activeMobileView === 'preview' ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
                <span className="text-xs font-mono font-bold text-[#1F2A37] flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#2F6FDE]" /> Raw Markdown Editor
                </span>
                <span className="text-[10px] text-[#5B6778] font-mono">{markdownContent.length} chars</span>
              </div>
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="flex-1 w-full p-4 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] font-mono text-xs text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE] leading-relaxed resize-none"
              />
            </div>

            {/* RIGHT: Live GitHub Preview */}
            <div className={`p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] flex flex-col space-y-4 overflow-y-auto max-h-[700px] ${
              activeMobileView === 'code' ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
                <span className="text-xs font-mono font-bold text-[#1F2A37] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#2E8B57]" /> Live GitHub Preview (Rendered)
                </span>
                <span className="px-2 py-0.5 rounded-2xl bg-[#F0FDF4] text-[#2E8B57] text-[10px] font-mono font-bold">
                  GitHub Markdown Format
                </span>
              </div>

              <div className="prose max-w-none text-xs leading-relaxed font-sans space-y-4 text-[#1F2A37]">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PR COMMIT MODAL */}
      {prModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F2A37]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl p-6 space-y-6 shadow-xl text-[#1F2A37]">
            <h3 className="font-bold text-lg text-[#1F2A37]">Commit README as Pull Request</h3>
            <p className="text-xs text-[#5B6778] leading-relaxed">
              This action will create a new git branch <code className="text-[#2F6FDE]">reposense/update-readme</code> and open a Pull Request on <span className="text-[#1F2A37] font-mono">{selectedRepo?.fullName || 'selected repository'}</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPrModalOpen(false)} className="px-4 py-2 rounded-2xl bg-[#E8ECF1] text-xs text-[#1F2A37] font-medium">Cancel</button>
              <button
                onClick={handleCommitPR}
                disabled={committing}
                className="px-5 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] text-xs font-semibold cursor-pointer shadow-sm"
              >
                {committing ? 'Opening PR...' : 'Create PR Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
