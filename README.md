# 🚀 DocuMind AI — Intelligent Workspace for Documents

> Turn documents into knowledge with AI-powered querying.

---

## 🧠 Overview

DocuMind AI is a **full-stack AI-powered document workspace platform** that enables users to:

- 📂 Organize documents into workspaces
- 👥 Collaborate using invite-based access
- 📄 Upload PDFs, text files, or write content directly
- 🤖 Ask questions and get answers from documents (RAG pipeline)
- 🔍 Instantly retrieve contextual insights

It bridges the gap between **document storage and intelligent understanding**.

---

## ✨ Features

### 🔐 Authentication & Roles

- Secure authentication with Clerk
- Role-based access (Admin / Member)

### 🏢 Workspace System

- Create and manage workspaces
- Join via invite codes
- Multi-user collaboration

### 📄 Document Management

- Upload:
  - PDF files
  - Text files
  - Direct text input
- Structured storage:
  ```
  uploads/{workspace_id}/
  ```
- View documents:
  - PDF viewer (Google embedded)
  - Text rendering
  - Download support
- Delete with cascading cleanup

### 🤖 AI-Powered Querying (RAG)

- Document chunking (500-word chunks + overlap)
- Keyword-based retrieval
- Groq LLM integration (fast inference)
- Context-aware answers

### ⚡ Performance Optimizations

- Chunk-based retrieval (no full document load)
- Token-efficient AI calls
- Scalable backend architecture

---

## 🏗️ Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS
- Clerk Authentication

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy ORM

### AI
- Groq LLM (llama-3.1-8b-instant)
- Custom RAG pipeline

### Storage
- Local file system (`/uploads`)
- Workspace-based structure

---

## 🧩 System Architecture

```
User
  ↓
Frontend (Next.js)
  ↓
Backend (FastAPI)
  ↓
Database (PostgreSQL)
  ↓
File Storage (/uploads)
  ↓
AI Layer (Groq + RAG)
```

---

## ⚙️ How It Works

1. User uploads document
2. Backend parses and chunks content
3. Chunks stored in database
4. User asks a question
5. Relevant chunks retrieved
6. Sent to Groq LLM
7. AI generates contextual answer

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/shamanth74/DocuMind-AI.git
cd DocuMind-AI
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables

**Backend `.env`**

```env
DATABASE_URL=your_db_url
CLERK_SECRET_KEY=your_secret_key
ADMIN_EMAIL=your_admin_email
GROQ_API_KEY=your_groq_key
```

**Frontend `.env`**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

---

## 📸 Demo

- Dashboard with workspaces
- Document viewer (PDF + text)
- AI chatbot querying documents
- Upload & download system

> *(Add screenshots here for best impact)*

---

## 🧠 Engineering Highlights

- Designed modular RAG pipeline (chunk → retrieve → generate)
- Implemented secure token-based API layer with Clerk
- Built scalable file storage system
- Optimized AI queries for performance and cost
- Ensured data integrity with cascading deletes

---

## 🚀 Future Improvements (V2)

- 👑 Multiple Admins per workspace
- 🧑‍💼 Sub-admin roles & permissions
- 💳 Subscription & billing system
- 🔎 Semantic search using embeddings (vector DB)
- 💬 Chat history & memory
- 📊 Analytics dashboard
- ☁️ Cloud storage (AWS S3 / GCP)
- ⚡ Streaming AI responses

---

## 🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.


## 👨‍💻 Author

**Shamanth M** <br>
Contact - shamanthm.work@gmail.com
