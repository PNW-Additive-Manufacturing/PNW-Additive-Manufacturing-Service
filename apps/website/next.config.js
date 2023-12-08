//set up dotenv package
const webpack = require('webpack');
const { parsed: myEnv} = require('dotenv').config({
  path: "./.env" //path to .env file in NextJS root folder
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  //inject dotenv environment variables into NextJS process.env variable
  webpack: (config, {isServer}) => {
    /*
    if(!isServer) {
      config.resolve.fallback = {net: false, tls: false}
    }
    */
    config.plugins.push(new webpack.EnvironmentPlugin(myEnv));
    return config;
  },

  trailingSlash: true,

  env: {
    API_ROOT: 'http:/localhost:5126',
  },
}

module.exports = nextConfig