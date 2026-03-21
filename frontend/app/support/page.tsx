"use client";

import Link from "next/link";

export default function SupportPage() {
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
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
              </svg>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">Support</h1>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Need help? We&apos;re here for you.
            </p>

            <div className="space-y-6">
              {/* Email */}
              <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <h2 className="font-semibold text-neutral-900 text-sm">Email Us</h2>
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  For any questions, feedback, or issues — reach out via email and we&apos;ll get back to you as soon as possible.
                </p>
                <a
                  href="mailto:shamanthm.work@gmail.com"
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  <span>shamanthm.work@gmail.com</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>

              {/* Response Time */}
              <div className="text-sm text-neutral-500 leading-relaxed">
                <p>We typically respond within 24–48 hours on business days.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
