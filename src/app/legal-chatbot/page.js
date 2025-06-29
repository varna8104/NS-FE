"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function LegalChatbotPage() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]); // {role: 'user'|'bot', text: string}
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
      const res = await axios.post(
        "http://127.0.0.1:8000/api/complaints/legal-chatbot/",
        { question: userMsg.text, model: "llama-3.1-8b-instant" },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Token ${token}` }),
          },
        }
      );
      setChat((prev) => [...prev, { role: "bot", text: res.data.answer }]);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to get answer. Please try again."
      );
      setChat((prev) => [...prev, { role: "bot", text: "[Error: Could not get answer]" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-2xl p-6 flex flex-col border border-[#e7edf4]">
        <h2 className="text-2xl font-bold text-center text-[#0d141c] mb-2">🤖 Legal Chatbot</h2>
        <p className="text-base text-center text-[#0d141c] mb-4">Ask any legal question and get instant answers from Llama 3.1 8B.</p>
        <div className="flex-1 overflow-y-auto mb-4 max-h-96 bg-slate-100 rounded p-3 border border-slate-200">
          {chat.length === 0 && (
            <div className="text-gray-600 text-center text-base">No messages yet. Ask your first legal question!</div>
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
    </div>
  );
} 