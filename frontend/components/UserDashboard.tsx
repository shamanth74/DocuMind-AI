"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";

const DUMMY_WORKSPACES = [
  { id: 1, name: "Marketing Campaign 2024", initials: "MC", created: "Jan 12, 2024" },
  { id: 2, name: "Engineering Specs", initials: "ES", created: "Feb 04, 2024" },
  { id: 3, name: "Design System V2", initials: "DS", created: "Mar 15, 2024" },
  { id: 4, name: "Q3 Board Deck", initials: "QB", created: "Apr 01, 2024" },
  { id: 5, name: "Product Roadmap", initials: "PR", created: "May 20, 2024" },
  { id: 6, name: "Legal Contracts", initials: "LC", created: "Jun 10, 2024" },
];

export default function UserDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [workspaceCode, setWorkspaceCode] = useState("");

  const openModal = () => setModalOpen(true);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setWorkspaceCode("");
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [modalOpen, closeModal]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-neutral-900 antialiased selection:bg-neutral-200 selection:text-neutral-900">
      {/* Header */}
      <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-5 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-900 rounded-md flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="font-medium text-sm tracking-tight text-neutral-900">DocuMind AI</span>
        </div>
        <div className="flex items-center">
          <UserButton />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden bg-[#fafafa]">
        {/* Sidebar */}
        <aside className="w-60 border-r border-neutral-200 bg-white flex-col py-4 shrink-0 hidden md:flex z-0">
          <nav className="flex-1 px-3 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-neutral-100 text-neutral-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </a>

            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-200" onClick={openModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Join Workspace
            </a>

            <div className="pt-6 pb-2">
              <p className="px-3 text-xs font-semibold text-neutral-400 tracking-wider uppercase">Resources</p>
            </div>

            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              About
            </a>

            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
              </svg>
              Support
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8 md:p-10 lg:p-12">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Your Workspaces</h1>
              <p className="text-sm text-neutral-500 mt-1">Access and manage your joined workspaces</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {DUMMY_WORKSPACES.map((ws) => (
                <div key={ws.id} className="group bg-white border border-neutral-200 rounded-xl p-5 flex flex-col transition-all duration-200 ease-out hover:shadow-sm hover:-translate-y-[2px] hover:border-neutral-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                      <span className="text-neutral-500 font-medium text-sm">{ws.initials}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-neutral-900 text-base leading-tight">{ws.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1.5 flex-1">Created {ws.created}</p>
                  <button className="mt-6 w-full py-2 px-4 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200">
                    Enter Workspace
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <button onClick={openModal} className="fixed bottom-8 right-8 w-12 h-12 bg-neutral-900 text-white rounded-full shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-105 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 z-40 group" aria-label="Join Workspace">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:rotate-90">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-neutral-900/20 backdrop-blur-[2px] z-50 transition-opacity duration-200 ease-out" onClick={closeModal}></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4 transition-all duration-200 ease-out">
            <div className="bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold text-neutral-900">Join Workspace</h2>
                <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-md hover:bg-neutral-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-5">
                <label htmlFor="workspaceCode" className="block text-sm font-medium text-neutral-700 mb-1.5">Workspace Code</label>
                <input type="text" id="workspaceCode" placeholder="e.g. D9X-2B4" value={workspaceCode} onChange={(e) => setWorkspaceCode(e.target.value)} className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all" autoFocus />
                <p className="mt-2 text-xs text-neutral-500">Ask your workspace admin for the 6-character invite code.</p>
              </div>

              <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
                <button className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1">
                  Join Workspace
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
