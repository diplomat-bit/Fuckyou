import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number | string;
  errors?: any;
}

const logError = (msg: string, meta?: any) => {
  if (logger && typeof logger.error === 'function') {
    logger.error(msg, meta);
  } else {
    console.error(msg, meta);
  }
};

const sendErrorDev = (err: AppError, res: Response) => {
  logError(`Dev Error: ${err.message}`, { error: err, stack: err.stack });
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message,
    });
  } else {
    logError('CRITICAL ERROR 💥', { error: err });
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong! The sovereign network is currently recalibrating.',
    });
  }
};

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Correctly clone the error object including non-enumerable properties
    const error: AppError = Object.create(err);
    error.message = err.message;
    error.name = err.name;
    error.stack = err.stack;
    error.statusCode = err.statusCode;
    error.status = err.status;
    error.isOperational = err.isOperational;

    // Handle specific operational error types
    if (error.name === 'CastError') {
      error.message = 'Invalid resource ID.';
      error.statusCode = 400;
      error.isOperational = true;
    }
    if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
      error.message = 'Invalid input data provided.';
      error.statusCode = 400;
      error.isOperational = true;
    }
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid token. Please log in again.';
      error.statusCode = 401;
      error.isOperational = true;
    }
    if (error.name === 'TokenExpiredError') {
      error.message = 'Your token has expired.';
      error.statusCode = 401;
      error.isOperational = true;
    }
    if (error.code === 11000) {
      error.message = 'Duplicate field value entered.';
      error.statusCode = 400;
      error.isOperational = true;
    }

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;