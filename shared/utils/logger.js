import pino from 'pino';
import env from '../config/env.js';

const levels = {
  development: 'debug',
  test: 'debug',
  production: 'info'
};

const transport = {
  development: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
    }
  },
  test: {
    target: 'pino/file',
    options: { destination: './logs/test.log' }
  },
  production: {
    targets: [
      {
        target: 'pino/file',
        options: { destination: './logs/error.log', level: 'error' }
      },
      {
        target: 'pino/file',
        options: { destination: './logs/combined.log' }
      }
    ]
  }
};

const logger = pino({
  level: levels[env.NODE_ENV] || 'info',
  transport: transport[env.NODE_ENV],
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});

export const logError = (error, context = {}) => {
  const errorLog = {
    message: error.message,
    code: error.errorCode,
    statusCode: error.statusCode,
    stack: env.NODE_ENV !== 'production' ? error.stack : undefined,
    ...context
  };

  if (error.isOperational) {
    logger.warn(errorLog);
  } else {
    logger.error(errorLog);
  }
};

export default logger;
