'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '../utils/api';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSummarizer, setShowSummarizer] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showChatbot) {
          closeChatbot();
        }
        if (showSummarizer) {
          closeSummarizer();
        }
      }
    };

    if (showChatbot || showSummarizer) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [showChatbot, showSummarizer]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  const openChatbot = () => {
    setShowChatbot(true);
  };

  const closeChatbot = () => {
    setShowChatbot(false);
  };

  const openSummarizer = () => {
    setShowSummarizer(true);
  };

  const closeSummarizer = () => {
    setShowSummarizer(false);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      {/* Blurred content */}
      <div className={`layout-container flex h-full grow flex-col transition-all duration-300 ${(showChatbot || showSummarizer) ? 'filter blur-md pointer-events-none select-none' : ''}`}>
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <img src="/scales.svg" alt="Nyayasathi Logo" width={28} height={28} style={{ display: 'block' }} />
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Nyayasathi</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              {/* Removed About and Contact links */}
            </div>
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-[#0d141c] text-sm font-medium">
                  Welcome, {user?.user_type === 'cop' ? `Cop ${user?.cop_id}` : user?.first_name || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#248bf3] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Login</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </header>
        
        <div className="px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-6 pt-6">
              Welcome to Nyayasathi
            </h1>
            <p className="text-[#0d141c] text-base font-normal leading-normal pb-8 pt-1 px-4 text-center max-w-[800px] mx-auto">
              Nyayasathi is a trusted platform for registering legal complaints and more. Choose a zone to get started. <br />Note: Cop zone is not for common / non uniform personels
            </p>

            {isLoggedIn ? (
              // Show cards centered, with two or three columns depending on user type
              <div className="flex justify-center w-full">
                <div className={`grid gap-8 w-full max-w-6xl items-stretch ${user?.user_type === 'cop' ? 'lg:grid-cols-3 sm:grid-cols-2 grid-cols-1' : 'sm:grid-cols-3 grid-cols-1'}`}> 
                  {/* User Zone Card (only for users) */}
                  {user?.user_type === 'user' && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 flex flex-col items-center text-center h-full min-w-[300px]">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">User Zone</h2>
                      <p className="text-gray-600 mb-6">Submit complaints and track their status</p>
                      <div className="space-y-4 w-full flex flex-col items-center">
                        <Link href="/submit-complaint">
                          <button className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors max-w-xs mx-auto">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Submit New Complaint
                          </button>
                        </Link>
                        <Link href="/complaints">
                          <button className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors max-w-xs mx-auto">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View My Complaints
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {/* Cop Zone Card (only for cops) */}
                  {user?.user_type === 'cop' && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 flex flex-col items-center text-center h-full min-w-[300px]">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Cop Zone</h2>
                      <p className="text-gray-600 mb-6">Review and manage all submitted complaints</p>
                      <div className="space-y-4 w-full flex flex-col items-center">
                        <Link href="/complaints">
                          <button className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors max-w-xs mx-auto">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Review All Complaints
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {/* Summarizer Card */}
                  <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 flex flex-col items-center text-center h-full min-w-[300px]">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 18h16" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal Document Summarizer</h2>
                    <p className="text-gray-600 mb-6">Upload a legal document to extract key information and summary</p>
                    <div className="space-y-4 w-full flex flex-col items-center">
                      <button 
                        onClick={openSummarizer}
                        className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors max-w-xs mx-auto"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 18h16" />
                        </svg>
                        Summarize Legal Document
                      </button>
                    </div>
                  </div>
                  {/* Legal Chatbot Card */}
                  <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-200 flex flex-col items-center text-center h-full min-w-[300px]">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {/* Scales of justice icon */}
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v16m0 0c-4 0-7-3-7-7m7 7c4 0 7-3 7-7m-7 7v-4m-4 0h8" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal Chatbot</h2>
                    <p className="text-gray-600 mb-6">Ask any legal question and get instant answers.</p>
                    <div className="space-y-4 w-full flex flex-col items-center">
                      <button 
                        onClick={openChatbot}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors max-w-xs mx-auto"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        </svg>
                        Open Legal Chatbot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Not logged in - show zone selection
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {/* User Zone */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">User Zone</h2>
                    <p className="text-gray-600 mb-6">Submit complaints and track their status</p>
                  </div>
                  <div className="space-y-4">
                    <Link href="/login?zone=user">
                      <button className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login as User
                      </button>
                    </Link>
                    <Link href="/register?zone=user">
                      <button className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Register as User
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Cop Zone */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cop Zone</h2>
                    <p className="text-gray-600 mb-6">Review and manage all submitted complaints</p>
                  </div>
                  <div className="space-y-4">
                    <Link href="/login?zone=cop">
                      <button className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login as Cop
                      </button>
                    </Link>
                    <Link href="/register?zone=cop">
                      <button className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Register as Cop
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chatbot Modal rendered outside blurred content */}
      {showChatbot && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent"
          onClick={closeChatbot}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
              onClick={closeChatbot}
            >
              ×
            </button>
            <ChatbotModal />
          </div>
        </div>
      )}

      {/* Summarizer Modal rendered outside blurred content */}
      {showSummarizer && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent"
          onClick={closeSummarizer}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
              onClick={closeSummarizer}
            >
              ×
            </button>
            <SummarizerModal />
          </div>
        </div>
      )}
    </div>
  );
}

// Chatbot Modal Component
function ChatbotModal() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError("");
    setLoading(true);
    const userMsg = { role: "user", text: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/legal-chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: JSON.stringify({ 
          question: userMsg.text, 
          model: "llama-3.1-8b-instant" 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChat((prev) => [...prev, { role: "bot", text: data.answer }]);
      } else {
        throw new Error(data.error || "Failed to get answer");
      }
    } catch (err) {
      setError(err.message || "Failed to get answer. Please try again.");
      setChat((prev) => [...prev, { role: "bot", text: "[Error: Could not get answer]" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-center text-[#0d141c] mb-2 pr-8">🤖 Legal Chatbot</h2>
      <p className="text-base text-center text-[#0d141c] mb-4">Ask any legal question and get instant answers.</p>
      <div className="flex-1 overflow-y-auto mb-4 max-h-96 bg-slate-100 rounded p-3 border border-slate-200">
        {chat.length === 0 && (
          <div className="text-gray-600 text-center text-base"></div>
        )}
        {chat.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-[80%] text-base font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#18181b] border border-gray-300'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border border-gray-400 rounded px-3 py-3 text-base focus:outline-blue-500 text-[#18181b] bg-white"
          placeholder="Type your legal question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="px-6 py-3 rounded bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 transition"
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
      {error && <div className="mt-2 p-2 rounded bg-red-100 text-red-700 text-base">{error}</div>}
    </div>
  );
}

// Summarizer Modal Component
function SummarizerModal() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
    setError("");
    setDocumentText("");
    setQuestion("");
    setAnswer("");
    setQaError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setLoading(true);
    setSummary("");
    setError("");
    setDocumentText("");
    setQuestion("");
    setAnswer("");
    setQaError("");
    const formData = new FormData();
    formData.append("file", file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/summarize-legal-document/`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        // Save the extracted document text for Q&A
        if (data.original_text) {
          setDocumentText(data.original_text);
        } else if (data.text) {
          setDocumentText(data.text);
        } else {
          // fallback: use summary if no text is returned (not ideal)
          setDocumentText(data.summary);
        }
      } else {
        throw new Error(data.error || "Failed to summarize document");
      }
    } catch (err) {
      setError(err.message || "Failed to summarize document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    setQaLoading(true);
    setQaError("");
    setAnswer("");
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/ask-legal-document/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: JSON.stringify({
          document_text: documentText,
          question: question,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswer(data.answer);
      } else {
        throw new Error(data.error || "Failed to get answer");
      }
    } catch (err) {
      setQaError(err.message || "Failed to get answer. Please try again.");
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-2xl font-bold text-center text-[#0d141c] mb-2 pr-8">📄 Legal Document Summarizer</h2>
      <p className="text-sm text-center text-[#0d141c]">Upload a legal document (PDF, DOCX, or TXT) to extract key information and summary.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-base font-semibold text-[#18181b] mb-1">Choose file:</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="w-full text-base border border-gray-400 rounded px-3 py-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 px-5 rounded-lg bg-[#248bf3] text-white font-bold hover:bg-blue-600 transition duration-200"
        >
          {loading ? "Summarizing..." : "Summarize Document"}
        </button>
      </form>
      {error && (
        <div className="mt-2 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
      )}
      {summary && (
        <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50 text-sm space-y-1">
          <h3 className="font-bold mb-2 text-green-800">Summary:</h3>
          <pre className="whitespace-pre-wrap text-[#0d141c]">{summary}</pre>
        </div>
      )}
      {/* Q&A Section */}
      {summary && documentText && (
        <div className="mt-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
          <h3 className="font-bold mb-2 text-blue-800">Ask a question about this document:</h3>
          <form onSubmit={handleAsk} className="flex flex-col gap-3">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Type your question..."
              className="w-full px-3 py-2 rounded border border-blue-200 focus:outline-blue-400"
              required
            />
            <button
              type="submit"
              disabled={qaLoading || !question}
              className="w-full h-10 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {qaLoading ? "Getting answer..." : "Ask"}
            </button>
          </form>
          {qaError && (
            <div className="mt-2 p-2 rounded bg-red-100 text-red-700 text-sm">{qaError}</div>
          )}
          {answer && (
            <div className="mt-4 p-3 rounded bg-green-100 text-green-900 text-sm">
              <span className="font-bold">Answer:</span> {answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
