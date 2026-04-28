import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">ZENITH <span className="text-blue-500">AI</span></h1>
            <p className="text-gray-400 mt-2">Your Agentic Career & Productivity Partner</p>
          </div>
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-mono border border-green-500/20">AGENT ACTIVE</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Goal Guardian Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">Productivity Agent</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Goal Guardian</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">Agentic task negotiation. If you miss a deadline, the AI negotiates a reschedule and analyzes productivity patterns.</p>
            <Link href="/guardian" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors text-center">Launch Dashboard</Link>
          </div>

          {/* Interview Oasis Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-purple-500 tracking-widest uppercase">Multimodal AI</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Interview Oasis</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">Real-time voice mock interviews. Upload your resume and get live feedback from a hyper-realistic AI recruiter.</p>
            <Link href="/oasis" className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors text-center">Start Mock Interview</Link>
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>© 2026 Zenith AI Ecosystem • Built with LangGraph & Next.js</p>
        </footer>
      </div>
    </main>
  );
}
