"use client";

import { useState } from "react";
import axios from "axios";

export default function SummarizeLegalDocPage() {
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
      const res = await axios.post(
        "http://127.0.0.1:8000/api/complaints/summarize-legal-document/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Token ${token}` }),
          }
        }
      );
      setSummary(res.data.summary);
      // Save the extracted document text for Q&A
      if (res.data.original_text) {
        setDocumentText(res.data.original_text);
      } else if (res.data.text) {
        setDocumentText(res.data.text);
      } else {
        // fallback: use summary if no text is returned (not ideal)
        setDocumentText(res.data.summary);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to summarize document. Please try again."
      );
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
      const res = await axios.post(
        "http://127.0.0.1:8000/api/complaints/ask-legal-document/",
        {
          document_text: documentText,
          question: question,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Token ${token}` }),
          }
        }
      );
      setAnswer(res.data.answer);
    } catch (err) {
      setQaError(
        err.response?.data?.error || "Failed to get answer. Please try again."
      );
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-xl p-6 space-y-6 border border-[#e7edf4]">
        <h2 className="text-2xl font-bold text-center text-[#0d141c]">📄 Legal Document Summarizer</h2>
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
    </div>
  );
} 