import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Input,
  Select,
  Checkbox,
  Switch,
  Badge,
  Card,
  Table,
  Tabs,
  Modal,
  Dropdown,
  Tooltip,
  Skeleton,
  EmptyState,
  ErrorState,
  Kbd,
  CodeBlock,
  DiffViewer,
  Stat,
  ScoreGauge,
} from '../components/ui';
import { Search, Sparkles, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';

export default function DevUiPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [checkState, setCheckState] = useState(true);
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div className="min-h-screen bg-[#ECEEF1] p-8 text-[#1C2430]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">RepoSense Design System Visual QA (/dev/ui)</h1>
          <p className="text-xs text-[#4A5565]">
            Soft Light Theme Token Validation (#ECEEF1, #F5F6F8, #F9FAFB, #E4E7EC, #D2D7DF, #2B5FD9, rounded-2xl).
          </p>
        </div>

        {/* Buttons & IconButtons */}
        <section className="p-5 bg-[#F5F6F8] border border-[#D2D7DF] rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-[#1C2430]">Buttons & IconButtons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <IconButton icon={Search} label="Search" />
            <IconButton icon={Sparkles} label="AI" variant="secondary" />
          </div>
        </section>

        {/* Form Controls */}
        <section className="p-5 bg-[#F5F6F8] border border-[#D2D7DF] rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-[#1C2430]">Form Inputs & Selects</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Repo Name" placeholder="e.g. facebook/react" icon={Search} />
            <Input label="With Error" placeholder="Invalid input" error="Repository not found" />
            <Select
              label="Review Depth"
              options={[
                { label: 'Quick Overview', value: 'quick' },
                { label: 'Deep Line-by-Line', value: 'deep' },
              ]}
            />
          </div>
          <div className="flex items-center gap-6 pt-2">
            <Checkbox
              label="Auto-generate badges"
              description="Include build status and license badges"
              checked={checkState}
              onChange={(e) => setCheckState(e.target.checked)}
            />
            <Switch label="Webhook Auto-sync" checked={switchState} onChange={setSwitchState} />
          </div>
        </section>

        {/* Badges & Stats */}
        <section className="p-5 bg-[#F5F6F8] border border-[#D2D7DF] rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-[#1C2430]">Badges, Stats & Health Gauge</h2>
          <div className="flex items-center gap-3">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success" icon={CheckCircle}>
              Verified
            </Badge>
            <Badge variant="warning" icon={AlertCircle}>
              Needs Review
            </Badge>
            <Badge variant="danger">High Priority</Badge>
          </div>
          <div className="grid grid-cols-4 gap-4 pt-2">
            <Stat label="Total Scans" value="142" trend="+12% this week" icon={FileText} />
            <Stat label="README Status" value="Complete" trend="Auto-generated" icon={CheckCircle} />
            <ScoreGauge score={88} label="Health Score" />
            <ScoreGauge score={42} label="Health Score" />
          </div>
        </section>

        {/* Tabs, Tooltips & Dropdowns */}
        <section className="p-5 bg-[#F5F6F8] border border-[#D2D7DF] rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-[#1C2430]">Tabs, Tooltips, Dropdowns & Kbd</h2>
          <div className="flex items-center justify-between">
            <Tabs
              tabs={[
                { id: 'tab1', label: 'Overview', icon: FileText },
                { id: 'tab2', label: 'PR Reviews', icon: Sparkles },
                { id: 'tab3', label: 'Analytics', icon: AlertCircle },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
            <div className="flex items-center gap-4">
              <Tooltip text="Click to launch global AI assistant">
                <span className="text-xs text-[#4A5565] cursor-pointer underline">Hover for Tooltip</span>
              </Tooltip>
              <Kbd>Cmd + K</Kbd>
              <Dropdown
                trigger={<Button variant="secondary">Actions ▾</Button>}
                items={[
                  { label: 'Generate README', icon: FileText, onClick: () => alert('Generate') },
                  { label: 'Delete Repo Data', icon: AlertCircle, danger: true, onClick: () => setModalOpen(true) },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Code & Diff Viewers */}
        <section className="p-5 bg-[#F5F6F8] border border-[#D2D7DF] rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-[#1C2430]">Code & Diff Viewers</h2>
          <CodeBlock code={`const repoSense = new RepoSense({ provider: 'gemini' });\nawait repoSense.scanRepo('facebook/react');`} />
          <DiffViewer oldCode={`- import { useState } from 'react';`} newCode={`+ import React, { useState, useMemo } from 'react';`} />
        </section>

        {/* Skeletons & States */}
        <section className="p-5 bg-[#F5F6F8] border border-[#D2D7DF] rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-[#1C2430]">Skeletons & States</h2>
          <div className="space-y-2">
            <Skeleton height="h-4" width="w-3/4" />
            <Skeleton height="h-4" width="w-1/2" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <EmptyState
              icon={FileText}
              title="No Repositories Connected"
              description="Connect a public or private GitHub repository to generate documentation and automated reviews."
              action={<Button variant="primary">Connect GitHub</Button>}
            />
            <ErrorState title="GitHub API Rate Limit Exceeded" message="Please attach your Personal Access Token to bypass rate limits." />
          </div>
        </section>

        {/* Table & Modal */}
        <section className="p-5 bg-[#F5F6F8] border border-[#D2D7DF] rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-[#1C2430]">Table & Modal Preview</h2>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open Sample Modal
          </Button>
          <Table headers={['Repository', 'Status', 'Health Score', 'Action']}>
            <tr className="hover:bg-[#E4E7EC]/50 transition-colors">
              <td className="px-4 py-3 font-medium text-[#1C2430]">facebook/react</td>
              <td className="px-4 py-3">
                <Badge variant="success">Healthy</Badge>
              </td>
              <td className="px-4 py-3 font-mono">92/100</td>
              <td className="px-4 py-3">
                <Button variant="subtle" size="sm">
                  View Scan
                </Button>
              </td>
            </tr>
          </Table>
        </section>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Data Reset"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setModalOpen(false)}>
              Reset Data
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#4A5565]">
          Are you sure you want to permanently reset all AI embeddings and cached reports for this repository?
        </p>
      </Modal>
    </div>
  );
}
