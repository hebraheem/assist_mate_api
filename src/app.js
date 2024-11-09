import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import dotenv from 'dotenv';

import errorHandler from './middlewares/errorHandler.js';
import { handleNotFoundError } from './middlewares/errorUtils.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authenticateFirebaseToken from './middlewares/authMiddleware.js';
import setupSwaggerDocs from './config/swagger.js';
import MongoStore from 'connect-mongo';

const app = express();
dotenv.config();

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
      mongoUrl: process.env.MONGO_URI, // MongoDB URL
    }),
  }),
);

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Swagger Docs
setupSwaggerDocs(app);

// Routes
app.use('/auth', authRoutes);
app.use('/', authenticateFirebaseToken, userRoutes);

// 404 Handler
app.use(handleNotFoundError); // Catch any non-existing routes

// Error Handling Middleware
app.use(errorHandler); // Handle all errors

export default app;
