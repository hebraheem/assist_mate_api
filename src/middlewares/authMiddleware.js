import { admin } from '../config/firebase.cjs';
import User from '../models/user.js';

const authenticateFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const mongooseUser = (
      await User.findOne({ id: decodedToken.uid })
    )?.toObject();
    req.user = {
      ...decodedToken,
      ...mongooseUser,
      _id: mongooseUser._id.toString(),
    };

    next();
  } catch (error) {
    res.status(403).json({ error: 'Unauthorized', error: error.message });
  }
};

export default authenticateFirebaseToken;
