// webpack plugins
const SplitChunksPlugin = require('webpack/lib/optimize/SplitChunksPlugin');

module.exports = {
  entry: {
    app: ['./src/index.js'],
    vendor: './src/vendor.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['react-refresh/babel'] 
          }
        }
      },

      {
        type: 'javascript/auto',
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          publicPath: '/',
        },
      },

      {
        test: /\.(mp4|webm)$/
      },
    ],
  },

  plugins: [
    new SplitChunksPlugin({
      name: ['app', 'vendor'],
      minChunks: Infinity,
    }),
  ],
};
