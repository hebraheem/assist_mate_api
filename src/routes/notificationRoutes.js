import express from 'express';
import {
  deleteNotification,
  getNotification,
  getNotifications,
  readAllNotifications,
  updateNotificationStatus,
} from '../controllers/notificationController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64b3a4fa1a2e8b7a7d2c120f"
 *         title:
 *           type: string
 *           example: "New Notification"
 *         body:
 *           type: string
 *           example: "You have a new message."
 *         read:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-12-31T12:34:56.789Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-12-31T12:34:56.789Z"
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints for managing notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     parameters:
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
 *       - name: read
 *         in: query
 *         description: Filter notification by status.
 *         required: false
 *         schema:
 *           type: boolean
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
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notifications fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notification:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *                   example: Notification fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/notifications', getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     security:
 *       - BearerAuth: []  # Ensure BearerAuth is properly defined in your Swagger config
 *     summary: Update the status of multiple notifications
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "64b3a4fa1a2e8b7a7d2c120f"
 *     responses:
 *       200:
 *         description: Notifications updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notifications updated successfully."
 *                 updatedCount:
 *                   type: integer
 *                   example: 3
 *       404:
 *         description: One or more notifications not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification(s) not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

router.patch('/notifications/read-all', readAllNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *                   example: Notification fetched successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.get('/notifications/:id', getNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     summary: Update the status of a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               read:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Notification updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *                   example: Notification updated successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.patch('/notifications/:id', updateNotificationStatus);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *         in: headers
 *     summary: Delete a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Notification deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.delete('/notifications/:id', deleteNotification);

export default router;
