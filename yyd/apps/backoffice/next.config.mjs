/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3001',
        '127.0.0.1:3001',
        ...(process.env.REPLIT_DEV_DOMAIN ? [
          process.env.REPLIT_DEV_DOMAIN,
          `${process.env.REPLIT_DEV_DOMAIN}:3001`,
        ] : []),
        ...(process.env.BACKOFFICE_ALLOWED_ORIGINS 
          ? process.env.BACKOFFICE_ALLOWED_ORIGINS.split(',').map(o => o.trim())
          : []
        ),
      ],
      bodySizeLimit: '2mb',
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
