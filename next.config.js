/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  // Needed for SSE streaming responses
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
}

module.exports = nextConfig
