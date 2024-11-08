import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import errorHandler from './middlewares/errorHandler.js';
import { handleNotFoundError } from './middlewares/errorUtils.js';
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
import authenticateFirebaseToken from './middlewares/authMiddleware.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Routes
// app.use("/auth", authRoutes);
// app.use("/users", authenticateFirebaseToken, userRoutes);

// 404 Handler
app.use(handleNotFoundError); // Catch any non-existing routes

// Error Handling Middleware
app.use(errorHandler); // Handle all errors

export default app;
