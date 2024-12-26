import Notification from '../models/notification.js';
import AppError from '../utils/appError.js';
import PaginatedQuery from '../utils/paginatedQuery.js';

export const getNotifications = async (req, res, next) => {
  const { sort = 'createdAt', sortDir = 'asc', read } = req.query;

  const searchCriteria = {};

  if (read) {
    searchCriteria.read = read;
  }
  if (req.user?.user_id) {
    searchCriteria.createdBy = req.user.user_id;
  }

  const orderBy = { [sort]: sortDir };
  const copyQuery = { ...req };

  try {
    await new PaginatedQuery({
      req: copyQuery,
      res,
      model: 'Notification',
      where: searchCriteria,
      orderBy,
      include: [{ path: 'user', select: 'firstName lastName id' }],
    }).performQuery();
  } catch (error) {
    next(error);
  }
};

export const getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    await Notification.findByIdAndUpdate(
      notification._id,
      { read: true },
      { new: true },
    );
    res
      .status(200)
      .json({ notification, message: 'Notification fetched successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationStatus = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: req.body.read },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res
      .status(200)
      .json({ notification, message: 'notification updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const readAllNotifications = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { _id: { $in: req.body.ids } },
      { $set: { read: true } },
    );
    res.status(200).json({
      status: 'success',
      message: `Updated ${result.modifiedCount} of ${result.matchedCount} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    res.status(201).json({ message: 'notification deleted' });
  } catch (error) {
    next(error);
  }
};
