/* eslint-disable */
const reactConfigsWeb = require('./webpack.react.js');

const context = process.env.CONTEXT;


let mode = reactConfigsWeb;

const env = process.env.BUILD;

if (env === 'development') {
  console.log('Webpack - DEV MODE');
  mode.mode = 'development';
} else {
  console.log('Webpack - PRODUCTION MODE');
}

module.exports = [mode];
