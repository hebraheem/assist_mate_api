/* eslint-disable no-console */
import { Server } from 'socket.io';
import Chat from '../models/chat.js';
import Request from '../models/request.js';
import dotenv from 'dotenv';
import sendPushNotification from '../tasks/pushNotification.js';
import User from '../models/user.js';

dotenv.config();

export const socketIO = (server) => {
  return new Server(server, {
    transports: ['polling', 'websocket'],
    cors: {
      origin: '*',
    },
  });
};

export const connection = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_room', (room) => {
      console.log(`User joined room: ${room}`);
      socket.join(room);
    });
    socket.on(
      'send_message',
      async ({ requestId, senderId, message, room, receiverId }) => {
        try {
          const request =
            await Request.findById(requestId).populate('user resolver');

          if (!request) {
            console.error(`Request ${requestId} not found.`);
            return;
          }

          // Ensure sender is either the user or resolver
          const isParticipant =
            String(request.user._id) === senderId ||
            String(request.resolver?._id) === senderId;

          if (!isParticipant) {
            console.error(
              `Sender ${senderId} is not authorized to send messages in this chat.`,
            );
            return;
          }

          // Create and save chat message
          const chat = new Chat({
            request: requestId,
            participants: [request.user._id, request.resolver._id],
            sender: senderId,
            message,
          });
          await chat.save();

          const [receiver, populatedChat] = await Promise.all([
            User.findById(receiverId).select('fmcToken'),
            Chat.findById(chat._id).populate([
              { path: 'sender', select: 'firstName lastName _id avatar' },
            ]),
            Request.findByIdAndUpdate(requestId, {
              $push: { chats: chat._id },
            }),
          ]);

          // Broadcast to all participants
          io.to(room).emit('receive_message', {
            requestId,
            senderId,
            sender: populatedChat.sender,
            message,
            timestamp: chat.timestamp,
          });

          const fullName = `${populatedChat?.sender?.firstName || ''} ${
            populatedChat?.sender?.lastName || ''
          }`;

          if (receiver?.fmcToken) {
            // Send push notification to resolver
            await sendPushNotification(receiver.fmcToken, {
              title: `New message from ${fullName}`,
              body: message,
              requestId: requestId,
              user: receiverId,
            });
          }
        } catch (error) {
          console.error('Error handling send_message:', error);
        }
      },
    );

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
