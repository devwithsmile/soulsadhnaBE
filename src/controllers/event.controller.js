import Event from '../models/event.model.js';
import Payment from '../models/payment.model.js';
import { calendar } from '../config/google.js';

export const listEvents = async (req, res) => {
  try {
    const events = await Event.find().sort('-date');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event details' });
  }
};

export const bookEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Temporarily bypassing payment check
    /*
    const payment = await Payment.findOne({
      user: req.user.id,
      event: event._id,
      status: 'SUCCESS'
    });

    if (!payment) {
      return res.status(400).json({ message: 'Payment required to book event' });
    }
    */

    // Add user to Google Calendar event
    await calendar.events.patch({
      calendarId: 'primary',
      eventId: event.calendarEventId,
      requestBody: {
        attendees: [{
          email: req.user.email
        }]
      }
    });

    res.json({ message: 'Event booked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to book event' });
  }
};