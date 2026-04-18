import type {
  EventType,
  Booking,
  TimeSlot,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  CreateBookingRequest,
} from '../types';
import { mockEventTypes, mockBookings, generateMockBooking } from './mockData';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory storage for CRUD operations
let eventTypes = [...mockEventTypes];
let bookings = [...mockBookings];

// =============== OWNER API ===============

export const mockGetEventTypes = async (): Promise<EventType[]> => {
  await delay(300);
  return [...eventTypes];
};

export const mockGetEventTypeById = async (id: string): Promise<EventType | null> => {
  await delay(200);
  const eventType = eventTypes.find((et) => et.id === id);
  return eventType || null;
};

export const mockCreateEventType = async (
  data: CreateEventTypeRequest
): Promise<EventType> => {
  await delay(500);
  const newEventType: EventType = {
    id: `et-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  eventTypes.push(newEventType);
  return newEventType;
};

export const mockUpdateEventType = async (
  id: string,
  data: UpdateEventTypeRequest
): Promise<EventType | null> => {
  await delay(400);
  const index = eventTypes.findIndex((et) => et.id === id);
  if (index === -1) return null;

  eventTypes[index] = {
    ...eventTypes[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return eventTypes[index];
};

export const mockDeleteEventType = async (id: string): Promise<void> => {
  await delay(300);
  const index = eventTypes.findIndex((et) => et.id === id);
  if (index === -1) {
    throw new Error('Event type not found');
  }
  
  eventTypes.splice(index, 1);
};

export const mockGetOwnerBookings = async (): Promise<Booking[]> => {
  await delay(400);
  // Sort by start time (newest first)
  return [...bookings].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
};

// =============== PUBLIC API (GUEST) ===============

export const mockGetPublicEventTypes = async (): Promise<EventType[]> => {
  await delay(300);
  return [...eventTypes];
};

export const mockGetAvailableSlots = async (
  eventTypeId: string,
  date: Date
): Promise<TimeSlot[]> => {
  await delay(500);
  
  const eventType = eventTypes.find((et) => et.id === eventTypeId);
  if (!eventType) throw new Error('Event type not found');

  // Generate slots for the date (9:00 - 18:00)
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 18;
  const durationMinutes = eventType.durationMinutes;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += durationMinutes) {
      const slotStart = new Date(date);
      slotStart.setUTCHours(hour, minute, 0, 0);
      
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      
      // Check if slot overlaps with any existing booking
      const isOverlapping = bookings.some((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        return (
          slotStart < bookingEnd && slotEnd > bookingStart
        );
      });

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        isAvailable: !isOverlapping,
      });
    }
  }

  return slots;
};

export const mockCreateBooking = async (
  data: CreateBookingRequest
): Promise<Booking> => {
  await delay(600);
  
  const eventType = eventTypes.find((et) => et.id === data.eventTypeId);
  if (!eventType) throw new Error('Event type not found');

  const startTime = new Date(data.startTime);
  
  // Check for conflicts
  const isConflicting = bookings.some((booking) => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    const newEndTime = new Date(startTime.getTime() + eventType.durationMinutes * 60 * 1000);
    
    return startTime < bookingEnd && newEndTime > bookingStart;
  });

  if (isConflicting) {
    throw new Error('TIME_SLOT_OCCUPIED');
  }

  const newBooking = generateMockBooking(
    eventType,
    data.guestName,
    data.guestEmail,
    startTime
  );
  
  bookings.push(newBooking);
  return newBooking;
};
