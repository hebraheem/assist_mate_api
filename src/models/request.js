import { Schema, model } from 'mongoose';

const requestSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    dueDateTime: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
      default: 'CREATED',
    },
    otherCategory: {
      type: String,
      trim: true,
    },
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    resolver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    tempResolvers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    coordinate: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

requestSchema.index({ coordinate: '2dsphere' });
requestSchema.index({
  title: 'text',
  description: 'text',
});

const Request = model('Request', requestSchema);

export default Request;
