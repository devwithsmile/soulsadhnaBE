import Event from '../models/event.model.js';
import Payment from '../models/payment.model.js';
import { calendar } from '../config/google.js';

const convertToGoogleCalendarDateTime = (dateStr, timeStr) => {
  // dateStr expected as "DD-MM-YYYY"
  // timeStr expected as "HH:mm"
  const [day, month, year] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}T${timeStr}:00`).toISOString();
};

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
    const { title, description, date, startTime, endTime, price } = req.body;
    console.log("Request body:", { title, description, date, startTime, endTime, price });

    // Convert the dates to Google Calendar format
    const startDateTime = convertToGoogleCalendarDateTime(date, startTime);
    const endDateTime = convertToGoogleCalendarDateTime(date, endTime);
    
    // Create Google Meet event
    console.log("Attempting to create Google Calendar event...");
    const calendarEvent = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: title,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
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
      date: startDateTime, // Store the full start datetime
      startTime,
      endTime,
      price,
      meetLink: calendarEvent.data.hangoutLink,
      calendarEventId: calendarEvent.data.id,
      createdBy: req.user.id
    });
    console.log("event", event);

    res.status(201).json(event);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ 
      message: 'Failed to create event',
      error: error.message,
      details: error.response?.data
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, price } = req.body;
    const event = await Event.findById(req.params.id);
    console.log("event", event);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Convert the dates to Google Calendar format
    const startDateTime = convertToGoogleCalendarDateTime(date, startTime);
    const endDateTime = convertToGoogleCalendarDateTime(date, endTime);
    console.log("Start DateTime:", startDateTime);
    console.log("End DateTime:", endDateTime);

    // Convert the date to a Date object for MongoDB
    const eventDate = new Date(date.split('-').reverse().join('-')); // Convert "DD-MM-YYYY" to "YYYY-MM-DD"

    // Update Google Calendar event
    const calendarUpdateResponse = await calendar.events.update({
      calendarId: 'primary',
      eventId: event.calendarEventId,
      requestBody: {
        summary: title,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime }
      }
    });
    console.log("Google Calendar Update Response:", calendarUpdateResponse.data);

    event.date = startDateTime; // Store the full start datetime
    event.startTime = startTime;
    event.endTime = endTime;

    event.title = title;
    event.description = description;
    event.date = eventDate; // Use the converted Date object
    event.price = price;
    await event.save();

    res.json(event);
  } catch (error) {
    console.error("Detailed error:", error); // Log the detailed error
    res.status(500).json({ message: 'Failed to update event', error: error.message });
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