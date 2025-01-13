import Event from '../models/event.model.js';
import Payment from '../models/payment.model.js';
import { calendar } from '../config/google.js';

export const listPaidUsers = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'SUCCESS' })
      .populate('user', '-password')
      .populate('event');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch paid users' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, price } = req.body;

    // Create Google Meet event
    const calendarEvent = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: title,
        description,
        start: { dateTime: date },
        end: { dateTime: new Date(new Date(date).getTime() + 3600000).toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      }
    });

    const event = await Event.create({
      title,
      description,
      date,
      price,
      meetLink: calendarEvent.data.hangoutLink,
      calendarEventId: calendarEvent.data.id,
      createdBy: req.user.id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, date, price } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update Google Calendar event
    await calendar.events.update({
      calendarId: 'primary',
      eventId: event.calendarEventId,
      requestBody: {
        summary: title,
        description,
        start: { dateTime: date },
        end: { dateTime: new Date(new Date(date).getTime() + 3600000).toISOString() }
      }
    });

    event.title = title;
    event.description = description;
    event.date = date;
    event.price = price;
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete Google Calendar event
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: event.calendarEventId
    });

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
};