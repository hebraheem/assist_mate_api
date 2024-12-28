import { Schema, model } from 'mongoose';

const chatSchema = new Schema(
  {
    request: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Chat = model('Chat', chatSchema);

export default Chat;
