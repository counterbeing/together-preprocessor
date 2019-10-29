const fs = require('fs');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const path = require('path');
const slsw = require('serverless-webpack');
// const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

const mode = slsw.lib.webpack.isLocal ? 'development' : 'production';
console.log(`Bundling for mode: ${mode}`);

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(item => ['.bin'].indexOf(item) === -1) // exclude the .bin folder
  .forEach(mod => {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  optimization: {
    minimize: false,
    namedModules: true,
    namedChunks: true,
  },
  mode,
  entry: slsw.lib.entries,
  externals: nodeModules,
  devtool: 'source-map',
  plugins: [
    // new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    new BundleAnalyzerPlugin({ analyzerMode: 'disabled' }),
    new ForkTsCheckerWebpackPlugin(),
    // new CopyPlugin([
    //   {
    //     from: 'src/config/*.json',
    //     to: './src/config',
    //     context: './',
    //   },
    // ]),
    new webpack.IgnorePlugin(/\.\/native/, /\/pg\//, /aws-sdk/),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
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
