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

import errorHandler from './middlewares/errorHandler.js';
import { handleNotFoundError } from './middlewares/errorUtils.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authenticateFirebaseToken from './middlewares/authMiddleware.js';
import setupSwaggerDocs from './config/swagger.js';
import MongoStore from 'connect-mongo';
import Request from './models/request.js';
import checkOwnership from './middlewares/allowOwner.js';
import Notification from './models/notification.js';
import { connection, socketIO } from './utils/socket.js';
import { admin } from './config/firebase.cjs';

const app = express();
dotenv.config();

const server = http.createServer(app);

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

// Handle WebSocket connections
const io = socketIO(server);
connection(io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.user = decodedToken;
    next();
  } catch (err) {
    next(new Error(err.message));
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/', authenticateFirebaseToken, userRoutes);
app.use('/', authenticateFirebaseToken, checkOwnership(Request), requestRoutes);
app.use('/', authenticateFirebaseToken, chatRoutes);
app.use(
  '/',
  authenticateFirebaseToken,
  checkOwnership(Notification),
  notificationRoutes,
);

// 404 Handler
app.use(handleNotFoundError); // Catch any non-existing routes

// Error Handling Middleware
app.use(errorHandler); // Handle all errors

export default server;
