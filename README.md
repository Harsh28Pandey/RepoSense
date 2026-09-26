# RepoSense

> AI assistant that auto-generates READMEs, reviews PRs, tracks docs and repo health for every GitHub project — MERN + LangGraph + multi-LLM powered.

*(20-word description above — use as GitHub "About" tagline)*

---

## 📌 Problem

Most personal and open-source GitHub repos face the same recurring issues:
- **Missing or poor README** — new visitors/recruiters can't understand the project.
- **Outdated documentation** — code changes, but docs/changelog are forgotten.
- **Confusing onboarding** — new contributors don't know where to start in a large repo.
- **Slow, manual PR review** — style/logic issues get missed, feedback is delayed.
- **Issue management chaos** — duplicate issues, missing labels, unclear priority.
- **Invisible repo health** — no way to tell if a project is active or abandoned.
- **Unreadable commit activity** — hard to explain progress to non-technical stakeholders.
- **Small fixes eat time** — formatting and unused imports need manual cleanup.

## ✅ Solution

**RepoSense** connects to your GitHub repo and, using a multi-LLM AI pipeline (Groq for speed, Gemini for multimodal input, OpenAI for deep reasoning — routed via LangGraph, with RAG for repo-specific context), automatically:

- Scans the repo and generates a full **README.md** (with live Markdown preview) when one is missing or incomplete.
- Reviews Pull Requests line-by-line with a plain-language Quality Score.
- Keeps API docs / CHANGELOG / Wiki pages fresh with auto-drafted updates.
- Builds a personalized onboarding roadmap for new contributors.
- Auto-labels and de-duplicates issues.
- Scores overall repo health (0–100) with a breakdown chart and trend graph.
- Converts commit activity into a plain-language digest for managers/clients.
- Auto-fixes small issues (formatting, unused imports) as a ready-to-merge PR.
- Lets you ask questions about your repo directly in a **Chat** tab that routes to the best AI model and answers with Problem + Solution + an action button.

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), React Router, Axios, react-markdown |
| Backend | Node.js, Express, MongoDB (Mongoose), Redis |
| AI | LangChain + LangGraph (multi-LLM routing), RAG, Gemini / Groq / OpenAI |
| Auth | GitHub OAuth + JWT |

## 📁 Project Structure

```
reposense/
├── backend/
│   ├── config/          # db.js, redis.js
│   ├── controllers/     # authController, repoController, readmeController, chatController
│   ├── middleware/       # auth.js (JWT protect)
│   ├── models/           # User.js, Repo.js
│   ├── routes/            # authRoutes, repoRoutes, readmeRoutes, chatRoutes
│   ├── services/          # scanService.js, readmeService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/Navbar.jsx
│   │   ├── pages/         # Landing, Dashboard, Scan, ReadmeGenerator, Chat
│   │   ├── styles/index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally or a connection URI (e.g. MongoDB Atlas)
- Redis running locally or a connection URI (optional in dev)
- A GitHub OAuth App (Client ID + Secret)
- API keys for OpenAI / Groq / Gemini (only needed for the AI features you use)

### 1. Clone & install
```bash
git clone https://github.com/<your-username>/reposense.git
cd reposense

# Backend
cd backend
npm install
cp .env.example .env    # fill in your Mongo URI, JWT secret, GitHub OAuth, AI keys

# Frontend
cd ../frontend
npm install
cp .env.example .env    # set VITE_API_BASE_URL if different from default
```

### 2. Run in development
Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Visit **http://localhost:5173** — click **Connect with GitHub** to log in, then use the Dashboard, Scan, ReadMe and Chat tabs.

### 3. Production build
```bash
cd frontend && npm run build      # outputs frontend/dist
cd ../backend && npm start        # serve API (add a static file server / reverse proxy for dist)
```

## 🔑 Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list (Mongo URI, Redis URL, JWT secret, GitHub OAuth credentials, OpenAI/Groq/Gemini API keys).

## 🗺️ API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/github` | Start GitHub OAuth login |
| GET | `/api/auth/github/callback` | OAuth callback, issues JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/repos` | List connected repos (Dashboard) |
| POST | `/api/repos/scan` | Deep scan a repo by URL |
| GET | `/api/repos/:id` | Get single repo detail |
| POST | `/api/readme/generate` | Generate a README (with live preview) |
| POST | `/api/chat/ask` | Ask RepoSense (multi-LLM router) |

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes and open a PR

## 📄 License

MIT
