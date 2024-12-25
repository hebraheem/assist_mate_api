import Request from '../models/request.js';
import User from '../models/user.js';
import sendPushNotification from '../tasks/pushNotification.js';
import AppError from '../utils/appError.js';
import PaginatedQuery from '../utils/paginatedQuery.js';

export const createRequest = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.user_id });
    if (!user) {
      return next(new AppError('User not signed in', 403));
    }

    const tempResolver = await User.findOne({
      _id: req.body.tempResolvers?.[0],
    });

    if (!tempResolver) {
      return next(new AppError('Temporary resolver not found', 401));
    }
    const request = new Request({
      ...req.body,
      user: user._id,
      createdBy: user._id,
    });

    await request.save();
    const createdRequest = request.toObject();
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { requests: request._id },
    });

    if (tempResolver?.fmcToken) {
      await sendPushNotification(tempResolver.fmcToken, {
        title: req.body.title,
        body: req.body.description,
        requestId: createdRequest._id,
      });
    }

    res.status(200).json({
      request: createdRequest,
      messaging: 'Request created and sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  //   const select = {
  //     id: true,
  //     firstName: true,
  //     lastName: true,
  //     email: true,
  //   };
  const {
    search = '',
    category,
    sort = 'createdAt',
    sortDir = 'asc',
    status,
    user,
  } = req.query;

  const searchCriteria = {};

  if (search) {
    searchCriteria.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    searchCriteria.category = category;
  }

  if (status) {
    searchCriteria.status = status;
  }
  if (user) {
    searchCriteria.user = user;
  }

  const orderBy = { [sort]: sortDir };

  try {
    await new PaginatedQuery({
      req,
      res,
      model: 'Request',
      where: searchCriteria,
      orderBy,
      include: [{ path: 'user', select: 'firstName lastName id' }],
      //   select,
    }).performQuery();
  } catch (error) {
    next(error);
  }
};

export const getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate({
      path: 'user',
      select: 'firstName lastName id',
    });
    if (!request) {
      return next(new AppError('Request not found', 404));
    }
    res.status(200).json({ request, message: 'Request fetched successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) {
      return next(new AppError('Request not found', 404));
    }
    await User.findByIdAndUpdate(request.user, {
      $addToSet: { requests: request._id },
    });
    res.status(200).json({ request, message: 'Request updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    // Remove the request ID from the user's `requests` array
    await User.findByIdAndUpdate(request.user, {
      $pull: { requests: request._id },
    });

    res.status(201).json({ message: 'Request deleted' });
  } catch (error) {
    next(error);
  }
};
