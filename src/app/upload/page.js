"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from '../../utils/api';

export default function UploadPage() {
  const [audio, setAudio] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const audioChunks = useRef([]);

  // Audio recording handlers
  const startRecording = async () => {
    setResponse(null);
    setAudio(null);
    setAudioURL("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudio(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audio) {
      alert("Please select or record an audio file.");
      return;
    }
    const formData = new FormData();
    formData.append("audio", audio, audio.name || "recorded_audio.webm");
    formData.append("name", name);
    formData.append("location", location);
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/transcribe/`, formData);
      setResponse(res.data);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-xl p-6 space-y-6 border border-[#e7edf4]">
        <h2 className="text-2xl font-bold text-center text-[#0d141c]">🎙️ Submit Complaint</h2>
        <p className="text-sm text-center text-[#0d141c]">Upload or record your voice message and let Nyayasathi handle the rest.</p>
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-[#e7edf4] focus:outline-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Your Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-[#e7edf4] focus:outline-blue-500"
            required
          />
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#18181b]">Upload audio file:</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                setAudio(e.target.files[0]);
                setAudioURL("");
                setResponse(null);
              }}
              className="w-full text-base border border-gray-400 rounded px-3 py-2 bg-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#18181b]">Or record audio:</label>
            <div className="flex gap-2 items-center">
              {!recording ? (
                <button type="button" onClick={startRecording} className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition">Record</button>
              ) : (
                <button type="button" onClick={stopRecording} className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition">Stop</button>
              )}
              {audioURL && (
                <audio src={audioURL} controls className="ml-2" />
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 px-5 rounded-lg bg-[#248bf3] text-white font-bold hover:bg-blue-600 transition duration-200"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
        {response && (
          <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50 text-base space-y-1">
            <p><strong>Transcript:</strong> {response.transcript}</p>
            <p><strong>Detected Language:</strong> {response.detected_language}</p>
            <p><strong>Translated Text:</strong> {response.translated_text}</p>
            <p><strong>Emotion:</strong> {response.emotion}</p>
            <p><strong>Priority:</strong> {response.priority}</p>
            <p><strong>Threat Level:</strong> {response.threat_level}</p>
            <p><strong>Requires Immediate Attention:</strong> {response.requires_immediate_attention ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
