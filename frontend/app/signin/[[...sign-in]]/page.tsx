"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="h-screen w-full flex overflow-hidden antialiased selection:bg-neutral-200 selection:text-neutral-900">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 illustration-gradient border-r border-neutral-100 flex-col items-center justify-center p-12">
        <div className="max-w-md w-full text-center">
          <div className="mb-10 inline-flex items-center justify-center w-20 h-20 bg-neutral-900 rounded-2xl text-white shadow-xl rotate-3 transition-transform hover:rotate-0 duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
            The intelligence layer for your documents.
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Connect your team&apos;s knowledge, automate workflows, and find answers across your entire workspace in seconds.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white border border-neutral-100 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <p className="text-sm font-medium text-neutral-900">Enterprise Secure</p>
              <p className="text-xs text-neutral-500 mt-1">End-to-end encryption for all your sensitive files.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-neutral-100 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <p className="text-sm font-medium text-neutral-900">Real-time Insights</p>
              <p className="text-xs text-neutral-500 mt-1">AI that learns your business context instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Clerk SignIn */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white overflow-y-auto">
        {/* Mobile Header */}
        <header className="h-14 flex items-center justify-between px-8 shrink-0 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <span className="font-medium text-sm">DocuMind AI</span>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Welcome back</h2>
              <p className="text-sm text-neutral-500 mt-2">Sign in to access your workspace</p>
            </div>

            {/* Clerk SignIn Component */}
            <SignIn
              forceRedirectUrl="/dashboard"
              signUpForceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0 w-full",
                },
              }}
            />

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-neutral-50">
              <p className="text-[10px] text-center text-neutral-400 leading-relaxed">
                By signing in, you agree to our{" "}
                <a href="#" className="hover:text-neutral-600 transition-colors">Terms of Service</a> and{" "}
                <a href="#" className="hover:text-neutral-600 transition-colors">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>

        <footer className="p-8 flex justify-center gap-6 shrink-0">
          <span className="text-xs text-neutral-400">© 2024 DocuMind AI</span>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Status</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Help Center</a>
          </div>
        </footer>
      </div>
    </div>
  );
}