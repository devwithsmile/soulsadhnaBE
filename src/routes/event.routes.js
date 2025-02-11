import express from 'express';
import { listEvents, getEventDetails, bookEvent, paymentStatus } from '../controllers/event.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 67868e30ef127bd0e2bf47b7
 *         title:
 *           type: string
 *           example: Test Event
 *         description:
 *           type: string
 *           example: Test Description
 *         date:
 *           type: string
 *           format: date
 *           example: 20-01-2025
 *         startTime:
 *           type: string
 *           example: 14:00
 *         endTime:
 *           type: string
 *           example: 15:00
 *         price:
 *           type: number
 *           format: float
 *           example: 99.99
 *         meetLink:
 *           type: string
 *           example: https://meet.google.com/nop-hmzb-tua
 *         calendarEventId:
 *           type: string
 *           example: qc929dqf1886bb9v1s5p175k74
 *         createdBy:
 *           type: string
 *           example: 67867db2298216ea6e8c7439
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-01-14T16:17:52.324Z
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List all upcoming events
 *     description: Retrieves a list of all events from today onwards. Past events are not included.
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch events
 */
router.get('/', listEvents);

router.get('/payments', authenticateUser, paymentStatus);


/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event details by ID
 *     description: Retrieves detailed information about a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *         example: 67868e30ef127bd0e2bf47b7
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch event details
 */
router.get('/:id', getEventDetails);

/**
 * @swagger
 * /api/events/{id}/book:
 *   post:
 *     summary: Book an event
 *     description: Books an event for the authenticated user and adds them to the Google Calendar event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID to book
 *         example: 67868e30ef127bd0e2bf47b7
 *     responses:
 *       200:
 *         description: Event booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event booked successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment required to book event
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to book event
 */
router.post('/:id/book', authenticateUser, bookEvent);


export default router;