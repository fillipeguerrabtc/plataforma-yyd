/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  allowedDevOrigins: ["*.replit.dev"]
};

export default nextConfig;
