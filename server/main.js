/* eslint-disable no-console */

import path from 'path';

import express from 'express';
import morgan from 'morgan';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import compression from 'compression';

import webpackConfig from '../config/webpack.development';
import serverConfig from './config';
import render from './render';

const app = express();
const compiler = webpack(webpackConfig);
const port = serverConfig.port;

// serve static assets like images outside of normal bundling
app.use('/static', express.static(path.join(__dirname, '../public'), { maxAge: '7d' }));

if (serverConfig.isProduction) {
  console.log('Starting production server...');

  // Apply gzip compression
  app.use(compression());

  // Serve the static assets. We can cache them as they include hashes.
  app.use('/_assets', express.static(path.resolve(__dirname, '../dist'), { maxAge: '200d' }));
} else {
  console.log('Starting development server...');

  app.use(webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: false,
    noInfo: false,
    stats: {
      assets: false,
      chunkModules: false,
      chunks: true,
      colors: true,
      hash: false,
      progress: false,
      timings: false,
      version: false,
    },
  }));

  app.use(webpackHotMiddleware(compiler));
}

// Request logging
app.use(morgan('combined'));

app.get('*', render);

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else if (serverConfig.isProduction) {
    console.log(`Production server running on port ${port}`);
  } else {
    console.log(`Listening at http://localhost:${port}`);
  }
});
