import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@libsql/client'],
  async rewrites() {
    return [
      {
        source: '/uploads/:filename',
        destination: '/api/files/:filename',
      },
    ];
  },
};

export default nextConfig;
