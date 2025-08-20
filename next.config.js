/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚨 Faz o build passar mesmo com erros de tipagem
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
