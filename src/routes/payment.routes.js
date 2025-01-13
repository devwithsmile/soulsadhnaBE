// Temporarily disabled payment routes
/*
import express from 'express';
import { initiatePayment, handlePaymentWebhook } from '../controllers/payment.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/events/:eventId/pay', authenticateUser, initiatePayment);
router.post('/webhook', handlePaymentWebhook);

export default router;
*/