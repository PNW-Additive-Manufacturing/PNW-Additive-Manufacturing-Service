/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },

  env: {
    API_ROOT: 'http:/localhost:5126',

  },
}

module.exports = nextConfig
