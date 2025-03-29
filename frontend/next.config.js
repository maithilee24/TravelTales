/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@tailwindcss/postcss"],
  },
}

module.exports = nextConfig
