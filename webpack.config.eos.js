/**
 * @file webpack build for j2v8 call this lib, Multi entry for each coin and utils
 * this is the eos config webpack file for hook noneused file
 */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
  entry: {
    EOS:'./src/EOS/index.ts',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      } 
    ]
  },
  resolve: {
    alias: {
      randombytes: path.resolve(__dirname, 'hook.js'),
      'isomorphic-fetch': path.resolve(__dirname, 'hookFetch.js')
    },
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: '[name].bundle_[hash].js',
    libraryTarget: 'umd',
    // library: ['cryptoCoinKit', '[name]'],
    path: path.resolve(__dirname, 'dist/subBundle')
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: true,
      cache: true,
      parallel: true,
      sourceMap: false, // Must be set to true if using source-maps in production
      terserOptions: {
        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        extractComments: 'all',
        compress: {
          drop_console: true,
        },
      }
    })],
  },
};
