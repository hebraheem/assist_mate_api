import express from 'express';
import { check } from 'express-validator';
import {
  createUser,
  googleLogin,
  loginUser,
  resetPassword,
  logout,
  confirmResetPassword,
} from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [auth]
 *     summary: Register a new user
 *     description: Create a new user with email, password, and display name.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               username:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: User created successfully.
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Internal server error.
 */
router.post(
  '/register',
  [
    check('email', 'Please provide a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({
      min: 8,
    }),
    check('displayName', 'Display name is required').not().isEmpty(),
  ],
  createUser,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     summary: User Login
 *     description: Logs a user in with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT Token for authenticated user
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [auth]
 *     summary: Request password reset
 *     description: Sends a password reset link to the provided email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully.
 *       400:
 *         description: Invalid email or email not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /auth/confirm-reset-password:
 *   post:
 *     tags: [auth]
 *     summary: Request password reset
 *     description: Sends a password reset link to the provided email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *               oobCode:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Password reset link sent successfully.
 *       400:
 *         description: Invalid email or email not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/confirm-reset-password', confirmResetPassword);

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     tags: [auth]
 *     summary: Login using Google and return a Firebase token.
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "text@example.com"
 *                 password:
 *                   type: string
 *                   example: "Password123"
 *                 id:
 *                   type: string
 *                   example: "firebase-id-token"
 *     responses:
 *       200:
 *         description: Login successful, returns a token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "text@example.com"
 *                 password:
 *                   type: string
 *                   example: "Password123"
 *                 id:
 *                   type: string
 *                   example: "firebase-id-token"
 *       400:
 *         description: Invalid Google ID token.
 *       500:
 *         description: Internal server error.
 */
router.post('/google-login', googleLogin);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [auth]
 *     summary: Logout user
 *     description: Logout user.
 */
router.post('/logout', logout);

export default router;
