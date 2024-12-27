import Notification from '../models/notification.js';
import Request from '../models/request.js';
import User from '../models/user.js';
import sendPushNotification from '../tasks/pushNotification.js';
import AppError from '../utils/appError.js';
import PaginatedQuery from '../utils/paginatedQuery.js';

export const createRequest = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('User not signed in', 403));
    }

    const tempResolver = await User.findById(req.body.tempResolvers?.[0]);

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
      await sendPushAndCreateNotifications(
        createdRequest,
        user,
        req,
        tempResolver,
      );
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
  const {
    search = '',
    category,
    sort = 'createdAt',
    sortDir = 'asc',
    status,
    user,
    history = false,
  } = req.query;

  const searchCriteria = {};

  if (!history || history === 'false') {
    searchCriteria.createdBy = { $ne: req.user._id };
  } else {
    searchCriteria.createdBy = req.user._id;
  }
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
      include: [{ path: 'user', select: 'firstName lastName id avatar' }],
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
    const updateData = req.body?.resolver
      ? { resolver: req.body.resolver, status: 'IN_PROGRESS' }
      : req.body;

    const user = req.user;
    const [request] = await Promise.all([
      Request.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: !req.body.resolver,
      }),
    ]);

    if (!request) {
      return next(new AppError('Request not found', 404));
    }
    await User.findByIdAndUpdate(request.user, {
      $addToSet: { requests: request._id },
    });

    const resolverId = req.body?.resolver
      ? req.body.resolver
      : req.body.tempResolvers?.[0];
    const resolver = await User.findOne({
      _id: resolverId,
    });

    if (!resolver) {
      return next(new AppError('Resolver resolver not found', 401));
    }

    if (resolver?.fmcToken) {
      await sendPushAndCreateNotifications(request, user, req, resolver);
    }

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

const sendPushAndCreateNotifications = async (
  createdRequest,
  user,
  req,
  resolver,
) => {
  const reqBody = { ...req };
  const isAcceptance = req.body?.resolver;
  if (isAcceptance) {
    reqBody.body.description = `${resolver?.username || ''} accepts your request`;
  }
  const notification = {
    title: createdRequest.title,
    description: reqBody.body.description,
    trigger: reqBody.params.id ? 'request_updated' : 'request_created',
    notificationId: createdRequest._id,
    dueDateTime: reqBody.body?.dueDateTime,
    user: isAcceptance ? user._id : resolver._id,
    createdBy: isAcceptance ? user.id : resolver.id,
    owner: isAcceptance ? resolver._id : user._id,
  };
  await sendPushNotification(resolver.fmcToken, {
    title: reqBody.body.title,
    body: reqBody.body.description,
    requestId: createdRequest._id,
    user: resolver._id,
  });
  await new Notification(notification).save();
};

export const getNearbyRequests = async (req, res, next) => {
  const { latitude, longitude, distance = 10 } = req.query; // Distance in km, default 10 km
  const user = req.user;
  if (!latitude || !longitude) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  try {
    // Convert distance from km to meters (1 km = 1000 meters)
    const distanceInMeters = distance * 1000;

    const nearbyRequests = await Request.find({
      coordinate: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)], // [longitude, latitude]
          },
          $maxDistance: distanceInMeters, // Max distance in meters
        },
      },
    })
      .limit(req.params?.limit)
      .where({ createdBy: { $ne: user._id } }) // Exclude current user's requests
      .populate({ path: 'user', select: 'firstName lastName id avatar' })
      .exec();

    res.status(200).json({
      requests: nearbyRequests,
      message: 'Nearby requests fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getTopRequests = async (req, res, next) => {
  const user = req.user;
  req.params.limit = 20;
  if (!req.params?.maxDistance || isNaN(req.params?.maxDistance)) {
    req.params.maxDistance = 100000;
  }
  if (!req.query?.latitude) req.query.latitude = user.coordinate.coordinates[1];
  if (!req.query?.longitude)
    req.query.longitude = user.coordinate.coordinates[1];
  if (!req.query?.distance) req.query.distance = req.params.maxDistance / 1000;
  return getNearbyRequests(req, res, next);
};
