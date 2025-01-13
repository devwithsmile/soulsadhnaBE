import express from 'express';
import { listPaidUsers, createEvent, updateEvent, deleteEvent } from '../controllers/admin.controller.js';
import { authenticateUser, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
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
 */
router.delete('/events/:id', authenticateUser, isAdmin, deleteEvent);

export default router;