// next.config.js

if (typeof window === "undefined") {
  require("./shims/asyncStorage");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
