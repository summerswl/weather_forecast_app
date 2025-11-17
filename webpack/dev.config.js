const path = require('path');
const webpackMerge = require('webpack-merge');
const webpackCommon = require('./common.config');

const env = require('../env');
const proxyRules = require('../proxy/rules');

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
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
  host: env.devServer.host || 'localhost',
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
        target: 'http://localhost:3001',
        changeOrigin: true,
        logLevel: 'debug'
      }
    ]
  }
});
