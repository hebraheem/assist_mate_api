import pkg from 'firebase-admin';
const { auth } = pkg;

const authenticateFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const decodedToken = await auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

export default authenticateFirebaseToken;
