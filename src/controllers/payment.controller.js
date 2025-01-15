import { createPaymentOrder, verifyPaymentWebhook } from '../services/payment.service.js';
import Event from '../models/event.model.js';

export const initiatePayment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const customerDetails = {
      email: req.user.email,
      phone: req.body.phone,
      name: req.user.name
    };

    const order = await createPaymentOrder(userId, eventId, event.price, customerDetails);
    res.json(order);
  } catch (error) {
    console.error('Payment initiation failed:', error);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  try {
    const payment = await verifyPaymentWebhook(req.body);
    
    if (payment.status === 'SUCCESS') {
      // Update event booking status or send confirmation email
      // This can be handled by a separate service
    }
    
    res.json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};