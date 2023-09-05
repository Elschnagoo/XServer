/* eslint-disable @typescript-eslint/no-var-requires,import/no-extraneous-dependencies */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
const { uuid } = require('@grandlinex/react-components/dist/util/index');

const env = process.env.BUILD;

const eId = env === 'development' ? uuid() : undefined;
if (eId) {
  console.log(`BuildID: ${eId}`);
}
module.exports = {
  //  mode: 'development',
  mode: 'production',
  entry: './src/renderer.tsx',
  devtool: 'source-map',
  devServer: {
    static: path.join(
      __dirname,
      '..',
      'backend',
      'public',
      'ui',
      'renderer.js',
    ),
    compress: true,
    port: 9001, // Don't use port 9000 it's used for the electron env
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    path: path.join(__dirname, '..', 'backend', 'public', 'ui'),
    filename: 'renderer.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      meta: {
        REACT_APP_VERSION: eId || process.env.npm_package_version,
        REACT_C_NAME: env === 'development' ? 'DEV' : '!REPLACE!',
      },
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'public' }],
    }),
    new NodePolyfillPlugin(),
  ],
};
