'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TextComplaintPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [assignedPriority, setAssignedPriority] = useState('');
  const [threatLevel, setThreatLevel] = useState('');
  const [riskFactors, setRiskFactors] = useState([]);
  const [requiresImmediateAttention, setRequiresImmediateAttention] = useState(false);
  const [language, setLanguage] = useState('');
  const [languageStatus, setLanguageStatus] = useState(''); // 'success' | 'error' | ''
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exactKeywords, setExactKeywords] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

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

  // Language detection API call
  const detectLanguage = async (text) => {
    if (!text || text.trim().length < 3) {
      setLanguage('');
      setLanguageStatus('');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/detect-language/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (response.ok && data.language && data.language !== 'unknown') {
        setLanguage(data.language);
        setLanguageStatus('success');
      } else {
        setLanguage('');
        setLanguageStatus('error');
      }
    } catch {
      setLanguage('');
      setLanguageStatus('error');
    }
  };

  // Detect language as user types
  useEffect(() => {
    detectLanguage(formData.content);
  }, [formData.content]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Debug: log what is being sent
    console.log('Submitting content:', formData.content);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/complaints/text/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setDetectedEmotion(data.emotion);
        setAssignedPriority(data.priority);
        setThreatLevel(data.threat_level);
        setRiskFactors(data.risk_factors || []);
        setExactKeywords(data.exact_keywords || []);
        setRequiresImmediateAttention(data.requires_immediate_attention);
        setSuccess('Complaint submitted successfully!');
        setLanguage(data.language || '');
        setLanguageStatus(data.language && data.language !== 'unknown' ? 'success' : 'error');
        setShowSuccess(true);
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
              {showSuccess ? null : (
                <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Register Text Complaint</h1>
              )}
            </div>
            
            {error && (
              <div className="px-4 py-3">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            )}

            {!showSuccess && success && (
              <div className="px-4 py-3">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Only show form fields if not submitted */}
              {!showSuccess && (
                <>
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
                  <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Complaint Details</h2>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Complaint Text</p>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Write your complaint here..."
                        className="form-input flex w-full min-w-0 flex-1 overflow-y-auto rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] min-h-36 max-h-64 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                        required
                      />
                    </label>
                  </div>
                  {/* Language detection intimation */}
                  {languageStatus === 'success' && (
                    <div className="px-4 pb-2 text-green-700 text-sm">Language detected: <b>{language}</b></div>
                  )}
                  {languageStatus === 'error' && (
                    <div className="px-4 pb-2 text-red-700 text-sm">Language could not be detected. Please try again.</div>
                  )}
                  <div className="flex px-4 py-3 justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#248bf3] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
                    >
                      <span className="truncate">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
            {showSuccess && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 mt-6">
                <h1 className="text-[#0d141c] tracking-light text-[32px] font-normal w-full text-center mb-2">Text Complaint Received</h1>
                <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded text-xl max-w-xl w-full text-center">
                  We have received your complaint. Your issue is our priority and will be addressed as soon as possible.
                </div>
                <Link href="/complaints">
                  <button className="flex min-w-[180px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-green-600 text-slate-50 text-lg font-bold leading-normal tracking-[0.015em] hover:bg-green-700">
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