"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  getDocuments, getWorkspaces, askAI, uploadDocument, createTextDocument, getCurrentUser,
  type Document, type Workspace, type User
} from "@/services/api";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const workspaceId = Number(params.id);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "text">("file");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Invite copy state
  const [copied, setCopied] = useState(false);

  // AI Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "super_admin";

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch user role
        const userData = await getCurrentUser(getToken);
        setUser(userData);

        const allWs = await getWorkspaces(getToken);
        const ws = allWs.find(w => w.id === workspaceId);
        if (ws) setWorkspace(ws);

        const docs = await getDocuments(getToken, workspaceId);
        setDocuments(docs);
        if (docs.length > 0) setSelectedDoc(docs[0]);
      } catch (err: any) {
        if (err?.status === 401) { router.push("/signin"); return; }
        console.error("Workspace load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspaceId, getToken, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  // ── Refresh documents ──
  const refreshDocs = async () => {
    const docs = await getDocuments(getToken, workspaceId);
    setDocuments(docs);
  };

  // ── File Upload ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Only .pdf files are allowed");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      await uploadDocument(getToken, file, workspaceId);
      setUploadSuccess("File uploaded successfully!");
      await refreshDocs();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => { setUploadModalOpen(false); setUploadSuccess(""); }, 1200);
    } catch (err: any) {
      let detail = "Upload failed";
      try { detail = JSON.parse(err?.message)?.detail || detail; } catch { /* ignore */ }
      setUploadError(typeof detail === "string" ? detail : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Text Document Creation ──
  const handleTextUpload = async () => {
    if (!isAdmin) return;
    if (!textTitle.trim() || !textContent.trim()) {
      setUploadError("Title and content are required");
      return;
    }
    const wordCount = textContent.trim().split(/\s+/).length;
    if (wordCount < 20) {
      setUploadError(`Content must be at least 20 words (currently ${wordCount})`);
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      await createTextDocument(getToken, textTitle.trim(), textContent.trim(), workspaceId);
      setUploadSuccess("Text document created successfully!");
      setTextTitle("");
      setTextContent("");
      await refreshDocs();
      setTimeout(() => { setUploadModalOpen(false); setUploadSuccess(""); }, 1200);
    } catch (err: any) {
      let detail = "Creation failed. Ensure content has enough text (at least 20 words).";
      try { detail = JSON.parse(err?.message)?.detail || detail; } catch { /* ignore */ }
      setUploadError(typeof detail === "string" ? detail : "Creation failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Copy invite code ──
  const handleCopyCode = async () => {
    if (!workspace?.invite_code) return;
    await navigator.clipboard.writeText(workspace.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── AI Chat ──
  const handleAskAI = async () => {
    const q = question.trim();
    if (!q || aiLoading) return;

    setMessages(prev => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setAiLoading(true);

    try {
      const res = await askAI(getToken, workspaceId, q);
      setMessages(prev => [...prev, { role: "ai", content: res.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Something went wrong. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setQuestion("");
  };

  const handleQuickAction = (text: string) => {
    setQuestion(text);
  };

  const wsName = workspace?.name || "Workspace";
  const wsInitials = workspace ? getInitials(workspace.name) : "WS";

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-neutral-500 text-sm">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-neutral-900 antialiased selection:bg-neutral-200 selection:text-neutral-900">
      {/* Header */}
      <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-5 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
          </Link>
          <div className="h-4 w-[1px] bg-neutral-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500">{wsInitials}</div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">{wsName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition-colors"
          >
            {copied ? "Copied!" : "Invite"}
          </button>
          <UserButton />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Left Sidebar - Documents */}
        <aside className="w-72 border-r border-neutral-200 flex flex-col bg-[#fafafa] shrink-0">
          <div className="p-4 flex flex-col h-full">
            <div className="mb-6">
              <h3 className="px-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Documents</h3>
              <div className="space-y-1">
                {documents.length === 0 ? (
                  <p className="px-2 text-xs text-neutral-400">No documents yet</p>
                ) : (
                  documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        console.log("selectedDocument", doc);
                        setSelectedDoc(doc);
                      }}
                      className={`w-full flex items-center gap-3 px-2 py-1.5 text-sm font-medium rounded-md ${selectedDoc?.id === doc.id ? "bg-neutral-200/60 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${selectedDoc?.id === doc.id ? "text-neutral-500" : "text-neutral-400"}`}>
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))
                )}
              </div>
              {/* Upload button - admin only */}
              {isAdmin && (
                <button
                  onClick={() => { setUploadModalOpen(true); setUploadError(""); setUploadSuccess(""); }}
                  className="mt-3 w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Upload document
                </button>
              )}
            </div>

            <div className="mt-auto border-t border-neutral-200 pt-6 pb-2">
              <h3 className="px-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Workspace Info</h3>
              <div className="px-2 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-neutral-500">Invite Code: <span className="font-semibold text-neutral-700">{workspace?.invite_code || "—"}</span></p>
                  <button
                    onClick={handleCopyCode}
                    className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors"
                    title="Copy invite code"
                  >
                    {copied ? "✓" : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-500">Documents: <span className="font-semibold text-neutral-700">{documents.length}</span></p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Document View */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              {selectedDoc ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{selectedDoc.title}</h1>
                      <p className="text-sm text-neutral-500 mt-1">
                        {selectedDoc.file_type.toUpperCase()} • Created {new Date(selectedDoc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedDoc.file_url && (
                        <button
                          onClick={() => window.open(`http://localhost:8000${selectedDoc.file_url}`, "_blank")}
                          title="Download"
                          className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Document Content */}
                  {selectedDoc.file_type === "pdf" && selectedDoc.file_url ? (
                    <iframe
                      src={`http://localhost:8000${selectedDoc.file_url}`}
                      className="w-full rounded-xl border border-neutral-100"
                      style={{ height: "calc(100vh - 220px)" }}
                      title={selectedDoc.title}
                    />
                  ) : selectedDoc.file_type === "raw_text" && selectedDoc.content ? (
                    <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 220px)" }}>
                      <pre className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans">{selectedDoc.content}</pre>
                    </div>
                  ) : selectedDoc.file_type === "text" && selectedDoc.file_url ? (
                    <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 220px)" }}>
                      <p className="text-sm text-neutral-600 mb-3">Text file — <a href={`http://localhost:8000${selectedDoc.file_url}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900">View raw file</a></p>
                      <p className="text-sm text-neutral-500">Use the AI chat to ask questions about this document.</p>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span className="text-sm font-semibold text-neutral-700">{selectedDoc.file_type.toUpperCase()} Document</span>
                      </div>
                      <p className="text-sm text-neutral-600">
                        This document has been indexed by the AI assistant. Use the chat panel on the right to ask questions about its content.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <p className="text-neutral-500 text-sm mt-4">No documents in this workspace yet</p>
                  <p className="text-neutral-400 text-xs mt-1">Upload a document to get started</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - AI Chat */}
        <aside className="w-96 border-l border-neutral-200 flex flex-col bg-white shrink-0">
          <div className="h-14 border-b border-neutral-100 flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              <span className="text-sm font-semibold">Workspace AI</span>
            </div>
            <button onClick={handleClearChat} className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">Clear chat</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* AI Welcome */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex-shrink-0 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              </div>
              <div className="bg-neutral-100 rounded-2xl rounded-tl-none p-3.5 text-sm text-neutral-800 leading-relaxed shadow-sm">
                Hello! I&apos;ve indexed the documents in <span className="font-semibold italic">{wsName}</span>. How can I help you today?
              </div>
            </div>

            {/* Chat Messages */}
            {messages.map((msg, i) => (
              msg.role === "user" ? (
                <div key={i} className="flex gap-3 flex-row-reverse">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200 flex-shrink-0 flex items-center justify-center text-neutral-600 text-[10px] font-bold">You</div>
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3.5 text-sm leading-relaxed shadow-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 flex-shrink-0 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  </div>
                  <div className="bg-neutral-100 rounded-2xl rounded-tl-none p-3.5 text-sm text-neutral-800 leading-relaxed shadow-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              )
            ))}

            {/* Thinking indicator */}
            {aiLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 flex-shrink-0 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                </div>
                <div className="bg-neutral-100 rounded-2xl rounded-tl-none p-3.5 text-sm text-neutral-500 leading-relaxed shadow-sm animate-pulse">
                  Thinking...
                </div>
              </div>
            )}

            {/* Quick Actions (only show when no messages yet) */}
            {messages.length === 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                <button onClick={() => handleQuickAction("Summarize this doc")} className="px-3 py-1.5 border border-neutral-200 rounded-full text-xs text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-all">Summarize this doc</button>
                <button onClick={() => handleQuickAction("Find key dates")} className="px-3 py-1.5 border border-neutral-200 rounded-full text-xs text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-all">Find key dates</button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-neutral-100">
            <div className="relative">
              <textarea
                placeholder="Ask anything about this workspace..."
                rows={1}
                value={question || ""}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 pr-12 resize-none custom-scrollbar"
              />
              <button
                onClick={handleAskAI}
                disabled={aiLoading || !question.trim()}
                className="absolute right-2 top-1.5 p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polyline points="22 2 15 22 11 13 2 9 22 2"></polyline></svg>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Upload Modal - only rendered for admin */}
      {isAdmin && uploadModalOpen && (
        <>
          <div className="fixed inset-0 bg-neutral-900/20 backdrop-blur-[2px] z-50 transition-opacity duration-200 ease-out" onClick={() => setUploadModalOpen(false)}></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 transition-all duration-200 ease-out">
            <div className="bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold text-neutral-900">Upload Document</h2>
                <button onClick={() => setUploadModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-md hover:bg-neutral-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex border-b border-neutral-100">
                <button
                  onClick={() => { setUploadTab("file"); setUploadError(""); }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${uploadTab === "file" ? "text-neutral-900 border-b-2 border-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                >
                  File Upload
                </button>
                <button
                  onClick={() => { setUploadTab("text"); setUploadError(""); }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${uploadTab === "text" ? "text-neutral-900 border-b-2 border-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                >
                  Text Input
                </button>
              </div>

              <div className="p-5">
                {uploadTab === "file" ? (
                  <div key="file-tab">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Choose a file</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 transition-all"
                    />
                    <p className="mt-2 text-xs text-neutral-500">Accepted: .pdf</p>
                  </div>
                ) : (
                  <div key="text-tab">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
                    <input
                      type="text"
                      value={textTitle || ""}
                      onChange={(e) => setTextTitle(e.target.value)}
                      placeholder="Document title"
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all mb-3"
                    />
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Content</label>
                    <textarea
                      value={textContent || ""}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Paste or type your content..."
                      rows={6}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all resize-none"
                    />
                  </div>
                )}

                {uploadError && <p className="mt-3 text-xs text-red-500">{uploadError}</p>}
                {uploadSuccess && <p className="mt-3 text-xs text-emerald-600">{uploadSuccess}</p>}
              </div>

              {uploadTab === "text" && (
                <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                  <button onClick={() => setUploadModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
                  <button
                    onClick={handleTextUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 disabled:opacity-50"
                  >
                    {uploading ? "Creating..." : "Create Document"}
                  </button>
                </div>
              )}

              {uploadTab === "file" && uploading && (
                <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 animate-pulse">Uploading...</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
