import express from 'express';
import {
  updateUser,
  getUser,
  getAllUsers,
  deleteUser,
  sendVerificationEmail,
  getNearbyUsers,
  updateFmcToken,
  getCurrentUser,
  updateUserLocation,
  updateSelf,
} from '../controllers/userController.js';
import hasPermission from '../middlewares/accessMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *           description: The street name for the address.
 *           example: "123 Main St"
 *         city:
 *           type: string
 *           description: The city for the address.
 *           example: "Los Angeles"
 *         houseNumber:
 *           type: string
 *           description: The house or apartment number.
 *           example: "42B"
 *         state:
 *           type: string
 *           description: The state or region.
 *           example: "CA"
 *         country:
 *           type: string
 *           description: The country.
 *           example: "USA"
 *         coordinate:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *               nullable: true
 *               description: The latitude of the location.
 *               example: 34.0522
 *             lng:
 *               type: number
 *               nullable: true
 *               description: The longitude of the location.
 *               example: -118.2437
 *
 *     Settings:
 *       type: object
 *       properties:
 *         language:
 *           type: string
 *           description: The primary language setting.
 *           example: "English"
 *         occupation:
 *           type: string
 *           description: The user's occupation.
 *           example: "Software Developer"
 *         documents:
 *           type: array
 *           description: A list of documents associated with the user.
 *           items:
 *             type: string
 *           example: ["passport.pdf", "resume.pdf"]
 */

/**
 * @swagger
 * tags:
 *   name: auth
 *   description: Authentication related endpoints
 * security:
 *   - BearerAuth: []
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPaginationResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of users matching the filter.
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               description: Current page number.
 *             limit:
 *               type: integer
 *               description: Number of users per page.
 *             pageCount:
 *               type: integer
 *               description: Total number of pages.
 *             totalCount:
 *               type: integer
 *               description: Total count of all users.
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique user ID.
 *         username:
 *           type: string
 *           description: Username of the user.
 *         bio:
 *           type: string
 *           description: User bio.
 *         id:
 *           type: string
 *           description: Firebase user ID.
 *         avatar:
 *           type: string
 *           format: binary
 *           description: User image field.
 *         fmcToken:
 *           type: string
 *           description: Token to connect to firebase for notification.
 *         email:
 *           type: string
 *           description: User's email address.
 *         nationality:
 *           type: string
 *           description: User's nationality.
 *         primaryLanguage:
 *           type: string
 *           description: User's primary language.
 *         mobile:
 *           type: string
 *           description: User's mobile number.
 *         verified:
 *           type: boolean
 *           description: Whether the user's email is verified.
 *         otherLanguages:
 *           type: array
 *           items:
 *             type: string
 *           description: List of other languages the user speaks.
 *         userType:
 *           type: string
 *           description: User type, either SEEKER or HELPER.
 *           enum: [SEEKER, HELPER]
 *         address:
 *            $ref: '#/components/schemas/Address'
 *         settings:
 *            $ref: '#/components/schemas/Settings'
 *         locationAllowed:
 *           type: boolean
 *           description: Whether location access is allowed for the user.
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *           description: User reviews.
 *         chats:
 *           type: array
 *           items:
 *             type: object
 *           description: User's chat information.
 *         requests:
 *           type: array
 *           items:
 *             type: object
 *           description: User's requests.
 *         hobbies:
 *           type: array
 *           items:
 *             type: string
 *           description: User's hobbies.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of user creation.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last user update.
 */

/**
 * @swagger
 * /users/update-fmc-token:
 *   patch:
 *     tags: [users]
 *     summary: Update user notification token
 *     description: Update the user's FCM token for push notifications.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fmcToken:
 *                 type: string
 *                 description: The FCM token generated from the client app.
 *                 example: "your_fmc_token_here"
 *     responses:
 *       200:
 *         description: Device token updated successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

router.patch('/users/update-fmc-token', updateFmcToken);

/**
 * @swagger
 * /users/update-location:
 *   patch:
 *     tags: [users]
 *     summary: Update user notification token
 *     description: Update the user's FCM token for push notifications.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longitude:
 *                 type: number
 *                 description: Current user's longitude
 *                 example: 49.785544
 *               latitude:
 *                 type: number
 *                 description: Current user's latitude.
 *                 example: 9.9544
 *     responses:
 *       200:
 *         description: Device token updated successfully.
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             coordinate:
 *              type: object
 *              properties:
 *               type:
 *                type: string
 *                default: 'Point'
 *               coordinates:
 *                type: array
 *                items:
 *                 type: number
 *                 example: 49.78554
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.patch('/users/update-location', updateUserLocation);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [users]
 *     summary: Get a user
 *     description: Return current login use.
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/me', getCurrentUser);

/**
 * @swagger
 * /users/update/{id}:
 *   patch:
 *     tags: [users]
 *     summary: Update user details
 *     description: Update a user's display name and email.
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User id.
 *         required: true
 *         schema:
 *           type: string
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successfully updated users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.patch('/users/update/:id', hasPermission, updateUser);

/**
 * @swagger
 * /users/me-update:
 *   patch:
 *     tags: [users]
 *     summary: Update user details
 *     description: Update a user's display name and email.
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successfully updated users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.patch('/users/me-update', updateSelf);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [users]
 *     summary: Get a user by id
 *     description: Retrieve user information by their unique id.
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User id.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id', getUser);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [users]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     summary: Retrieve a list of users
 *     description: Retrieve a paginated list of users with optional search, filter, and sorting options.
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search keyword to filter users by username, email, etc.
 *         required: false
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         description: Limit the number of users returned.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *       - name: page
 *         in: query
 *         description: Page number to retrieve.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: userType
 *         in: query
 *         description: Filter users by type.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [SEEKER, HELPER]
 *       - name: sort
 *         in: query
 *         description: Field to sort users by.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [username, createdAt]
 *       - name: sortDirection
 *         in: query
 *         description: Sort direction, either ascending or descending.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPaginationResponse'
 *       500:
 *         description: Server error
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [users]
 *     summary: Delete a user by id
 *     description: Delete user information by their unique id.
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User id.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:id', hasPermission, deleteUser);

/**
 * @swagger
 * /send-verification-email:
 *   post:
 *     tags: [users]
 *     summary: Send verification email
 *     description: Send verification email to logged in user.
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     responses:
 *       200:
 *         description: Email verification sent
 *       404:
 *         description: User not not logged in
 *       500:
 *         description: Server error
 */
router.post('/send-verification-email', sendVerificationEmail);

/**
 * @swagger
 * /users/near/{maxDistance}:
 *   get:
 *     tags: [users]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     summary: Retrieve a list of users within specified coordinates
 *     description: Retrieve a paginated list of users within specified coordinates with optional search, filter, and sorting options.
 *     parameters:
 *       - name: maxDistance
 *         in: path
 *         description: User id.
 *         required: false
 *         default: 10000
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         description: Search keyword to filter users by username, email, etc.
 *         required: false
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         description: Limit the number of users returned.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *       - name: page
 *         in: query
 *         description: Page number to retrieve.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: userType
 *         in: query
 *         description: Filter users by type.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [SEEKER, HELPER]
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPaginationResponse'
 *       500:
 *         description: Server error
 */
router.get('/users/near/:maxDistance', getNearbyUsers);

export default router;
