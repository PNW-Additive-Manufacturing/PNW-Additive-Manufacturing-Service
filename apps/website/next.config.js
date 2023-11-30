/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },

  trailingSlash: true,

  env: {
    API_ROOT: 'http:/localhost:5126',
  },
}

module.exports = nextConfig