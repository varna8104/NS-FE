/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed
  // output: 'export',
  
  // Handle API calls to backend
  async rewrites() {
    const apiUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL
        : 'http://localhost:8000';

    // Ensure apiUrl is valid
    if (!apiUrl || (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://'))) {
      throw new Error(
        'NEXT_PUBLIC_API_URL is not set or does not start with http:// or https://'
      );
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // Images configuration
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
};

export default nextConfig;
