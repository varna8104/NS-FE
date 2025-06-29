'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_type: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const zone = searchParams.get('zone');
    if (zone === 'cop') {
      setFormData(prev => ({ ...prev, user_type: 'cop' }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isCopZone = formData.user_type === 'cop';

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <img src="/scales.svg" alt="Nyayasathi Logo" width={28} height={28} style={{ display: 'block' }} />
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Nyayasathi</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <Link href="/" className="text-[#0d141c] text-sm font-medium leading-normal">Home</Link>
          </div>
        </header>
        <div className="px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCopZone ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {isCopZone ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">
                    {isCopZone ? 'Cop Login' : 'User Login'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {isCopZone ? 'Access the Cop Zone to review complaints' : 'Access the User Zone to submit complaints'}
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="px-4 py-3">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">
                    {isCopZone ? 'Cop ID' : 'Username'}
                  </p>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={isCopZone ? "Enter your Cop ID" : "Enter your username"}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                    required
                  />
                </label>
              </div>
              
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Password</p>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                    required
                  />
                </label>
              </div>

              <input type="hidden" name="user_type" value={formData.user_type} />
              
              <div className="flex px-4 py-3 justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 ${
                    isCopZone ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <span className="truncate">{loading ? 'Logging in...' : 'Login'}</span>
                </button>
              </div>
            </form>
            
            <div className="px-4 py-3 text-center">
              <p className="text-[#0d141c] text-sm font-normal leading-normal">
                Don't have an account?{' '}
                <Link href={`/register?zone=${isCopZone ? 'cop' : 'user'}`} className="text-[#248bf3] hover:underline">
                  Register here
                </Link>
              </p>
              <div className="mt-4 flex gap-4 justify-center">
                <Link href="/login?zone=user" className={`text-sm px-3 py-1 rounded ${!isCopZone ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  User Zone
                </Link>
                <Link href="/login?zone=cop" className={`text-sm px-3 py-1 rounded ${isCopZone ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Cop Zone
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 