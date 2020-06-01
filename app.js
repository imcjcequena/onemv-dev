import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import morganBody from 'morgan-body';

import usersRouter from './routes/users';
import indexRouter from './routes/index';
import authRouter from './routes/auth';
import tripRouter from './routes/trips';
import passengerRouter from './routes/passenger';
import vehiclesRouter from './routes/vehicles';
import apiKeyRouter from './routes/apikey';
import ratingsRouter from './routes/ratings';
import appVersionRouter from './routes/appversion';

import {
  validateToken,
  notFoundHandler,
  errorHandler,
  masterKey,
} from './middleware';
import Logger from './util/Logger';

const app = express();

global.fetch = require('node-fetch');

dotenv.config();

app.set('view engine', 'jade');

morganBody(app, {
  stream: Logger.stream,
  noColors: true,
  logRequestBody: true,
  logResponseBody: true,
  prettify: false,
  // eslint-disable-next-line no-unused-vars
  skip: (req, res) => {
    if (req.originalUrl === '/' || req.originalUrl === '/favicon.ico') return true;
    return false;
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', validateToken, usersRouter);
app.use('/auth', authRouter);
app.use('/versions', appVersionRouter);
app.use('/trips', validateToken, tripRouter);
app.use('/passengers', passengerRouter);
app.use('/vehicles', validateToken, vehiclesRouter);
app.use('/keys', masterKey, apiKeyRouter);
app.use('/ratings', validateToken, ratingsRouter);

app.use('*', validateToken, notFoundHandler);

app.use(errorHandler);

module.exports = app;
