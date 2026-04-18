// Unified API - exports either mock or real API based on environment
export {
  getEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType,
  getOwnerBookings,
  getPublicEventTypes,
  getAvailableSlots,
  createBooking,
} from './realApi';
