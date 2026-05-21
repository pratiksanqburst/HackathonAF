# AF InsightSphere 🔮

> AI-Powered Investment Storytelling & Wealth Analytics Platform

---

## 🚀 How to Run

### Option 1 — Run Both Together (Recommended)

From the **root** folder (`AF-InsightSphere/`):

```bash
npm run dev
```

This starts both the **Express server** (port 5000) and the **Vite client** (port 5173) simultaneously.

---

### Option 2 — Run Separately

**Terminal 1 — Server:**
```bash
cd server
node src/index.js
```

**Terminal 2 — Client:**
```bash
cd client
npm run dev
```

Then open: **http://localhost:5173**

---

## 📦 First-Time Setup

Install all dependencies in one go from the root:

```bash
npm run install:all
```

Or manually:
```bash
# Root
npm install

# Client
cd client && npm install

# Server
cd ../server && npm install
```

---

## 🗂️ Project Structure

```
AF-InsightSphere/
├── package.json          ← Root scripts (runs both via concurrently)
├── client/               ← React + Vite + TypeScript frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── store/        ← Zustand global state
│       ├── pages/        ← Dashboard page
│       ├── components/
│       │   ├── layout/   ← Navbar
│       │   └── widgets/  ← WealthTimeline, AIInsightCard, RiskGalaxy, GoalSimulator, ClientSelection
│       └── styles/       ← Global CSS design tokens
└── server/               ← Express API server
    └── src/
        └── index.js      ← REST API on port 5000
```

---

## 🌐 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/portfolio/:persona` | Portfolio data for a persona |

**Personas:** `young-investor` · `family-planner` · `retirement-client`

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | Express.js |
| Dev runner | Concurrently |
