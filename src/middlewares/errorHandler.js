import AppError from '../utils/appError.js';

// Utility function for sending responses
const sendErrorResponse = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'An unexpected error occurred',
  });
};

// Main error-handling middleware
const errorHandler = (err, req, res, next) => {
  // If error is not an instance of AppError, make it one
  if (!(err instanceof AppError)) {
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
