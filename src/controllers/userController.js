import bcrypt from 'bcryptjs/dist/bcrypt.js';
import { admin } from '../config/firebase.cjs';
import User from '../models/user.js';
import AppError from '../utils/appError.js';
import PaginatedQuery from '../utils/paginatedQuery.js';
import TransportEmail from '../tasks/sendMail.js';
import { asyncFn } from '../utils/helpers.js';

export const getUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userData = await User.findOne({ id }).populate('requests');
    if (!userData) {
      return next(new AppError('No user found with that ID', 404));
    }

    const userRecord = await admin.auth().getUser(userData.id);
    return res.status(200).json({ user: { ...userData._doc, ...userRecord } });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  //   const select = {
  //     id: true,
  //     firstName: true,
  //     lastName: true,
  //     email: true,
  //   };
  const {
    search = '',
    userType,
    sort = 'createdAt',
    sortDir = 'asc',
  } = req.query;

  const searchCriteria = {
    id: { $ne: req.user.user_id },
  };

  if (search) {
    // Use $text for indexed fields or $regex for partial text matches
    searchCriteria.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }

  if (userType) {
    searchCriteria.userType = userType;
  }

  const orderBy = { [sort]: sortDir };

  try {
    await new PaginatedQuery({
      req,
      res,
      model: 'User',
      where: searchCriteria,
      orderBy,
      include: [
        {
          path: 'requests',
          select: 'title description dueDateTime status',
        },
      ],
      //   select,
    }).performQuery();
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = req.params; // User ID from the URL

  const body = structuredClone(req.body);
  const currentUser = await admin.auth().getUser(req.user.user_id);
  if (currentUser?.email !== body?.email) {
    body.emailVerified = false;
    body.verified = false;
  }

  delete body.id;
  try {
    const firebaseUser = admin.auth().updateUser(id, {
      ...body,
    });

    if (body?.password) {
      // Hash password after saving to firebase
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      body.password = hashedPassword;
    }
    const authUser = User.findOneAndUpdate({ id }, body, {
      new: true,
      runValidators: true,
    });
    // eslint-disable-next-line no-unused-vars
    const [_, newUser] = await Promise.all([firebaseUser, authUser]);
    res.status(200).json({
      message: 'User updated successfully',
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const firebaseUser = admin.auth().deleteUser(id);
    const authUser = User.findOneAndDelete({ id });
    await Promise.all([firebaseUser, authUser]);
    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export async function sendVerificationEmail(req, res, next) {
  try {
    const userRecord = await admin.auth().getUser(req.user.user_id);
    await admin
      .auth()
      .generateEmailVerificationLink(userRecord.email)
      .then(async (verificationLink) => {
        await new TransportEmail(
          userRecord,
          verificationLink,
        ).sendVerifyEmail();
        res.status(200).json({ message: 'Verification email sent' });
      });
  } catch (error) {
    next(error);
  }
}

export const getNearbyUsers = async (req, res, next) => {
  const { maxDistance = 10000, search = '', userType } = req.params;

  try {
    const user = await User.findOne({ id: req.session.user.uid });
    if (!user) {
      return next(new AppError('User is not logged in', 403));
    }
    const query = {
      id: { $ne: req.user.user_id },
    };
    if (search) {
      // Use $text for indexed fields or $regex for partial text matches
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (userType) {
      query.userType = userType;
    }
    const users = await User.aggregate([
      {
        $geoNear: {
          near: user.coordinate,
          distanceField: 'distance',
          maxDistance: Number(maxDistance),
          spherical: true, // Use spherical geometry for calculations
          query, // Optional: Any additional query criteria
          sort: { distance: 1 }, // Sort by distance, 1 for ascending (nearest first)
        },
      },
    ]);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const updateFmcToken = async (req, res, next) => {
  try {
    const { fmcToken } = req.body;
    const userId = req.user.user_id;

    // Update the user's device token in the database
    const user = await User.findOneAndUpdate(
      { id: userId },
      { fmcToken },
      { new: true },
    );
    if (!user) {
      return next(new AppError('User not logged in', 403));
    }

    res.status(200).json({ message: 'Device token updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findOne({ id: userId }).populate('requests');
    if (!user) {
      return next(new AppError('User not logged in', 403));
    }
    res.status(200).json({ message: 'User fetched', user });
  } catch (error) {
    next(error);
  }
};

export const updateUserLocation = async (req, res, next) => {
  const { latitude, longitude } = req.body;
  try {
    const userId = req.user.user_id;

    const user = await User.findOneAndUpdate(
      { id: userId },
      { coordinate: { type: 'Point', coordinates: [longitude, latitude] } },
      { new: true },
    );
    if (!user) {
      return next(new AppError('User not logged in', 403));
    }
    res.status(200).json({
      message: 'Location saved successfully',
      coordinate: user.coordinate,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSelf = async (req, res, next) => {
  const id = req.user.user_id;
  const body = structuredClone(req.body);
  const currentUser = await admin.auth().getUser(req.user.user_id);
  if (currentUser?.email !== body?.email) {
    body.emailVerified = false;
    body.verified = false;
  }
  delete body.id;
  try {
    const firebaseUser = admin.auth().updateUser(id, {
      photoURL: body.avatar,
      ...body,
    });

    if (body?.password) {
      // Hash password after saving to firebase
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      body.password = hashedPassword;
    }
    const authUser = User.findOneAndUpdate({ id }, body, {
      new: true,
      runValidators: false,
    });
    // eslint-disable-next-line no-unused-vars
    const [_, newUser] = await Promise.all([firebaseUser, authUser]);
    res.status(200).json({
      message: 'User updated successfully',
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = asyncFn(async (req, res) => {
  const user = await User.findOne(req.user.user_id);
  user.emailVerified = true;
  await user.save();
  res.status(200).json({ status: 'Ok', user });
});
