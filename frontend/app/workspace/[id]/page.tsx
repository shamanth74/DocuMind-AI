"use client";

import { useParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const WORKSPACE_NAME = "Marketing Campaign 2024";
const WORKSPACE_INITIALS = "MC";

const DOCUMENTS = [
  { name: "Campaign Strategy.pdf", active: true },
  { name: "Q1 Budget Plan.xlsx", active: false },
  { name: "Asset Guidelines.pdf", active: false },
];

const ACTIVITY = [
  { initials: "AS", name: "Alex", action: "uploaded", target: "Ad_Brief.docx", time: "2m ago", color: "blue" },
  { initials: "MK", name: "Maria", action: "commented on", target: "Campaign Strategy", time: "1h ago", color: "emerald" },
  { initials: "AI", name: "DocuMind AI", action: "indexed 4 new documents", target: "", time: "3h ago", color: "neutral-900" },
];

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.id;

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
            <div className="w-7 h-7 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500">{WORKSPACE_INITIALS}</div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">{WORKSPACE_NAME}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-blue-600">AS</div>
            <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-emerald-600">MK</div>
            <div className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-orange-600">TH</div>
            <div className="w-7 h-7 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-neutral-500">+4</div>
          </div>
          <button className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition-colors">Invite</button>
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
                {DOCUMENTS.map((doc) => (
                  <button key={doc.name} className={`w-full flex items-center gap-3 px-2 py-1.5 text-sm font-medium rounded-md ${doc.active ? "bg-neutral-200/60 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={doc.active ? "text-neutral-500" : "text-neutral-400"}>
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    {doc.name}
                  </button>
                ))}
              </div>
              <button className="mt-3 w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Upload document
              </button>
            </div>

            <div className="mt-auto border-t border-neutral-200 pt-6 pb-2">
              <h3 className="px-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Activity Feed</h3>
              <div className="space-y-4 px-2 overflow-y-auto custom-scrollbar max-h-64">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold ${
                      item.color === "blue" ? "bg-blue-100 text-blue-600" :
                      item.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                      "bg-neutral-900 text-white"
                    }`}>{item.initials}</div>
                    <div className="text-[11px] leading-snug">
                      <span className="font-semibold text-neutral-900">{item.name}</span> {item.action} {item.target && <span className="text-neutral-600">{item.target}</span>}
                      <p className="text-neutral-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Document View */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Campaign Strategy.pdf</h1>
                  <p className="text-sm text-neutral-500 mt-1">Uploaded Jan 12, 2024 • 2.4 MB</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                  <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6 text-neutral-800 leading-relaxed">
                <h2 className="text-xl font-bold text-neutral-900">1. Executive Summary</h2>
                <p>The 2024 Global Marketing Campaign aims to increase brand awareness by 45% in key target markets. Our strategy focuses on multi-channel storytelling across digital platforms, specifically targeting Gen Z and Millennial demographics with personalized content experiences.</p>

                <h2 className="text-xl font-bold text-neutral-900 pt-4">2. Key Objectives</h2>
                <ul className="list-disc pl-5 space-y-3">
                  <li><span className="font-medium">Market Penetration:</span> Expand into EMEA regions with localized messaging.</li>
                  <li><span className="font-medium">User Acquisition:</span> Drive 1.2M new signups through viral referral loops.</li>
                  <li><span className="font-medium">Retention:</span> Improve Day-30 retention by 15% through educational onboarding.</li>
                </ul>

                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-6 mt-8">
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Budget Allocation</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Social Media Ads</span>
                      <span className="text-sm font-semibold">$450,000</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div className="bg-neutral-900 h-1.5 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Influencer Partnerships</span>
                      <span className="text-sm font-semibold">$250,000</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div className="bg-neutral-900 h-1.5 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
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
            <button className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">Clear chat</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* AI Welcome */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex-shrink-0 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              </div>
              <div className="bg-neutral-100 rounded-2xl rounded-tl-none p-3.5 text-sm text-neutral-800 leading-relaxed shadow-sm">
                Hello! I&apos;ve indexed the documents in <span className="font-semibold italic">{WORKSPACE_NAME}</span>. How can I help you today?
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-7 h-7 rounded-lg bg-neutral-200 flex-shrink-0 flex items-center justify-center text-neutral-600 text-[10px] font-bold">JD</div>
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3.5 text-sm leading-relaxed shadow-sm">
                What is the total budget for influencer partnerships?
              </div>
            </div>

            {/* AI Response */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex-shrink-0 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              </div>
              <div className="bg-neutral-100 rounded-2xl rounded-tl-none p-3.5 text-sm text-neutral-800 leading-relaxed shadow-sm">
                According to the <span className="font-semibold">Campaign Strategy.pdf</span>, the allocated budget for influencer partnerships is <span className="font-bold text-neutral-900">$250,000</span>, which represents approximately 35% of the primary spend categories listed.
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button className="px-3 py-1.5 border border-neutral-200 rounded-full text-xs text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-all">Summarize this doc</button>
              <button className="px-3 py-1.5 border border-neutral-200 rounded-full text-xs text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-all">Find key dates</button>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-neutral-100">
            <div className="relative">
              <textarea placeholder="Ask anything about this workspace..." rows={1} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 pr-12 resize-none custom-scrollbar"></textarea>
              <button className="absolute right-2 top-1.5 p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polyline points="22 2 15 22 11 13 2 9 22 2"></polyline></svg>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
