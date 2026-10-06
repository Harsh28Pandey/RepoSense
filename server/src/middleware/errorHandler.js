import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(err, err.message);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || null;

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details
    }
  });
}

