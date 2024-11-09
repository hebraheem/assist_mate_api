import AppError from '../utils/appError.js';
import { authUser } from '../utils/helpers.js';

const hasPermission = async (req, res, next) => {
  const sessionUser = req.params?.id;
  const user = authUser();

  if (!user) {
    return next(
      new AppError('No Authorization/session expired pls login', 403),
    );
  }
  if (user?.uid !== sessionUser) {
    res.status(403).json({ error: 'Unauthorized' });
  } else {
    next();
  }
};

export default hasPermission;
