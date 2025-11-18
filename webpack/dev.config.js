const path = require('path');
const webpackMerge = require('webpack-merge');
const webpackCommon = require('./common.config');

const env = require('../env');

// Dynamic host: '0.0.0.0' in Docker, 'localhost' locally
const devServerHost = process.env.HOST || env.devServer.host || 'localhost';

// Dynamic proxy target: 'rails:3001' in Docker, 'localhost:3001' locally
const railsHost = process.env.RAILS_HOST || 'localhost';
const railsPort = process.env.RAILS_PORT || '3001';
const proxyTarget = `http://${railsHost}:${railsPort}`;

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// ──────────────────────────────────────────────────────────────
// Give the proxy target 5 extra seconds to become reachable
// Fixes Webpack Dev Server immediate exit in Docker
// ──────────────────────────────────────────────────────────────
process.env.HTTP_PROXY_STARTUP_DELAY = '5000';   // ← THIS LINE
if (process.env.PROXY_TARGET) {
  process.env.CHOKIDAR_USEPOLLING = 'true';     // already set anyway
}

module.exports = webpackMerge(webpackCommon, {
  devtool: 'inline-source-map',
  mode: 'development',
  output: {  
    path: path.resolve(__dirname, '../static/dist'),
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id]-chunk.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: [
          'style-loader', // 1. Injects CSS into DOM                          
          {                                          
            loader: 'css-loader', // 2. Turns CSS into JS module
            options: { importLoaders: 1 }
          },
          'postcss-loader', // 3. Runs Autoprefixer                        
          'sass-loader' // 4. Compiles SCSS → CSS                             
        ]
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      'process.env': {
        'process.env.NODE_ENV': "'development'"
      }
    }),
    new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../static/index.html'),
      favicon: path.resolve(__dirname, '../static/favicon.ico')
    })
  ],
  devServer: {
    host: devServerHost,  // Binds to 0.0.0.0 in Docker
    port: env.devServer.port || 3000,
    static: path.resolve(__dirname, '../static'),
    compress: true,
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: true,
      progress: true,
    },
    proxy: [
      {
        context: ['/weather'],
        target: process.env.PROXY_TARGET || proxyTarget,   // ← falls back gracefully
        changeOrigin: true,
        logLevel: 'warn',
        // This is the key: ignore the very first connection failure
        onError: (err, req, res) => {
          if (err.code === 'ECONNREFUSED') {
            console.warn('Proxy target not ready yet – will retry automatically...');
            res.writeHead(502);
            res.end('Backend is starting up, please wait...');
          }
        },
      }
    ]
  }
});