import AppError from '../utils/appError.js';

// 404 Handler for routes not found
export const handleNotFoundError = (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404,
  );
  next(err); // Pass to the error-handling middleware
};

// Database error handler
export const handleDBError = (error) => {
  let message = 'Database error';
  if (error.name === 'ValidationError') {
    message = `Invalid input data: ${Object.values(error.errors)
      .map((el) => el.message)
      .join('. ')}`;
  }
  return new AppError(message, 400);
};
