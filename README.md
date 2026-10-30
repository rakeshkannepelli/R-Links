# ⚡ R-LINKS // Neural Resource Vault

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%205-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

> A high-performance digital commonplace book and bookmark vault. Built with an **Analog-Digital Terminal design system**, tactile 3D retro controls, universal smart auto-classification, and zero-latency state management.

---

## 📑 Table of Contents

- [Overview & Aesthetics](#-overview--aesthetics)
- [Key Features](#-key-features)
- [Project Architecture](#-project-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup-rlinks_backend)
  - [2. Frontend Setup](#2-frontend-setup-rlinks_app)
- [Environment Variables Guide](#-environment-variables-guide)
- [Running Automated Tests](#-running-automated-tests)
- [How to Use](#-how-to-use)
- [Roadmap](#-roadmap)

---

## 🎨 Overview & Aesthetics

R-Links rejects homogenized, sterile SaaS dashboards in favor of an **Analog-Digital Paper Terminal**:
- **Tactile Paper Canvas:** Warm paper texture (`#fbf9f0`) overlaid on a vintage dot-grid matrix.
- **Intentional Imperfection:** Subtle organic tilts (`-0.7°` to `+0.8°`) on resource cards with solid 2.5D retro drop-shadows.
- **Terminal Aesthetics:** Monospace typography, blinking block cursors, and pixel green accent states (`#00f99b`).
- **Interactive Companion ("R-Bot"):** An animated AI companion that provides live system state feedback, motivational quotes, and developer humor.

---

## ✨ Key Features

- **🔐 Multi-Method Authentication:**
  - Traditional Operator ID / Email + Passphrase with bcrypt security.
  - Seamless One-Click **Google OAuth** & **GitHub OAuth** integration.
  - Cryptographically secure **SHA-256 token-based password recovery** with automatic fallback link support.
- **⚡ Universal Smart Auto-Categorization:**
  - Automatically identifies whether a link belongs to `AI TOOLS`, `DEV & TECH`, `DESIGN`, `WORK`, `GAMING`, `MEDIA`, etc., the instant you paste a URL.
- **🗃️ 3×3 Tactile Archive Matrix:**
  - Filter by custom and discovered categories, toggle instant pin priorities, or perform full-text search across titles, tags, and domain names.
- **🔄 Instant Optimistic UI:**
  - 0ms latency for pinning, updating, and removing bookmarks backed by Zustand local state with background server synchronization.
- **📡 P2P Decentralized Sync (PeerJS):**
  - Direct browser-to-browser resource sharing and payload exchange without intermediate servers.
- **📊 Curator Analytics & Heatmap:**
  - Profile tracking with dynamic rank progression (`Bronze Archivist` → `Diamond Core`), active day streaks, and category distribution.

---

---

## 🛠️ Tech Stack

### Frontend (`rlinks_app`)
- **Core:** React 18, Vite 5
- **Routing:** React Router DOM v6
- **State Management:** Zustand (with LocalStorage persistence)
- **Styling:** Tailwind CSS, PostCSS, Space Grotesk & JetBrains Mono fonts
- **Animations:** GSAP, LDRS custom SVG loaders
- **P2P Networking:** PeerJS

### Backend (`rlinks_backend`)
- **Runtime:** Node.js (v18+)
- **Framework:** Express 5
- **Database / ODM:** MongoDB Atlas via Mongoose 9
- **Security:** JSON Web Tokens (JWT), bcryptjs, SHA-256 Crypto
- **Email Delivery:** Nodemailer (SMTP / Gmail App Passwords) + Resend API support
- **Testing:** Native Node Test Runner (`node:test`, `node:assert`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.0.0` or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)
- [Git](https://git-scm.com/)

---

### 1. Backend Setup (`rlinks_backend`)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd rlinks_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local `.env` file from the provided template:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and fill in your connection details (MongoDB URI, JWT secret, and email credentials).
5. Start the backend server:
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

---

### 2. Frontend Setup (`rlinks_app`)

1. In a separate terminal tab, navigate to the frontend folder:
   ```bash
   cd rlinks_app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your frontend `.env`:
   ```env
   # Point to your local backend (or leave blank to use live cloud API)
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   VITE_GITHUB_CLIENT_ID=your_github_client_id
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```
5. Open your browser at `http://localhost:5173` to access R-Links.

---

## 🔑 Environment Variables Guide

### Backend (`rlinks_backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Local port for Express API | `5000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/rlinks` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `your_super_secret_jwt_key` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for token verification | `86569...apps.googleusercontent.com` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Ov23lic...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `ghs_...` |
| `EMAIL_USER` | Gmail address for password reset emails | `operator@gmail.com` |
| `EMAIL_PASS` | Gmail 16-character App Password | `xxxx xxxx xxxx xxxx` |
| `RESEND_API_KEY` | Optional Resend API key fallback | `re_...` |

### Frontend (`rlinks_app/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Base URL of backend server (`http://localhost:5000` or production URL) |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth Client ID |
| `VITE_GITHUB_CLIENT_ID` | Public GitHub OAuth Client ID |

---

## 🧪 Running Automated Tests

The backend includes native automated tests covering password reset token hashing, bcrypt verification, safe chronological sorting, and Operator ID injection prevention.

Run the test suite from `rlinks_backend`:
```bash
cd rlinks_backend
npm test
```

Expected output:
```text
✔ correctly hashes reset password tokens using SHA-256 and matches incoming tokens
✔ supports backward compatibility matching for both raw legacy tokens and SHA-256 hashed tokens
✔ safely sorts links chronologically even when date fields are missing or strings
✔ validates operator ID regex escaping to prevent RegExp injection & collision
✔ resolves account query whether operator ID or email is supplied
✔ verifies bcrypt password hashing and verification
ℹ pass 6
ℹ fail 0
```

---

## 📖 How to Use

1. **Create an Account:**
   - Go to `/auth`, click **REGISTER**, pick an Operator ID (e.g. `OPERATOR_01`), enter your email, and choose a passphrase.
   - Alternatively, sign in instantly via **Google** or **GitHub**.
2. **Curate a Link:**
   - Head to `/links`. Paste any URL (e.g. `https://linear.app`).
   - The **Universal Smart Auto-Categorizer** automatically detects the domain, generates metadata, and tags the resource.
   - Click **Save Link** to ingest it into your vault.
3. **Explore the 3×3 Database:**
   - Visit `/database` to view your bookmarks in a responsive 3×3 matrix or list view.
   - Filter by categories (`AI TOOLS`, `DEV & TECH`, `WORK`, etc.), search by keyword, or pin key links to the top.
4. **P2P Share:**
   - Navigate to `/share` to establish direct WebRTC peer connections with another user to beam bookmark payloads without servers.
5. **Recover Passphrase:**
   - If you ever forget your passphrase, click **RECOVERY** on the auth screen. Enter your Operator ID or Email to receive an encrypted reset link.

---

## 🗺️ Roadmap

- [x] Full Analog-Pixel responsive design system with 3D tactile buttons
- [x] Secure SHA-256 token recovery & dual-format token support
- [x] Decoupled OAuth environment variables
- [x] Automated backend regression test suite
- [ ] Browser extension for one-click bookmarking
- [ ] Offline local-first IndexedDB replication
- [ ] Full-text semantic search with vector embeddings
