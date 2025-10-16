/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true, // Commented out to resolve Next.js warning
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
