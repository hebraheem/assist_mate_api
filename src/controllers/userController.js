import bcrypt from 'bcryptjs/dist/bcrypt.js';
import { admin, auth } from '../config/firebase.cjs';
import User from '../models/user.js';
import AppError from '../utils/appError.js';
import PaginatedQuery from '../utils/paginatedQuery.js';
import { sendEmailVerification } from 'firebase/auth';

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

  const searchCriteria = {};

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
  const currentUser = auth.currentUser;
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
  const user = auth.currentUser;
  if (!user) next(new AppError('No user is currently signed in', 400));
  try {
    await sendEmailVerification(user, {
      url: messageChannelUrl,
      handleCodeInApp: true,
    });
    res.status(200).json({
      message: 'Verification email sent',
    });
  } catch (error) {
    next(error);
  }
}
