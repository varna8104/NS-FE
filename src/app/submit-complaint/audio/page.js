'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AudioComplaintPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [assignedPriority, setAssignedPriority] = useState('');
  const [threatLevel, setThreatLevel] = useState('');
  const [riskFactors, setRiskFactors] = useState([]);
  const [requiresImmediateAttention, setRequiresImmediateAttention] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exactKeywords, setExactKeywords] = useState([]);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const audioChunks = useRef([]);
  const router = useRouter();

  // Language code to full name mapping
  const languageNames = {
    en: 'English',
    hi: 'Hindi',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    mr: 'Marathi',
    bn: 'Bengali',
    gu: 'Gujarati',
    pa: 'Punjabi',
    ur: 'Urdu',
    or: 'Odia',
    // Add more as needed
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setAudioURL("");
    } else {
      setError('Please select a valid audio file');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Audio recording handlers
  const startRecording = async () => {
    setError("");
    setAudioFile(null);
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
        setAudioFile(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const deleteRecording = () => {
    if (recording && mediaRecorder) {
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
      setRecording(false);
    }
    setAudioFile(null);
    setAudioURL("");
    setMediaRecorder(null);
    audioChunks.current = [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select or record an audio file');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('audio', audioFile, audioFile.name || 'recorded_audio.webm');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('location', formData.location);

      const response = await fetch('http://localhost:8000/api/complaints/audio/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        setDetectedLanguage(data.detected_language || data.language);
        setTranscribedText(data.transcript || data.content);
        setTranslatedText(data.translated_text || '');
        setDetectedEmotion(data.emotion);
        setAssignedPriority(data.priority);
        setThreatLevel(data.threat_level);
        setRiskFactors(data.risk_factors || []);
        setExactKeywords(data.exact_keywords || []);
        setRequiresImmediateAttention(data.requires_immediate_attention);
        if (data.error && data.error.toLowerCase().includes('duplicate')) {
          setError(data.error);
          setSuccess('');
        } else {
          setError(data.error || 'Failed to submit complaint');
          setSuccess('Audio complaint submitted successfully!');
        }
      } else {
        const data = await response.json();
        if (data.error && data.error.includes('similar complaint has already been submitted')) {
          setError(`Duplicate complaint detected. ${data.error} ${data.duplicate_complaint_id ? `(Complaint ID: ${data.duplicate_complaint_id})` : ''}`);
        } else {
          setError(data.error || 'Failed to submit complaint');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatLevelColor = (threatLevel) => {
    switch (threatLevel) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  const toTitleCase = (str) => {
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  if (!isLoggedIn) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <img src="/scales.svg" alt="Nyayasathi Logo" width={28} height={28} style={{ display: 'block' }} />
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Nyayasathi</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link href="/" className="text-[#0d141c] text-sm font-medium leading-normal">Home</Link>
              <Link href="/complaints" className="text-[#0d141c] text-sm font-medium leading-normal">Complaints</Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#0d141c] text-sm font-medium">Welcome, {user?.first_name || user?.username}</span>
            </div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Register Audio Complaint</h1>
            </div>
            
            {error && (
              <div className="px-4 py-3">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="px-4 py-3">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  We have received your complaint. Your issue is our priority and will be addressed as soon as possible.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Complainant Name</p>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                    required
                  />
                </label>
              </div>
              
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Location</p>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                    required
                  />
                </label>
              </div>

              <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Audio Upload</h2>
              
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Audio File</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                  />
                </label>
              </div>
              
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Or record audio</p>
                  <div className="flex gap-2 items-center">
                    {!recording ? (
                      <button type="button" onClick={startRecording} className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition">Record</button>
                    ) : (
                      <button type="button" onClick={stopRecording} className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition">Stop</button>
                    )}
                    {audioURL && (
                      <>
                        <audio src={audioURL} controls className="ml-2" />
                        <button type="button" onClick={deleteRecording} className="ml-2 px-3 py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition">Delete</button>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              {success && (
                <>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex flex-col min-w-40 flex-1">
                      <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Detected Emotion</p>
                      <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                          value={detectedEmotion}
                          readOnly
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                        />
                        <div className="text-[#49739c] flex border border-[#cedbe8] bg-slate-50 items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M232,128a104,104,0,0,1-208,0c0-41,23.81-78.36,60.66-95.27a8,8,0,0,1,6.68,14.54C60.15,61.59,40,93.27,40,128a88,88,0,0,0,176,0c0-34.73-20.15-66.41-51.34-80.73a8,8,0,0,1,6.68-14.54C208.19,49.64,232,87,232,128Z"></path>
                          </svg>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Assigned Priority</p>
                      <input
                        value={assignedPriority}
                        readOnly
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal ${getPriorityColor(assignedPriority)}`}
                      />
                    </label>
                  </div>

                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Threat Level</p>
                      <input
                        value={threatLevel}
                        readOnly
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal ${getThreatLevelColor(threatLevel)}`}
                      />
                    </label>
                  </div>

                  {riskFactors.length > 0 && (
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Risk Factors Detected</p>
                        <div className="flex flex-wrap gap-2 p-3 border border-[#cedbe8] bg-slate-50 rounded-lg">
                          {riskFactors.map((factor, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {toTitleCase(factor)}
                            </span>
                          ))}
                        </div>
                        {exactKeywords.length > 0 && (
                          <div className="mt-2">
                            <div className="text-[#0d141c] text-sm font-medium pb-1">Keywords Detected in Complaint:</div>
                            <div className="flex flex-wrap gap-2">
                              {exactKeywords.map((keyword, idx) => (
                                <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  )}

                  {requiresImmediateAttention && (
                    <div className="px-4 py-3">
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        ⚠️ This complaint requires immediate attention due to detected threats or serious concerns.
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex px-4 py-3 justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#248bf3] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
                >
                  <span className="truncate">{isSubmitting ? 'Processing...' : 'Submit'}</span>
                </button>
              </div>
            </form>

            {success && !error && (
              <div className="flex justify-end px-4 py-3">
                <Link href="/complaints">
                  <button className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-green-600 text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700">
                    View Complaints
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 