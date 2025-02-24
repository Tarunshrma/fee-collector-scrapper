import pino, { LoggerOptions } from 'pino';


const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
};

export default pino(options);
