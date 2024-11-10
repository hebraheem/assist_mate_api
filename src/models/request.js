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
      required: true,
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
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
  },
  { timestamps: true },
);

requestSchema.index({
  title: 'text',
  description: 'text',
});

const Request = model('Request', requestSchema);

export default Request;
