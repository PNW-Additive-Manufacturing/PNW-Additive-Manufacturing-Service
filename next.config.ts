import type { NextConfig } from "next";

const nextConfig: NextConfig = {

	trailingSlash: true,
  cacheComponents: true,
	images: {
    localPatterns: [
      {
        pathname: "/api/download/**"
      }
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: "/**"
      },
	  {
		protocol: 'https',
		hostname: 'www.authenticatorapi.com',
		port: '',
		pathname: '/**'
	  },
      {
        protocol: 'https',
        hostname: 'static1.campusgroups.com',
        port: '',
        pathname: '/upload/pnw/**'
      },
      {
        protocol: 'https',
        hostname: 'mypnwlife.pnw.edu',
        port: '',
        pathname: '/images/ico/male_user_large.png'
      }
    ]
  }

};

export default nextConfig;
