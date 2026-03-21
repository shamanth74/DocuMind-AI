"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <span className="font-medium text-sm tracking-tight text-neutral-900">DocuMind AI</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          ← Back to Dashboard
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xl w-full">
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6 border border-neutral-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">About DocuMind AI</h1>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              The intelligence layer for your documents.
            </p>

            <div className="space-y-4 text-sm text-neutral-600 leading-relaxed">
              <p>
                DocuMind AI is a collaborative document management platform that brings AI-powered intelligence to your workspace.
                Upload PDFs and text documents, and let our AI assistant help you find answers instantly.
              </p>
              <p>
                Organize your work into workspaces, invite team members with unique invite codes,
                and query your documents using natural language — all from a clean, modern interface.
              </p>

              <div className="pt-4 border-t border-neutral-100">
                <h2 className="font-semibold text-neutral-900 mb-3">Key Features</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span><strong className="text-neutral-800">AI-Powered Chat</strong> — Ask questions about your uploaded documents and get instant, context-aware answers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span><strong className="text-neutral-800">Workspace Management</strong> — Create workspaces, manage documents, and invite team members.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span><strong className="text-neutral-800">Document Viewer</strong> — View PDFs and text documents directly in the browser with download support.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span><strong className="text-neutral-800">Secure Access</strong> — Role-based access control with Clerk authentication.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
