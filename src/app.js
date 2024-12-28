/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

import errorHandler from './middlewares/errorHandler.js';
import { handleNotFoundError } from './middlewares/errorUtils.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import authenticateFirebaseToken from './middlewares/authMiddleware.js';
import setupSwaggerDocs from './config/swagger.js';
import MongoStore from 'connect-mongo';
import Request from './models/request.js';
import checkOwnership from './middlewares/allowOwner.js';
import Notification from './models/notification.js';
import Chat from './models/chat.js';

const app = express();
dotenv.config();

const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '..', 'public')));
// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Session expiration time (24 hours in this example)
      httpOnly: true, // Make the cookie inaccessible to JavaScript (helps prevent XSS attacks)
      secure: false, // Set to true if using https (can be toggled in production environments)
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  }),
);

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(mongoSanitize()); // prevent against NOSQL injection
app.use(xss()); // prevent against xss attacks

// redirect to swagger UI
app.get('/', (req, res) => {
  if (req.url === '/') {
    res.redirect('/api-docs');
  }
});

// Swagger Docs
setupSwaggerDocs(app);

// Routes
app.use('/auth', authRoutes);
app.use('/', authenticateFirebaseToken, userRoutes);
app.use('/', authenticateFirebaseToken, checkOwnership(Request), requestRoutes);
app.use(
  '/',
  authenticateFirebaseToken,
  checkOwnership(Notification),
  notificationRoutes,
);

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_request', async ({ requestId, userId }) => {
    const request = await Request.findById(requestId).populate('user resolver');

    if (!request) {
      console.log(`Request ${requestId} not found.`);
      return;
    }

    // Ensure only user or resolver can join the chat
    const isParticipant =
      String(request.user._id) === userId ||
      String(request.resolver?._id) === userId;

    if (!isParticipant) {
      console.log(`User ${userId} is not authorized to join this chat.`);
      return;
    }

    socket.join(requestId);
    console.log(`User ${userId} joined request room: ${requestId}`);
  });

  socket.on('send_message', async ({ requestId, senderId, message }) => {
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

      // Link chat to the request
      await Request.findByIdAndUpdate(requestId, {
        $push: { chats: chat._id },
      });

      // Broadcast to all participants
      io.to(requestId).emit('receive_message', {
        requestId,
        senderId,
        message,
        timestamp: chat.timestamp,
      });
    } catch (error) {
      console.error('Error handling send_message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 Handler
app.use(handleNotFoundError); // Catch any non-existing routes

// Error Handling Middleware
app.use(errorHandler); // Handle all errors

export default server;
