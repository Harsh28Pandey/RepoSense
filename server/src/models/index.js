import mongoose from 'mongoose';
import { Notification } from './Notification.js';

const { Schema } = mongoose;

// 1. User
const UserSchema = new Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  githubUsername: { type: String, required: true, unique: true, lowercase: true, trim: true },
  githubUsernameDisplay: { type: String, required: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, { timestamps: true });



// 2. OtpToken
const OtpTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: ['signup', 'reset'], required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  resendCount: { type: Number, default: 0 },
  resendCooldownUntil: { type: Date, default: null }
}, { timestamps: true });

OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 3. RefreshToken
const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  family: { type: String, required: true },
  isRevoked: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 4. GitHubAccount (Encrypted Token)
const GitHubAccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  githubUsername: { type: String, required: true },
  encryptedToken: { type: String, required: true },
  tokenType: { type: String, enum: ['oauth', 'pat'], default: 'oauth' },
  scope: { type: String }
}, { timestamps: true });

// 5. Repo
const RepoSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  githubRepoId: { type: String },
  owner: { type: String, required: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  url: { type: String, required: true },
  defaultBranch: { type: String, default: 'main' },
  isPrivate: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isFork: { type: Boolean, default: false },
  description: { type: String },
  language: { type: String },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  openIssuesCount: { type: Number, default: 0 },
  hasReadme: { type: Boolean, default: false },
  readmeQualityScore: { type: Number, default: 0 },
  healthScore: { type: Number, default: 75 },
  healthWeights: {
    readmeDocs: { type: Number, default: 30 },
    activity: { type: Number, default: 30 },
    community: { type: Number, default: 20 },
    codeQuality: { type: Number, default: 20 }
  },
  autoRescan: { type: Boolean, default: false },
  autoLabelIssues: { type: Boolean, default: false },
  lastScannedAt: { type: Date }
}, { timestamps: true });

RepoSchema.index({ userId: 1, fullName: 1 }, { unique: true });

// 6. Scan
const ScanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
  progress: { type: Number, default: 0 },
  currentStep: { type: String, default: 'Initializing scan...' },
  readmeStatus: { type: String, enum: ['MISSING', 'INCOMPLETE', 'GOOD', 'EXCELLENT'], default: 'MISSING' },
  docsCompletenessScore: { type: Number, default: 0 },
  onboardingReadiness: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  openIssuesCount: { type: Number, default: 0 },
  pendingPrsCount: { type: Number, default: 0 },
  healthScore: { type: Number, default: 0 },
  activityTrend: { type: String, default: 'Stable' },
  plainSummary: { type: String },
  error: { type: String }
}, { timestamps: true });

// 7. ReadmeVersion
const ReadmeVersionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  content: { type: String, required: true },
  tone: { type: String, default: 'Professional' },
  sectionsIncluded: [{ type: String }],
  language: { type: String, default: 'English' },
  prUrl: { type: String },
  prNumber: { type: Number }
}, { timestamps: true });

// 8. ReviewReport
const ReviewReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  prNumber: { type: Number, required: true },
  prTitle: { type: String, required: true },
  prUrl: { type: String },
  qualityScore: { type: Number, required: true },
  safeToMerge: { type: Boolean, default: true },
  depth: { type: String, default: 'Quick' },
  styleGuide: { type: String, default: 'Default' },
  suggestions: [{
    file: { type: String },
    line: { type: Number },
    type: { type: String, enum: ['critical', 'minor', 'suggestion'] },
    title: { type: String },
    explanation: { type: String },
    codeSnippet: { type: String }
  }],
  summary: {
    criticalCount: { type: Number, default: 0 },
    minorCount: { type: Number, default: 0 },
    suggestionCount: { type: Number, default: 0 }
  },
  postedToGithub: { type: Boolean, default: false }
}, { timestamps: true });

// 9. DocsReport
const DocsReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  completenessScore: { type: Number, required: true },
  missingDocs: [{
    path: { type: String },
    name: { type: String },
    type: { type: String },
    description: { type: String }
  }],
  changelogStatus: { type: String },
  lastUpdated: { type: String },
  draftUpdates: [{
    target: { type: String },
    title: { type: String },
    content: { type: String }
  }],
  prUrl: { type: String }
}, { timestamps: true });

// 10. OnboardGuide
const OnboardGuideSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  skillLevel: { type: String, default: 'Beginner' },
  interestArea: { type: String, default: 'Frontend' },
  slug: { type: String, unique: true, index: true },
  roadmapSteps: [{
    step: { type: Number },
    title: { type: String },
    description: { type: String }
  }],
  codebaseMap: [{
    path: { type: String },
    purpose: { type: String }
  }],
  goodFirstIssues: [{
    number: { type: Number },
    title: { type: String },
    labels: [{ type: String }],
    url: { type: String }
  }],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

// 11. IssueTriage
const IssueTriageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  issues: [{
    issueNumber: { type: Number },
    title: { type: String },
    body: { type: String },
    suggestedLabel: { type: String, enum: ['bug', 'feature', 'question', 'docs'] },
    priority: { type: String, enum: ['High', 'Medium', 'Low'] },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: Number },
    similarityScore: { type: Number, default: 0 },
    url: { type: String }
  }],
  similarityThreshold: { type: Number, default: 80 }
}, { timestamps: true });

// 12. HealthSnapshot
const HealthSnapshotSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  score: { type: Number, required: true },
  breakdown: {
    readmeDocs: { type: Number, required: true },
    activity: { type: Number, required: true },
    community: { type: Number, required: true },
    codeQuality: { type: Number, required: true }
  },
  trend: { type: String, default: 'improving' },
  recommendations: [{ type: String }]
}, { timestamps: true });

// 13. Digest
const DigestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
  delivery: { type: String, enum: ['email', 'dashboard'], default: 'dashboard' },
  summaryText: { type: String, required: true },
  highlights: [{ type: String }],
  recipientEmail: { type: String },
  slug: { type: String, unique: true, sparse: true },
  sentAt: { type: Date }
}, { timestamps: true });

// 14. FixReport
const FixReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  issuesFoundCount: { type: Number, required: true },
  fixes: [{
    id: { type: String },
    filePath: { type: String },
    category: { type: String, enum: ['Formatting', 'Unused Imports', 'Lint Error'] },
    explanation: { type: String },
    before: { type: String },
    after: { type: String },
    selected: { type: Boolean, default: true }
  }],
  prUrl: { type: String }
}, { timestamps: true });

// 15. ChatSession
const ChatSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo' },
  title: { type: String, default: 'New Chat Session' },
  contextScope: { type: String, enum: ['current', 'all'], default: 'current' },
  responseStyle: { type: String, enum: ['short', 'detailed'], default: 'short' },
  preferredAi: { type: String, enum: ['auto', 'groq', 'gemini', 'openai'], default: 'auto' }
}, { timestamps: true });

// 16. ChatMessage
const ChatMessageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  attachmentUrl: { type: String },
  attachmentType: { type: String },
  aiProviderUsed: { type: String },
  problemDescription: { type: String },
  solutionText: { type: String },
  actionButton: {
    label: { type: String },
    action: { type: String },
    tabTarget: { type: String }
  },
  sourcesUsed: [{ type: String }]
}, { timestamps: true });

// 17. EmbeddingChunk
const EmbeddingChunkSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
  filePath: { type: String, required: true },
  contentChunk: { type: String, required: true },
  embedding: [{ type: Number }]
}, { timestamps: true });



// 19. ActivityEvent
const ActivityEventSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repo' },
  type: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// 20. Notification
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// 21. ContactMessage
const ContactMessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'new' }
}, { timestamps: true });

// 22. WebhookDelivery
const WebhookDeliverySchema = new Schema({
  event: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  status: { type: String, default: 'received' }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const OtpToken = mongoose.models.OtpToken || mongoose.model('OtpToken', OtpTokenSchema);
export const RefreshToken = mongoose.models.RefreshToken || mongoose.model('RefreshToken', RefreshTokenSchema);
export const GitHubAccount = mongoose.models.GitHubAccount || mongoose.model('GitHubAccount', GitHubAccountSchema);
export const Repo = mongoose.models.Repo || mongoose.model('Repo', RepoSchema);
export const Scan = mongoose.models.Scan || mongoose.model('Scan', ScanSchema);
export const ReadmeVersion = mongoose.models.ReadmeVersion || mongoose.model('ReadmeVersion', ReadmeVersionSchema);
export const ReviewReport = mongoose.models.ReviewReport || mongoose.model('ReviewReport', ReviewReportSchema);
export const DocsReport = mongoose.models.DocsReport || mongoose.model('DocsReport', DocsReportSchema);
export const OnboardGuide = mongoose.models.OnboardGuide || mongoose.model('OnboardGuide', OnboardGuideSchema);
export const IssueTriage = mongoose.models.IssueTriage || mongoose.model('IssueTriage', IssueTriageSchema);
export const HealthSnapshot = mongoose.models.HealthSnapshot || mongoose.model('HealthSnapshot', HealthSnapshotSchema);
export const Digest = mongoose.models.Digest || mongoose.model('Digest', DigestSchema);
export const FixReport = mongoose.models.FixReport || mongoose.model('FixReport', FixReportSchema);
export const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
export const EmbeddingChunk = mongoose.models.EmbeddingChunk || mongoose.model('EmbeddingChunk', EmbeddingChunkSchema);
export const ActivityEvent = mongoose.models.ActivityEvent || mongoose.model('ActivityEvent', ActivityEventSchema);
export { Notification };
export const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
export const WebhookDelivery = mongoose.models.WebhookDelivery || mongoose.model('WebhookDelivery', WebhookDeliverySchema);
