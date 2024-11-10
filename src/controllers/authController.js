import {
  browserLocalPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { admin, auth, googleAuth } from '../config/firebase.cjs';
import localStorage from '../utils/localStorage.js';
import AppError from '../utils/appError.js';
import User from '../models/User.js';

export const messageChannelUrl = `https://assistmate.netlify.app/action`;

export const createUser = async (req, res, next) => {
  try {
    const { email, password, username, avatar, ...rest } = req.body;
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: username,
      photoURL: avatar,
      ...rest,
    });

    const userRecord = await saveUserToMongoose(req, res, user?.uid);

    return res
      .status(201)
      .json({ user: userRecord, messaging: 'Email verification sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    await sendPasswordResetEmail(auth, email, {
      url: messageChannelUrl,
      handleCodeInApp: true,
    });
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required.', 400));
  }

  try {
    await setPersistence(auth, browserLocalPersistence).then(async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (!userCredential) {
        return next(new AppError('Invalid email or password'));
      }
      const user = userCredential.user;
      // Send user details and token as response
      const idToken = await user.getIdToken();

      res.status(200).json({
        message: 'Login successful',
        idToken,
        user: {
          email: user.email,
          displayName: user.displayName,
        },
      });
      localStorage.setItem('jwtToken', idToken);
      localStorage.setItem('userCredential', JSON.stringify(userCredential));
    });
  } catch (error) {
    return next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    await setPersistence(auth, browserLocalPersistence).then(async () => {
      const userCredential = await signInWithPopup(auth, googleAuth);
      const user = userCredential.user;

      // Get ID token after successful login
      const idToken = await user.getIdToken();
      await saveUserToMongoose(req, res, user?.uid);
      res.status(200).json({
        message: 'Google login successful',
        idToken,
        user: {
          email: user.email,
          displayName: user.displayName,
        },
      });
    });
  } catch (error) {
    return next(error);
  }
};

const saveUserToMongoose = async (req, res, id) => {
  const {
    username,
    firstName,
    lastName,
    email,
    password,
    nationality,
    primaryLanguage,
    mobile,
    address,
    settings,
  } = req.body;

  try {
    const exist = await User.findOne({ id });
    if (exist) {
      // silently return if user already exists
      return;
    }
    const defAddress = {
      street: '',
      city: '',
      houseNumber: '',
      state: '',
      country: '',
      coordinate: {
        lat: null,
        lng: null,
      },
    };
    const defSettings = {
      language: '',
      occupation: '',
      documents: [],
    };

    // Create a new user instance
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password,
      nationality,
      primaryLanguage,
      mobile,
      address: { ...defAddress, ...address },
      settings: { ...defSettings, ...settings },
      id,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with the created user data (excluding the password)
    const userData = newUser.toObject();
    return userData;
  } catch (err) {
    throw new Error(err);
  }
};

export const logout = async (req, res, next) => {
  await auth.signOut().then(() => {
    localStorage.clear();
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
};

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next('Token is required', 403);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
}
