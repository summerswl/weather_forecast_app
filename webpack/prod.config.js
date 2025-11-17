const path = require("path");
const webpackMerge = require("webpack-merge");
const autoprefixer = require("autoprefixer");
const webpackCommon = require("./common.config");

// webpack plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");

module.exports = webpackMerge(webpackCommon, {
  bail: true,

  devtool: "source-map",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../dist"),

    filename: "[name]-[hash].min.js",

    sourceMapFilename: "[name]-[hash].map",

    chunkFilename: "[id]-[chunkhash].js",

    publicPath: "/"
  },

  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                importLoaders: 2
              }
            },
            {
              loader: "postcss-loader",
              options: {
                config: {
                  path: path.resolve(__dirname, "postcss.config.js")
                },
                sourceMap: true
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
                sourceMap: true
              }
            }
          ]
        })
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "../static/index.html"),
      favicon: path.resolve(__dirname, "../static/favicon.ico"),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new CopyWebpackPlugin([{ from: path.resolve(__dirname, "../static") }], {
      ignore: ["index.html", "favicon.ico"]
    }),
    new CleanWebpackPlugin(["dist"], {
      root: path.resolve(__dirname, ".."),
      exclude: ".gitignore"
    }),
    new DefinePlugin({
      "process.env": {
        'process.env.NODE_ENV': '"production"'
      }
    }),
    new ExtractTextPlugin("[name]-[chunkhash].min.css"),    
    new LoaderOptionsPlugin({
      options: {
        context: "/",
        sassLoader: {
          includePaths: [path.resolve(__dirname, "../src")]
        }
      }
    })
  ]
});
