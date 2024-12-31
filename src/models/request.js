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
      enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'],
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
        default: [],
      },
    ],
    destination: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    coordinate: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestOffer: {
      paid: { type: Boolean, default: false },
      paymentAmount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      currency: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

requestSchema.index({ coordinate: '2dsphere' });
requestSchema.index({ resolver: 1 });
requestSchema.index({ tempResolvers: 1 });
requestSchema.index({
  title: 'text',
  description: 'text',
});

const Request = model('Request', requestSchema);

export default Request;
