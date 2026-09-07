import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Check karta hai ke app Vercel (production) par hai ya local computer par
    const isProd = process.env.NODE_ENV === 'production';
    
    // Vercel par live backend URL, aur local ke liye localhost
    const backendUrl = isProd 
      ? "https://x-elevate-enterprise-backend-9d6cy0kdu.vercel.app" 
      : "http://localhost:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;