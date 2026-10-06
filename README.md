# RepoSense 🚀

> Production-grade AI Assistant & Co-Pilot for every GitHub Repo Owner. Auto-generates READMEs with live previews, runs context-aware PR reviews, triages issues with vector similarity, scores repository health, and provides a multi-LLM RAG chat co-pilot.

---

> [!IMPORTANT]
> **FIRST FILE TO READ:** Please read [`hello.txt`](file:///hello.txt) in the project root for complete, step-by-step setup instructions, environment variable details, API key links, and troubleshooting steps.

---

## 📌 Problem & Solution

### Problems Solved:
1. **Missing or Poor README**: New visitors & recruiters leave projects lacking installation or usage documentation.
2. **Outdated Documentation**: Code evolves, but API docs and CHANGELOGs fall behind.
3. **Onboarding Confusion**: New contributors don't understand large codebase folder structures.
4. **Slow Code Review**: Manual PR reviews take hours and miss edge cases or unused variables.
5. **Issue Management Chaos**: Unlabeled, duplicate issues create maintainer overhead.
6. **Invisible Repo Health**: No standardized metrics to judge if a repo is active or abandoned.

### Solution:
**RepoSense** connects to your GitHub repository and runs a multi-agent AI pipeline (Groq for sub-second chat, Google Gemini for multimodal analysis, OpenAI for deep reasoning, and RAG over vector embeddings) to automate maintenance end-to-end.

---

## 🧱 Tech Stack

- **Frontend (`/client`)**: React 18, Vite, React Router v6, Tailwind CSS, Recharts, `react-markdown` + `remark-gfm` + `rehype-highlight` (GitHub-style Markdown live preview), Zustand, Axios, React Hook Form + Zod, `react-hot-toast`.
- **Backend (`/server`)**: Node.js, Express.js, MongoDB (Mongoose), Redis (ioredis & BullMQ job queues), JWT (httpOnly cookies), Octokit GitHub API.
- **AI & RAG**: Multi-LLM router (Groq, Google Gemini, OpenAI via server env keys), MongoDB Atlas Vector Search / Local Cosine Similarity fallback, AES-256-GCM GitHub token encryption.
- **Security**: Helmet, CORS, Express Rate Limit, Express Mongo Sanitize.

---

## 🚀 Quick Start Guide

Refer to [`hello.txt`](file:///hello.txt) for comprehensive environment variable setup.

### Single Command Execution (Root Directory)
```bash
# Install dependencies
npm run install-all

# Start MongoDB and Redis background services
docker compose up -d mongo redis

# Run database migration if upgrading from previous versions
cd server && npm run migrate:remove-settings && cd ..

# Start both client and server simultaneously
npm run dev
```

Visit **http://localhost:5173** in your desktop browser.

---

## 🧪 Running Tests & Database Migration

```bash
# Run one-time database cleanup migration
cd server
npm run migrate:remove-settings

# Run server unit & two-user cross-tenant isolation tests
npm test

# Access internal visual QA page in browser
# http://localhost:5173/dev/ui
```

---

## 📄 License

Distributed under the MIT License.
