const fs = require('fs');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const path = require('path');
const slsw = require('serverless-webpack');
// const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

// const mode = slsw.lib.webpack.isLocal ? 'development' : 'production';
const mode = 'development';
console.log(`Bundling for mode: ${mode}`);
console.log('Entries:');
console.log(slsw.lib.entries);

module.exports = {
  optimization: {
    minimize: false,
    namedModules: true,
    namedChunks: true,
    sideEffects: false,
  },
  mode,
  entry: slsw.lib.entries,
  // entry: './src/handlers/resize-images.ts',
  devtool: 'source-map',
  plugins: [
    // new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    new BundleAnalyzerPlugin({ analyzerMode: 'disabled' }),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.IgnorePlugin(/\.\/native/, /\/pg\//, /aws-sdk/),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      lodash: 'lodash-es',
    },
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
};
