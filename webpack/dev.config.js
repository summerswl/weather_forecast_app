// webpack/dev.config.js  ←  FINAL VERSION THAT WORKS IN DOCKER
const path = require('path');
const webpackMerge = require('webpack-merge');
const webpackCommon = require('./common.config');
const env = require('../env');

const devServerHost = process.env.HOST || env.devServer.host || 'localhost';
const proxyTarget = process.env.PROXY_TARGET || `http://${process.env.RAILS_HOST || 'localhost'}:${process.env.RAILS_PORT || '3001'}`;

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = webpackMerge(webpackCommon, {
  mode: 'development',
  devtool: 'inline-source-map',

  output: {
    path: path.resolve(__dirname, '../static/dist'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id]-chunk.js',
  },

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },

  plugins: [
    new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../static/index.html'),
      favicon: path.resolve(__dirname, '../static/favicon.ico'),
    }),
  ],

  devServer: {
    host: devServerHost,
    port: env.devServer.port || 3000,
    static: path.resolve(__dirname, '../static'),
    hot: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: true,
      progress: true,
    },

    // ← THIS IS THE ONLY CORRECT SYNTAX FOR webpack-dev-server v4+
    proxy: [
      {
        context: ['/api', '/registrations', '/sessions', '/users', '/weather'],
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
        // Graceful message when Rails is still booting
        onError: (err, req, res) => {
          if (err.code === 'ECONNREFUSED') {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Backend (Rails) is starting up – please wait a moment...');
          }
        },
      },
    ],
  },
});