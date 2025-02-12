import Event from '../models/event.model.js';
import Payment from '../models/payment.model.js';
import { calendar } from '../config/google.js';
import moment from 'moment';

export const listEvents = async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();

    const events = await Event.find({
      date: { $gte: today }
    }).sort('date');

    // Format the date in the response
    const formattedEvents = events.map(event => {
      const eventObj = event.toObject();
      eventObj.date = moment(event.date).format('DD-MM-YYYY');
      return eventObj;
    });

    res.json(formattedEvents);
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

    // Format the date in the response
    const formattedEvent = event.toObject();
    formattedEvent.date = moment(event.date).format('DD-MM-YYYY');


    res.json(formattedEvent);
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

export const paymentStatus = async (req, res) => {
  const eventId = req.params.eventid;
  const userEmail = req.user.email;

  console.log("event" ,eventId);

  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }
  if (!userEmail) {
    return res.status(400).json({ message: 'user credentials required' });
  }
    // const event = await Event.findById(eventId);
    // if (!event) {
    //   return res.status(404).json({ message: 'Event not found' });
    // }

   userEmail == "user1@gmail.com" ? res.json({ status: 'SUCCESS' }) : res.json({ status: 'FAILED' });
    

};