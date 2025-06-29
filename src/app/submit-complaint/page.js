'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitComplaintPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
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
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Submit Complaint</h1>
            </div>
            <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1 px-4">
              Choose how you would like to submit your complaint. You can either record an audio complaint or write a text complaint.
            </p>
            <div className="flex justify-center">
              <div className="flex flex-1 gap-6 max-w-[600px] flex-row items-stretch px-4 py-3">
                <Link href="/submit-complaint/audio" className="flex-1">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-[#cedbe8] rounded-lg bg-white hover:border-[#248bf3] hover:shadow-lg transition-all cursor-pointer h-64">
                    <div className="text-[#248bf3] mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64.07,64.07,0,0,0,64,64A64.07,64.07,0,0,0,192,128a8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-[#0d141c] text-xl font-bold leading-tight mb-2">Audio Complaint</h3>
                    <p className="text-[#49739c] text-sm text-center">
                      Record your complaint by speaking. Our system will transcribe and analyze your audio.
                    </p>
                  </div>
                </Link>
                <Link href="/submit-complaint/text" className="flex-1">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-[#cedbe8] rounded-lg bg-white hover:border-[#248bf3] hover:shadow-lg transition-all cursor-pointer h-64">
                    <div className="text-[#248bf3] mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM80,200H64V184H80Zm0-32H64V152H80Zm0-32H64V120H80Zm0-32H64V88H80Zm0-32H64V56H80Zm96,96H96V120h80Zm0-32H96V88h80Zm0-32H96V56h80Zm16,96H176V184h16Zm0-32H176V152h16Zm0-32H176V120h16Zm0-32H176V88h16Zm0-32H176V56h16Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-[#0d141c] text-xl font-bold leading-tight mb-2">Text Complaint</h3>
                    <p className="text-[#49739c] text-sm text-center">
                      Write your complaint in text format. Our system will analyze the content and emotion.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 