'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '../../utils/api';

const PRIORITY_OPTIONS = ['all', 'high', 'medium', 'low'];
const EMOTION_OPTIONS = ['all', 'fear', 'anger', 'sadness', 'disgust', 'happy', 'neutral'];
const STATUS_OPTIONS = ['all', 'pending', 'under_review', 'reviewed', 'failed'];

export default function ComplaintsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isCop, setIsCop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      setIsCop(JSON.parse(userData).user_type === 'cop');
      fetchComplaints(token);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [showModal]);

  const fetchComplaints = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        setError('Failed to fetch complaints');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    setDeletingId(id);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        setComplaints((prev) => prev.filter((c) => c.id !== id));
      } else {
        setError('Failed to delete complaint');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    if (!reviewNotes.trim()) {
      // Set default messages based on status
      let defaultMessage = '';
      switch (newStatus) {
        case 'under_review':
          defaultMessage = 'Complaint marked for review. Investigation in progress.';
          break;
        case 'reviewed':
          defaultMessage = 'Complaint has been reviewed and processed.';
          break;
        case 'failed':
          defaultMessage = 'Complaint review completed - case closed.';
          break;
        default:
          defaultMessage = 'Status updated by law enforcement.';
      }
      setReviewNotes(defaultMessage);
    }

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/complaints/${complaintId}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          review_notes: reviewNotes.trim() || 'No review notes provided.'
        })
      });

      if (response.ok) {
        // Refresh complaints list
        await fetchComplaints(token);
        setReviewNotes('');
        closeModal();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const emotionMatch = emotionFilter === 'all' || complaint.emotion === emotionFilter;
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    return priorityMatch && emotionMatch && statusMatch;
  });

  const handleRowClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    setReviewNotes(''); // Reset review notes when opening modal
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    setReviewNotes('');
  };

  if (!isLoggedIn) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, \"Noto Sans\", sans-serif'}}>
        <div className="flex items-center justify-center h-full">
          <div className="text-[#0d141c] text-lg">Loading complaints...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, \"Noto Sans\", sans-serif'}}>
      {/* Blurred content */}
      <div className={`layout-container flex h-full grow flex-col transition-all duration-300 ${showModal ? 'filter blur-md pointer-events-none select-none' : ''}`}>
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <img src="/scales.svg" alt="Nyayasathi Logo" width={28} height={28} style={{ display: 'block' }} />
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Nyayasathi</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link href="/" className="text-[#0d141c] text-sm font-medium leading-normal">Home</Link>
              {!isCop && (
                <Link href="/submit-complaint" className="text-[#0d141c] text-sm font-medium leading-normal">Submit Complaint</Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#0d141c] text-sm font-medium">
                Welcome, {isCop ? `Cop ${user?.cop_id}` : user?.first_name || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Logout</span>
              </button>
            </div>
          </div>
        </header>
        <div className="px-10 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                {isCop ? 'All Complaints' : 'My Complaints'}
              </h1>
            </div>
            {error && (
              <div className="px-4 py-3">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            )}
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              <div className="flex flex-col items-center mr-4">
                <label htmlFor="priorityFilter" className="text-[#0d141c] text-xs font-medium mb-1">Filter by Priority</label>
                <select
                  id="priorityFilter"
                  className="flex h-8 leading-8 items-center justify-center rounded-lg bg-[#e7edf4] px-2 text-[#0d141c] text-sm font-medium text-center appearance-none"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  style={{ textAlign: 'center', paddingTop: 0, paddingBottom: 0 }}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt} style={{ textAlign: 'center', lineHeight: '2rem', height: '2rem' }}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col items-center mr-4">
                <label htmlFor="emotionFilter" className="text-[#0d141c] text-xs font-medium mb-1">Filter by Emotion</label>
                <select
                  id="emotionFilter"
                  className="flex h-8 leading-8 items-center justify-center rounded-lg bg-[#e7edf4] px-2 text-[#0d141c] text-sm font-medium text-center appearance-none"
                  value={emotionFilter}
                  onChange={e => setEmotionFilter(e.target.value)}
                  style={{ textAlign: 'center', paddingTop: 0, paddingBottom: 0 }}
                >
                  {EMOTION_OPTIONS.map(opt => (
                    <option key={opt} value={opt} style={{ textAlign: 'center', lineHeight: '2rem', height: '2rem' }}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col items-center">
                <label htmlFor="statusFilter" className="text-[#0d141c] text-xs font-medium mb-1">Filter by Status</label>
                <select
                  id="statusFilter"
                  className="flex h-8 leading-8 items-center justify-center rounded-lg bg-[#e7edf4] px-2 text-[#0d141c] text-sm font-medium text-center appearance-none"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ textAlign: 'center', paddingTop: 0, paddingBottom: 0 }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt} style={{ textAlign: 'center', lineHeight: '2rem', height: '2rem' }}>
                      {opt === 'all' ? 'All' : opt.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-lg border border-[#cedbe8] bg-slate-50">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[150px] text-sm font-medium leading-normal">Name</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[120px] text-sm font-medium leading-normal">Location</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[80px] text-sm font-medium leading-normal">Emotion</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[80px] text-sm font-medium leading-normal">Priority</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[80px] text-sm font-medium leading-normal">Threat</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[100px] text-sm font-medium leading-normal">Status</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[120px] text-sm font-medium leading-normal">Date</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[40px] text-sm font-medium leading-normal"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr className="border-t border-t-[#cedbe8]">
                        <td colSpan="8" className="h-[72px] px-4 py-2 text-center text-[#49739c] text-sm font-normal leading-normal">
                          {isCop ? 'No complaints found.' : 'No complaints found. '}
                          {!isCop && <Link href="/submit-complaint" className="text-[#248bf3] hover:underline">Submit your first complaint</Link>}
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="border-t border-t-[#cedbe8] hover:bg-slate-100 cursor-pointer" onClick={() => handleRowClick(complaint)}>
                          <td className="h-[72px] px-4 py-2 w-[150px] text-[#0d141c] text-sm font-normal leading-normal">{complaint.name}</td>
                          <td className="h-[72px] px-4 py-2 w-[120px] text-[#49739c] text-sm font-normal leading-normal">{complaint.location}</td>
                          <td className="h-[72px] px-4 py-2 w-[80px] text-sm font-normal leading-normal">
                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-full">
                              <span className="truncate">{complaint.emotion || 'N/A'}</span>
                            </button>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[80px] text-sm font-normal leading-normal">
                            <button className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 border text-sm font-medium leading-normal w-full ${getPriorityColor(complaint.priority)}`}>
                              <span className="truncate">{complaint.priority || 'N/A'}</span>
                            </button>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[80px] text-sm font-normal leading-normal">
                            <button className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 text-sm font-medium leading-normal w-full ${getThreatLevelColor(complaint.threat_level || 'low')}`}>
                              <span className="truncate">{complaint.threat_level || 'low'}</span>
                            </button>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[100px] text-sm font-normal leading-normal">
                            <button className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 border text-sm font-medium leading-normal w-full ${getStatusColor(complaint.status)}`}>
                              <span className="truncate">{complaint.status ? complaint.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Pending'}</span>
                            </button>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[120px] text-[#49739c] text-sm font-normal leading-normal">{complaint.submitted_at}</td>
                          <td className="h-[72px] px-4 py-2 w-[40px] text-center">
                            {!isCop && (
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={e => { e.stopPropagation(); handleDelete(complaint.id); }}
                                disabled={deletingId === complaint.id}
                                title="Delete Complaint"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 3v1H4v2h16V4h-5V3H9zm2 2h2v1h-2V5zm-4 3v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H7zm2 2h2v8h-2v-8zm4 0h2v8h-2v-8z"/></svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal rendered outside blurred content */}
      {showModal && selectedComplaint && selectedComplaint.id && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
              onClick={closeModal}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 pr-8">Complaint Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-gray-800"><b>Name:</b> {selectedComplaint.name}</div>
              <div className="text-gray-800"><b>Location:</b> {selectedComplaint.location}</div>
              <div className="text-gray-800"><b>Type:</b> {selectedComplaint.complaint_type}</div>
              <div className="text-gray-800"><b>Status:</b> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status ? selectedComplaint.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Pending'}
                </span>
              </div>
              <div className="text-gray-800"><b>Emotion:</b> {selectedComplaint.emotion}</div>
              <div className="text-gray-800"><b>Priority:</b> {selectedComplaint.priority}</div>
              <div className="text-gray-800"><b>Threat Level:</b> {selectedComplaint.threat_level}</div>
              <div className="text-gray-800"><b>Date:</b> {selectedComplaint.submitted_at}</div>
            </div>
            
            {/* For non-English, show only the message and translated content */}
            {selectedComplaint.language && selectedComplaint.language.toLowerCase() !== 'en' && selectedComplaint.language.toLowerCase() !== 'english' ? (
              <>
                <div className="mb-2 text-xs text-gray-500">This complaint was originally submitted in {selectedComplaint.language}. The translated version is given below.</div>
                <div className="mb-4">
                  <div className="bg-gray-50 p-3 rounded text-gray-700 border">{selectedComplaint.content}</div>
                </div>
                {/* Show keywords below translated content for all */}
                {selectedComplaint.exact_keywords && selectedComplaint.exact_keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="text-gray-800 text-sm font-medium pb-1">Keywords Detected in Complaint:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedComplaint.exact_keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-gray-800 font-semibold mb-2">Content:</div>
                  <div className="bg-gray-50 p-3 rounded text-gray-700 border">{selectedComplaint.content}</div>
                </div>
                {/* Show keywords below content for all */}
                {selectedComplaint.exact_keywords && selectedComplaint.exact_keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="text-gray-800 text-sm font-medium pb-1">Keywords Detected in Complaint:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedComplaint.exact_keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {selectedComplaint.audio_file && (
              <div className="mb-4">
                <div className="text-gray-800 font-semibold mb-2">Audio File:</div>
                <audio controls className="w-full">
                  <source src={selectedComplaint.audio_file} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Review Notes Section - Visible to both users and cops */}
            {selectedComplaint.status && selectedComplaint.status !== 'pending' && (
              <div className="mb-4">
                <div className="text-gray-800 font-semibold mb-2">Review Notes:</div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  {selectedComplaint.review_notes ? (
                    <div className="text-gray-900">{selectedComplaint.review_notes}</div>
                  ) : (
                    <div className="text-gray-600 italic">
                      {selectedComplaint.status === 'under_review' && 'Complaint marked for review. Investigation in progress.'}
                      {selectedComplaint.status === 'reviewed' && 'Complaint has been reviewed and processed.'}
                      {selectedComplaint.status === 'failed' && 'Complaint review completed - case closed.'}
                    </div>
                  )}
                  {selectedComplaint.reviewed_by && (
                    <div className="text-sm text-gray-600 mt-2">
                      Reviewed by: {selectedComplaint.reviewed_by.cop_id || selectedComplaint.reviewed_by.username}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isCop && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Update Status</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Review Notes:</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    rows="3"
                    placeholder="Add review notes..."
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'under_review')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'reviewed')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'failed')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Failed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 