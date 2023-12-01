const webpack = require('webpack');
const { parsed: myEnv} = require('dotenv').config({
  path: "./.env"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.plugins.push(new webpack.EnvironmentPlugin(myEnv));
    return config;
  },

  trailingSlash: true,

  env: {
    API_ROOT: 'http:/localhost:5126',
  },
}

module.exports = nextConfig