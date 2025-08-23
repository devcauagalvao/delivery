/** @type {import('next').NextConfig} */
const nextConfig = {
  // Geração estática de saída
  output: 'export',

  // ESLint: ignora durante o build, mas recomenda manter lint localmente
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript: ignora erros para não quebrar build, mas ideal revisar antes
  typescript: {
    ignoreBuildErrors: true,
  },

  // Imagens: desativa otimização para export estático
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'], // adiciona suporte moderno a formatos
  },

  // Redirecionamentos ou headers podem ser adicionados facilmente aqui
  reactStrictMode: true, // habilita modo estrito do React para melhores práticas
  experimental: {
    scrollRestoration: true, // melhora UX em navegação
  },
};

module.exports = nextConfig;
