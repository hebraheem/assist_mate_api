import { signInWithEmailAndPassword } from 'firebase/auth';
import { admin, auth } from '../config/firebase.cjs';
import localStorage from '../utils/localStorage.js';
import AppError from '../utils/appError.js';
import User from '../models/user.js';
import TransportEmail from '../tasks/sendMail.js';

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
    req.session.user = user;
    return res
      .status(201)
      .json({ user: userRecord, messaging: 'Email verification sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email not provided', 400));
  }

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    await new TransportEmail(
      { email, name: email },
      resetLink,
    ).sendPasswordReset();
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    return next(error);
  }
};

export const confirmResetPassword = async (req, res, next) => {
  const { oobCode, newPassword } = req.body;

  if (!oobCode || !newPassword) {
    return next(new AppError('oobCode and newPassword are required', 400));
  }

  try {
    await admin.auth().confirmPasswordReset(oobCode, newPassword);
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required.', 400));
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (!userCredential) {
      return next(new AppError('Invalid email or password', 404));
    }
    const user = userCredential.user;
    // Send user details and token as response
    const idToken = await user.getIdToken();
    const userAvailable = await User.findOne({ id: user.uid });
    if (!userAvailable) {
      return next(new AppError('User not found.', 400));
    }
    res.status(200).json({
      message: 'Login successful',
      idToken,
      user: {
        email: user.email,
        displayName: user.displayName,
      },
    });
    req.session.user = user;
    localStorage.setItem('jwtToken', idToken);
    localStorage.setItem('userCredential', JSON.stringify(userCredential));
  } catch (error) {
    return next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const user = await saveUserToMongoose(req, res, req.body?.id);
    req.session.user = user;
    res.status(200).json({
      message: 'Google login successful',
      user: {
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const saveUserToMongoose = async (req, _res, id) => {
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
    coordinate,
  } = req.body;

  try {
    const exist = await User.findOne({ id });
    if (exist) {
      // silently return if user already exists
      return exist;
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
      coordinate,
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
    throw err;
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
