const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const proxy = require('./server/webpack-dev-proxy');

function getEntrySources(sources) {
  if (process.env.NODE_ENV !== 'production') {
    sources.push('webpack-hot-middleware/client');
  }

  return sources;
}

const basePlugins = [
  new webpack.DefinePlugin({
    __DEV__: process.env.NODE_ENV !== 'production',
    __PRODUCTION__: process.env.NODE_ENV === 'production',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    inject: 'body',
  }),
];

const devPlugins = [
  new webpack.NoErrorsPlugin(),
];

const prodPlugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false,
    },
  }),
];

const plugins = basePlugins
  .concat(process.env.NODE_ENV === 'production' ? prodPlugins : [])
  .concat(process.env.NODE_ENV === 'development' ? devPlugins : []);

module.exports = {
  entry: {
    app: getEntrySources(['./src/index.js']),
    vendor: [
      'es5-shim',
      'es6-shim',
      'es6-promise',
      'react',
    ],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: '/',
    chunkFilename: '[id].chunk.js',
  },
  plugins: plugins,

  devServer: {
    historyApiFallback: { index: '/' },
    proxy: proxy(),
  },

  module: {
    preLoaders: [
      { test: /\.js$/, loader: 'source-map-loader' },
      { test: /\.js$/, loader: 'eslint-loader' },
    ],
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(js|jsx)$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: 'url-loader?prefix=img/&limit=5000' },
      { test: /\.(woff|woff2|ttf|eot)$/, loader: 'url-loader?prefix=font/&limit=5000' },
    ],
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
