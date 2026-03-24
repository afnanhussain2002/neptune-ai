# 🤖 AI Chat — GitHub Models (GPT-4o)

A full-stack chat app using GitHub Models (GPT-4o), built with Node.js + Express backend and React frontend.

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── index.js        ← Express server
│   ├── package.json
│   └── .env            ← You create this (see below)
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

---

## ⚡ Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```
GITHUB_TOKEN=your_github_token_here
PORT=3001
```

Start the server:
```bash
npm start
# or for dev with auto-reload:
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**
Backend runs on **http://localhost:3001**

> The frontend proxies API requests to the backend automatically via the `"proxy"` field in `package.json`.

---

## 🔑 GitHub Token Requirements

Your GitHub token needs **`models:read`** permission.

Get one at: https://github.com/settings/tokens

---

## ✨ Features

- 💬 **Chat history** — sidebar with all past chats, click to reload
- 📋 **Copy button** — copy any message instantly
- 📱 **Mobile responsive** — sidebar slides in on small screens
- ⚡ **System prompt** — set custom instructions per session
- 🗑️ **Delete chats** — remove any chat from history
- 🌑 **Dark mode** — sleek dark UI with purple accents

---

## 🧠 Adding Your Custom Prompt

Click **"Set Prompt"** in the top-right corner and paste your system prompt. Example:

```
You are a critical thinking assistant. Before answering, ask me 1-3 
clarifying questions. Then fact-check any claims I make and push back 
if something is wrong. Never agree just to be polite.
```

---

## 🛠 Model

Uses **`openai/gpt-4o`** via the GitHub Models inference endpoint:
`https://models.github.ai/inference`