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

    const tempResolver = await User.findById(
      req.body.tempResolvers?.[0],
    ).select('fmcToken');

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
    searchCriteria['$or'] = [
      { tempResolvers: { $in: [req.user._id] } }, // Current user in tempResolvers
      { resolver: req.user._id }, // Current user as resolver
      { createdBy: req.user._id }, // Current user as resolver
    ];
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
    const request = await Request.findById(req.params.id)
      .populate({ path: 'user', select: 'firstName lastName id avatar' })
      .populate({ path: 'createdBy', select: 'firstName lastName id avatar' })
      .populate({ path: 'resolver', select: 'firstName lastName id avatar' })
      .populate({
        path: 'tempResolvers',
        select: 'firstName lastName id avatar',
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
    const { user } = req;
    const { id } = req.params;
    const updateData = req.body;
    const { tempResolvers } = updateData;

    // Attempt to update the request only if the status is 'CREATED'
    const request = await Request.findOneAndUpdate(
      { _id: id, status: 'CREATED' }, // Only match requests in the 'CREATED' status
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    // If no matching request is found, return an error
    if (!request) {
      return next(
        new AppError(
          'Request not found or cannot be updated in its current status',
          404,
        ),
      );
    }

    // Add the updated request to the user's requests array in a separate update
    const userUpdatePromise = User.findByIdAndUpdate(request.user, {
      $addToSet: { requests: request._id },
    });

    // Handle tempResolvers if provided
    let tempResolverNotificationPromise = null;
    if (tempResolvers?.length > 0) {
      const tempResolver = await User.findById(tempResolvers[0]).select(
        'fmcToken',
      );

      // If tempResolver exists and has an fmcToken, prepare the notification promise
      if (tempResolver?.fmcToken) {
        tempResolverNotificationPromise = sendPushAndCreateNotifications(
          request,
          user,
          req,
          tempResolver,
        );
      }
    }

    // Await the user update and notification (if any) concurrently
    await Promise.all([userUpdatePromise, tempResolverNotificationPromise]);

    // Respond with the updated request
    res.status(200).json({
      request,
      message: 'Request updated successfully',
    });
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
      .where({
        createdBy: { $ne: user._id }, // Exclude current user's requests
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
        $or: [
          { tempResolvers: { $in: [user._id] } }, // Current user in tempResolvers
          { resolver: user._id }, // Current user as resolver
        ],
      })
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

export const acceptRejectOrCancelRequest = async (req, res, next) => {
  const { id, action } = req.params;
  const upperCaseAction = action.toUpperCase();
  const actionTypes = ['ACCEPT', 'REJECT', 'CANCEL'];

  try {
    // Validate action type
    if (!actionTypes.includes(upperCaseAction)) {
      return next(
        new AppError(
          'Invalid action type: action type should be one of ["ACCEPT", "REJECT"]',
          404,
        ),
      );
    }
    // Find the request by ID
    const request = await Request.findById(id);
    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    const onwRequest =
      req.user._id.toString() === request.createdBy.toString() &&
      ['ACCEPT', 'REJECT'].includes(upperCaseAction);

    if (onwRequest) {
      return next(
        new AppError(
          `Cannot update own request as it is currently in ${request.status} status.`,
          400,
        ),
      );
    }
    if (request.status !== 'CREATED') {
      return next(
        new AppError(
          `Request cannot be accepted as it is currently in ${request.status} status.`,
          400,
        ),
      );
    }

    if (upperCaseAction === 'ACCEPT') acceptRequest(request, req);
    if (upperCaseAction === 'REJECT') rejectRequest(request, req);
    if (upperCaseAction === 'CANCEL') cancelRequest(request, req);

    request.tempResolvers = request.tempResolvers.filter(
      (tpr) => tpr._id.toString() !== req.user._id.toString(),
    );

    await request.save();
    const requestOwner = await User.findById(request.user).select('fmcToken');
    if (requestOwner?.fmcToken) {
      await sendPushAndCreateNotifications(
        request,
        req.user,
        req,
        requestOwner,
      );
    }

    return res.status(200).json({
      status: 'success',
      message: `Request successfully ${action}ed and updated.`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const acceptRequest = async (request, req) => {
  request.status = 'IN_PROGRESS';
  request.resolver = req.user._id;
  request.requestOffer = {
    reason: req.body.reason,
    paid: req.body.paid,
    currency: req.body.currency,
    paymentAmount: req.body.paymentAmount,
  };
};

const rejectRequest = async (request, req) => {
  request.status = 'REJECTED';
  request.resolver = null;
  request.requestOffer = {
    reason: req.body.reason,
  };
};

const cancelRequest = async (request, req) => {
  request.status = 'CANCELLED';
  request.resolver = null;
  request.requestOffer = {
    reason: req.body.reason,
  };
};

const sendPushAndCreateNotifications = async (
  createdRequest,
  user,
  req,
  resolver,
) => {
  const reqBody = { ...req };
  const isAcceptance =
    req.params?.action === 'ACCEPT' || req.params?.action === 'REJECT';
  if (isAcceptance) {
    reqBody.body.description = `${resolver?.fullName || ''} accepts your request`;
  }
  if (req.params?.action === 'CANCEL') {
    reqBody.body.description = `${user?.fullName || ''} accepts your request`;
  }
  if (!reqBody.body.description) reqBody.body.description = req.body.reason;
  const notification = {
    title: createdRequest.title,
    description: reqBody.body.description,
    trigger:
      reqBody.params.id && !reqBody.params?.action
        ? 'request_updated'
        : `request_${reqBody.params?.action ?? 'created'}ed`,
    notificationId: createdRequest._id,
    dueDateTime: reqBody.body?.dueDateTime,
    user: isAcceptance ? user._id : resolver._id,
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
