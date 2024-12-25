import User from '../models/user.js';
import AppError from '../utils/appError.js';

// Dynamic ownership middleware
const checkOwnership = (Model, key = 'user') => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ id: req.user.user_id });
      if (!user) {
        return next(new AppError('User not logged in', 403));
      }
      req.queryFilter = { createdBy: user._id };

      if (
        (req.method === 'PATCH' ||
          req.method === 'DELETE' ||
          req.method === 'PUT') &&
        req.params.id
      ) {
        const documentId = req.params.id;

        // Find the document by ID in the specified model
        const document = await Model.findById(documentId);

        // Check if the document exists
        if (!document) {
          return next(new AppError('Document not found', 404));
        }

        // Check if the current user is the owner of the document
        if (document[key].toString() !== user._id.toString()) {
          return res.status(403).json({
            error: 'You do not have permission to perform this action',
          });
        }
      }

      // If ownership is confirmed, proceed to the next middleware or route handler
      next();
    } catch (error) {
      return next(error);
    }
  };
};

export default checkOwnership;
