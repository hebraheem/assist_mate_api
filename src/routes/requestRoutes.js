import express from 'express';
import {
  createRequest,
  deleteRequest,
  getNearbyRequests,
  getRequest,
  getRequests,
  getTopRequests,
  updateRequest,
} from '../controllers/requestController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationResponse:
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
 *             $ref: '#/components/schemas/request'
 *
 *     request:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - dueDateTime
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the request.
 *         title:
 *           type: string
 *           description: Title of the request.
 *           example: "Fix plumbing issue"
 *         category:
 *           type: string
 *           description: Category of the request.
 *           example: "Maintenance"
 *         description:
 *           type: string
 *           description: Detailed description of the request.
 *           example: "Leaking pipe in the kitchen."
 *         dueDateTime:
 *           type: string
 *           format: date-time
 *           description: Due date and time for the request.
 *         status:
 *           type: string
 *           description: Status of the request.
 *           enum: [CREATED, IN_PROGRESS, COMPLETED]
 *           example: "CREATED"
 *         otherCategory:
 *           type: string
 *           description: Custom category if not listed.
 *         chats:
 *           type: array
 *           items:
 *             type: string
 *           description: List of chat message IDs related to the request.
 *         user:
 *           type: string
 *           description: User ID who created the request.
 *         resolver:
 *           type: string
 *           description: User ID of the resolver.
 *         tempResolvers:
 *           type: array
 *           items:
 *             type: string
 *           description: List of potential resolvers.
 *         coordinate:
 *           type: object
 *           properties:
 *            type:
 *             type: string
 *             default: 'Point'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the request was created.
 */

/**
 * @swagger
 * /requests/top-20/{maxDistance}:
 *   get:
 *     summary: Get all requests within specified distance default to 10KM
 *     tags: [request]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - name: maxDistance
 *         in: path
 *         description: distance to filter within.
 *         required: false
 *         schema:
 *           type: number
 *           default: 10000
 *     responses:
 *       200:
 *         description: List of requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/requests/top-20/:maxDistance', getTopRequests);

/**
 * @swagger
 * /requests/near:
 *   get:
 *     summary: Get all requests
 *     tags: [request]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 12.9716
 *         description: Latitude of the user's current location
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 77.5946
 *         description: Longitude of the user's current location
 *       - in: query
 *         name: distance
 *         required: false
 *         schema:
 *           type: number
 *           example: 10
 *         description: Radius in kilometers (default is 10 km)
 *     responses:
 *       200:
 *         description: List of requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/requests/near', getNearbyRequests);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all requests
 *     tags: [request]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - name: history
 *         in: query
 *         description: Search keyword to filter users by title, and description.
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: search
 *         in: query
 *         description: Search keyword to filter users by title, and description.
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
 *       - name: category
 *         in: query
 *         description: Filter request category.
 *         required: false
 *         schema:
 *           type: string
 *       - name: user
 *         in: query
 *         description: Filter request category.
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter request category.
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']
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
 *         description: List of requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/requests', getRequests);

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Get request by ID
 *     tags: [request]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the request
 *     responses:
 *       200:
 *         description: Request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/request'
 *       404:
 *         description: Request not found
 */
router.get('/requests/:id', getRequest);

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new request
 *     tags: [request]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/request'
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/requests', createRequest);

/**
 * @swagger
 * /requests/{id}:
 *   patch:
 *     summary: Update an existing request
 *     tags: [request]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the request to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/request'
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Request not found
 */
router.patch('/requests/:id', updateRequest);

/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Delete a request
 *     tags: [request]
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the request to delete
 *     responses:
 *       204:
 *         description: Request deleted successfully
 *       404:
 *         description: Request not found
 */
router.delete('/requests/:id', deleteRequest);

export default router;
