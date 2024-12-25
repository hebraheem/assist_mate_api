import AppError from '../utils/appError.js';
import dotenv from 'dotenv';

dotenv.config();

// Utility function for sending simplified error responses
const sendErrorResponse = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'An unexpected error occurred',
  });
};

// Main error-handling middleware
const errorHandler = (err, req, res, _next) => {
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
    err = new AppError(`Validation failed: ${errors}`, 400);
  }

  // Handle invalid ObjectId or type casting
  if (err.name === 'CastError') {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    err = new AppError(`Duplicate value for field(s): ${field}`, 400);
  }

  // Handle Firebase-specific authentication errors
  if (err.message?.includes('auth') && err.message?.includes('Firebase')) {
    err = new AppError('Invalid User Login Credentials', 401);
  }

  // Ensure all errors are instances of AppError
  if (!(err instanceof AppError)) {
    err = new AppError(err.message || 'Server Error', err.statusCode || 500);
  }

  // Environment-specific error handling
  if (process.env.NODE_ENV === 'development') {
    // Detailed error for development
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Simplified error for production
    sendErrorResponse(err, res);
  }
};

export default errorHandler;
