
import winston from 'winston';
import appRoot from 'app-root-path';
// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
import crypto from 'crypto';
import WinstonCloudWatch from '../node_modules/winston-cloudwatch/index';

dotenv.config();

const startTime = new Date().toISOString();

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: `${process.env.APP_DIR || appRoot.path}/logs/logs.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: true,
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
  ],
  exitOnError: false,
});

if (process.env.LOG_TO_CLOUDWATCH) {
  logger.add(new WinstonCloudWatch({
    logGroupName: 'Mobi-Passenger-API',
    handleExceptions: true,
    logStreamName: () => `passenger-api-server-${new Date().toISOString().split('T')[0]}-${crypto.createHash('md5').update(startTime).digest('hex')}`,
    awsRegion: `${process.env.AWS_REGION}`,
    jsonMessage: true,
    awsAccessKeyId: `${process.env.AWS_ACCESS_KEY}`,
    awsSecretKey: `${process.env.AWS_SECRET_KEY}`,
  }));
}


logger.stream = {
  write: (message) => {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

export default logger;
