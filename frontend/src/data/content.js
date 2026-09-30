import {
    ScanSearch,
    FileText,
    GitPullRequest,
    BookOpen,
    Compass,
    CircleDot,
    HeartPulse,
    Newspaper,
    Wrench,
    MessageSquare,
} from "lucide-react";

export const brand = { name: "RepoSense", tagline: "AI assistant for every GitHub repository" };

export const navLinks = [
    { id: "problems", label: "Problems" },
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How It Works" },
    { id: "report", label: "Sample Report" },
];

export const painPoints = [
    "No README?",
    "Confusing for new contributors?",
    "PRs piling up?",
    "No visibility into repo health?",
];

export const problems = [
    {
        id: "readme",
        pain: "Missing or poor README",
        feature: "ReadMe Generator",
        solution:
            "RepoSense reads your codebase, detects the stack and structure, and writes a complete README with a live preview that matches how GitHub renders it.",
        outcomes: ["Generated Markdown with copy and download", "Commit to the repo as a pull request", "Tone, sections, badges and language options"],
    },
    {
        id: "docs",
        pain: "Outdated documentation",
        feature: "Docs Manager",
        solution:
            "Code changes, docs do not. RepoSense finds undocumented modules and stale changelogs, then drafts the updates for you to review.",
        outcomes: ["Documentation completeness score", "List of undocumented functions and modules", "Auto-drafted API reference and changelog"],
    },
    {
        id: "onboarding",
        pain: "New contributors get lost",
        feature: "Onboarding Guide",
        solution:
            "Contributors choose their skill level and interest, and receive a personal roadmap through the codebase with easy issues to begin with.",
        outcomes: ["Step-by-step getting started roadmap", "Visual map of what each folder does", "Suggested beginner-friendly issues"],
    },
    {
        id: "review",
        pain: "Slow, manual code review",
        feature: "Code Review Hub",
        solution:
            "Every new pull request gets a context-aware review with plain-language reasoning, so feedback arrives in minutes instead of days.",
        outcomes: ["Line-by-line suggestions", "Overall PR quality score", "Optional automatic comments on the PR"],
    },
    {
        id: "issues",
        pain: "Issue management chaos",
        feature: "Issue Triage",
        solution:
            "Incoming issues are labeled, prioritized and checked for duplicates, so the backlog stays clean without manual sorting.",
        outcomes: ["Auto-labeling as bug, feature or question", "Priority-sorted issue list", "Duplicates linked together"],
    },
    {
        id: "health",
        pain: "Repo health is invisible",
        feature: "Health Score",
        solution:
            "One score from 0 to 100 shows whether a project is active or drifting, with a breakdown across docs, activity, community and code.",
        outcomes: ["Score with category breakdown", "Trend over recent weeks", "Custom weightage for each category"],
    },
    {
        id: "activity",
        pain: "Progress is hard to explain",
        feature: "Activity Digest",
        solution:
            "Commit history is turned into a plain-language summary that managers and clients can read without any technical background.",
        outcomes: ["Daily, weekly or monthly summaries", "Delivery by email or dashboard", "No manual report writing"],
    },
    {
        id: "fixes",
        pain: "Small fixes eat your time",
        feature: "Auto-Fix Center",
        solution:
            "Formatting problems, unused imports and simple lint errors are fixed automatically and packaged into a pull request with a clear diff explanation.",
        outcomes: ["Suggest-only or auto-create PR mode", "Ready-to-merge fix pull request", "Explanation for every change"],
    },
];

export const features = [
    { icon: ScanSearch, title: "Scan", text: "Deep analysis of README, docs, onboarding, issues and activity in one report." },
    { icon: FileText, title: "ReadMe", text: "Generate a complete README with a live GitHub-style preview." },
    { icon: GitPullRequest, title: "Review", text: "Automated, context-aware feedback on every pull request." },
    { icon: BookOpen, title: "Docs", text: "Keep API references and changelogs fresh as code evolves." },
    { icon: Compass, title: "Onboard", text: "Personalized roadmaps and codebase maps for new contributors." },
    { icon: CircleDot, title: "Issues", text: "Auto-label, prioritize and detect duplicate issues." },
    { icon: HeartPulse, title: "Health", text: "A single fitness score with trends and a clear breakdown." },
    { icon: Newspaper, title: "Digest", text: "Readable progress summaries for non-technical stakeholders." },
    { icon: Wrench, title: "Fix", text: "Safe automatic fixes delivered as a ready-to-merge pull request." },
    { icon: MessageSquare, title: "Chat", text: "Ask about your repo in plain language and trigger actions directly." },
];

export const steps = [
    { title: "Connect your repo", text: "Sign in with GitHub and select a repository or paste its URL. No manual setup required." },
    { title: "AI analyzes everything", text: "RepoSense inspects files, docs, issues, pull requests and commit activity to understand the project." },
    { title: "Get docs, fixes and guidance", text: "Receive a full report, generated documentation, review feedback and one-click pull requests." },
];

export const healthBreakdown = [
    { label: "Docs", value: 85 },
    { label: "Activity", value: 96 },
    { label: "Community", value: 90 },
    { label: "Code", value: 92 },
];

export const reportMetrics = [
    { label: "README", value: "Missing", tone: "text-rose-300" },
    { label: "Docs completeness", value: "40%", tone: "text-amber-300" },
    { label: "Onboarding readiness", value: "Low", tone: "text-amber-300" },
    { label: "Open issues", value: "6", tone: "text-slate-100" },
    { label: "Pending PRs", value: "2", tone: "text-slate-100" },
    { label: "Health score", value: "55 / 100", tone: "text-amber-300" },
];

export const footerLinks = ["About", "Docs", "GitHub", "Contact", "Privacy"];