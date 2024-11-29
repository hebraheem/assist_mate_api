import AppError from '../utils/appError.js';
import dotenv from 'dotenv';

dotenv.config();

// Utility function for sending responses
const sendErrorResponse = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'An unexpected error occurred',
  });
};

// Main error-handling middleware
const errorHandler = (err, req, res, next) => {
  if (err.message.includes('auth') && err.message.includes('Firebase')) {
    err.message = 'Invalid User login Credentials';
    err.statusCode = 401;
  }
  if (!(err instanceof AppError)) {
    // If error is not an instance of AppError, make it one
    err = new AppError(err.message || 'Server Error', 500);
  }
  // Check the environment
  if (process.env.NODE_ENV === 'development') {
    // Detailed error for development
    console.error('Error:', err); // Log the full error

    return res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message,
      stack: err.stack, // Include stack trace for debugging
      error: err,
    });
  } else {
    // Simplified error for production
    sendErrorResponse(err, res);
  }
};

export default errorHandler;
