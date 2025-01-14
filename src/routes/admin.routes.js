import express from 'express';
import { listPaidUsers, createEvent, updateEvent, deleteEvent } from '../controllers/admin.controller.js';
import { authenticateUser, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token in the format - Bearer <token>
 * 
 * /api/admin/payments:
 *   get:
 *     summary: List paid users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/payments', authenticateUser, isAdmin, listPaidUsers);

/**
 * @swagger
 * /api/admin/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Protected endpoint - Requires a valid JWT Bearer token in Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - startTime
 *               - endTime
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the event
 *                 example: "Test Event"
 *               description:
 *                 type: string
 *                 description: Detailed description of the event
 *                 example: "Test Description"
 *               date:
 *                 type: string
 *                 pattern: '^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-\d{4}$'
 *                 description: Event date in DD-MM-YYYY format
 *                 example: "15-01-2025"
 *               startTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 description: Start time of the event (HH:mm)
 *                 example: "14:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 description: End time of the event (HH:mm)
 *                 example: "15:00"
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of the event
 *                 example: 99.99
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post('/events', authenticateUser, isAdmin, createEvent);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Protected endpoint - Requires a valid JWT Bearer token in Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the event to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the event
 *                 example: "Updated Event Title"
 *               description:
 *                 type: string
 *                 description: Detailed description of the event
 *                 example: "Updated Description"
 *               date:
 *                 type: string
 *                 pattern: '^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-\d{4}$'
 *                 description: Event date in DD-MM-YYYY format
 *                 example: "16-01-2025"
 *               startTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 description: Start time of the event (HH:mm)
 *                 example: "15:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 description: End time of the event (HH:mm)
 *                 example: "16:00"
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of the event
 *                 example: 89.99
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Event not found
 */
router.put('/events/:id', authenticateUser, isAdmin, updateEvent);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Protected endpoint - Requires a valid JWT Bearer token in Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the event to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Event not found
 */
router.delete('/events/:id', authenticateUser, isAdmin, deleteEvent);

export default router;