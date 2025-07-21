/** @type {import('next').NextConfig} */
const nextConfig = {

  
  //------------------

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables that should be available to the browser
  // These must be prefixed with NEXT_PUBLIC_
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "1.0.0",
  },

  // Image domains for next/image
  images: {
    domains: [
      "storage.deeldeal.com",
      "api.deeldeal.com",
      "localhost",
      // Add other domains as needed
    ],
    unoptimized: true,
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ]
  },

  // Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
