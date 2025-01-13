import express from 'express';
import { listEvents, getEventDetails, bookEvent } from '../controllers/event.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List all events
 *     tags: [Events]
 */
router.get('/', listEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event details
 *     tags: [Events]
 */
router.get('/:id', getEventDetails);

/**
 * @swagger
 * /api/events/{id}/book:
 *   post:
 *     summary: Book an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/book', authenticateUser, bookEvent);

export default router;