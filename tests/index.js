/* eslint-disable */
import dotenv from 'dotenv';
import queryString from 'querystring';
import fs from 'fs';
import Mongoose from 'mongoose';

// set test environment
const envConfig = dotenv.parse(fs.readFileSync('.env.test'))
for (let k in envConfig) {
  process.env[k] = envConfig[k]
}
const username = queryString.escape(process.env.MONGODB_USERNAME);
const password = queryString.escape(process.env.MONGODB_PASSWORD);
const host = queryString.escape(process.env.MONGODB_URL);
const dbport = queryString.escape(process.env.MONGODB_PORT);
const dbname = queryString.escape(process.env.MONGODB_NAME);


describe('Initilize',() => {
  before(() => {
    // initialize DB connection for test
    Mongoose.connect(`mongodb://${username}:${password}@${host}:${dbport}/${dbname}`, { useNewUrlParser: true }, function (err, client) {
      // console.log('DB Connection', `mongodb://${username}:${password}@${host}:${dbport}/${dbname}`)
      if (err) throw err
      console.log('MongoDB Connected')
      
    });
  })
  require('./routes/passengers');
  require('./routes/trips');
})