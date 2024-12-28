import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    trigger: {
      type: String,
      required: true,
      trim: true,
    },
    notificationId: {
      type: String,
      required: true,
      trim: true,
    },
    dueDateTime: {
      type: Date,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // createdBy: {
    //   type: String,
    //   required: true,
    //   ref: 'User',
    // },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification = model('Notification', notificationSchema);

export default Notification;
