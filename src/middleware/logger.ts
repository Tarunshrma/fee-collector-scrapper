import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const logger_middleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
};

export default logger_middleware;