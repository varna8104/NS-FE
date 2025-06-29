"use client";

import { useState, useRef } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const sendMessage = async () => {
    if (!input && !file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("message", input);
    if (file) formData.append("document", file);
    const res = await fetch("/api/chatbot/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setMessages([...messages, { user: input, bot: data.answer }]);
    setInput("");
    setFile(null);
    fileInputRef.current.value = null;
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white shadow-xl rounded-lg border border-gray-200 z-50 flex flex-col">
      <div className="p-4 border-b font-bold text-lg bg-blue-50 rounded-t-lg">Nyayasathi Chatbot</div>
      <div className="flex-1 p-4 overflow-y-auto max-h-80 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className="text-right text-blue-700 font-medium">{msg.user}</div>
            <div className="text-left text-gray-800 bg-gray-100 rounded p-2 mt-1">{msg.bot}</div>
          </div>
        ))}
        {loading && <div className="text-gray-400">Thinking...</div>}
      </div>
      <div className="p-3 border-t flex flex-col gap-2">
        <input
          className="border rounded px-3 py-2 mb-1 w-full"
          placeholder="Type your question or request..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="mb-1"
          onChange={e => setFile(e.target.files[0])}
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 w-full font-semibold disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || (!input && !file)}
        >
          Send
        </button>
      </div>
    </div>
  );
} 