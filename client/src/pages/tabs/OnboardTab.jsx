import React, { useState } from 'react';
import { UserPlus, Download, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

export default function OnboardTab() {
  const { selectedRepo } = useStore();

  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [interestArea, setInterestArea] = useState('Frontend');
  const [generating, setGenerating] = useState(false);
  const [guide, setGuide] = useState(null);

  const handleGenerateOnboard = async () => {
    const repoId = selectedRepo?.id || selectedRepo?._id;
    if (!repoId) {
      toast.error('Please select a repository first');
      return;
    }
    try {
      setGenerating(true);
      const res = await API.post('/onboard/generate', {
        repoId,
        repoName: selectedRepo?.name || 'Selected Repository',
        skillLevel,
        interestArea
      });
      setGuide(res.data?.data || null);
      toast.success('Personalized onboarding guide generated!');
    } catch (err) {
      toast.error('Failed to generate onboarding guide');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!guide) return;
    const text = `# Contributing Guide for ${selectedRepo?.name || 'repository'}\n\n## Getting Started Roadmap\n\n` +
      guide.roadmapSteps?.map(s => `${s.step}. **${s.title}**: ${s.description}`).join('\n') +
      `\n\n## Codebase Map\n\n` +
      guide.codebaseMap?.map(m => `- \`${m.path}\`: ${m.purpose}`).join('\n');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CONTRIBUTING.md';
    a.click();
    toast.success('Exported CONTRIBUTING.md');
  };

  return (
    <div className="space-y-8 text-[#1F2A37]">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">Contributor Onboarding Guide</h1>
        <p className="text-xs text-[#5B6778]">Generate a personalized getting-started roadmap, interactive codebase map, and easy first issues.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Contributor Skill Level</label>
            <div className="flex gap-2">
              {['Beginner', 'Intermediate', 'Expert'].map(level => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    skillLevel === level ? 'bg-[#2F6FDE] text-[#F7F8FA]' : 'bg-[#FAFBFC] text-[#5B6778] border border-[#D3D9E2]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2A37]">Interest Area</label>
            <select
              value={interestArea}
              onChange={(e) => setInterestArea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            >
              <option value="Frontend">Frontend Development</option>
              <option value="Backend">Backend API & Services</option>
              <option value="Testing">Testing & QA</option>
              <option value="Docs">Documentation & Wiki</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateOnboard}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs shadow-sm cursor-pointer"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {generating ? 'Building Roadmap...' : 'Generate Contributor Roadmap'}
        </button>
      </div>

      {!guide ? (
        <div className="p-12 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] text-center space-y-4 shadow-sm">
          <UserPlus className="w-12 h-12 text-[#5B6778] mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2A37]">No contributor guide generated yet</h3>
          <p className="text-xs text-[#5B6778] max-w-md mx-auto">
            Click "Generate Contributor Roadmap" to build a customized onboarding guide and codebase map for new contributors.
          </p>
          <button
            onClick={handleGenerateOnboard}
            disabled={generating}
            className="px-6 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            Generate Contributor Roadmap
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#D3D9E2] pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1F2A37]">Your Personalized Getting Started Roadmap</h2>
              <p className="text-xs text-[#5B6778]">Tailored for <span className="text-[#2F6FDE] font-semibold">{guide.skillLevel}</span> in <span className="text-[#1F2A37] font-semibold">{guide.interestArea}</span></p>
            </div>
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#1F2A37] text-xs font-semibold border border-[#D3D9E2]"
            >
              <Download className="w-4 h-4" /> Export CONTRIBUTING.md
            </button>
          </div>

          {/* Roadmap Steps */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Step-by-Step Onboarding Roadmap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.roadmapSteps?.map(step => (
                <div key={step.step} className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2F6FDE] text-xs font-bold flex items-center justify-center">{step.step}</span>
                    <h4 className="font-semibold text-sm text-[#1F2A37]">{step.title}</h4>
                  </div>
                  <p className="text-xs text-[#5B6778] leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Codebase Map */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#1F2A37] uppercase tracking-wider font-mono">Visual Codebase Architecture Map</h3>
            <div className="p-5 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3">
              {guide.codebaseMap?.map((map, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-xs">
                  <span className="font-mono text-[#2F6FDE] font-bold shrink-0">{map.path}</span>
                  <span className="text-[#1F2A37]">{map.purpose}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
