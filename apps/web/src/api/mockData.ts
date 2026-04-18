import type { EventType, Booking } from '../types';

// Generate UTC ISO strings
const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setUTCHours(10, 0, 0, 0);

const dayAfterTomorrow = new Date(now);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
dayAfterTomorrow.setUTCHours(14, 0, 0, 0);

export const mockEventTypes: EventType[] = [
  {
    id: 'et-1',
    name: 'Intro Call',
    description: 'Initial introduction call to discuss your needs',
    durationMinutes: 30,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'et-2',
    name: 'Consultation',
    description: 'Detailed consultation session',
    durationMinutes: 60,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'et-3',
    name: 'Quick Chat',
    description: 'Short 15-minute conversation',
    durationMinutes: 15,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'bk-1',
    eventTypeId: 'et-1',
    eventType: mockEventTypes[0],
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    startTime: tomorrow.toISOString(),
    endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bk-2',
    eventTypeId: 'et-2',
    eventType: mockEventTypes[1],
    guestName: 'Jane Smith',
    guestEmail: 'jane@example.com',
    startTime: dayAfterTomorrow.toISOString(),
    endTime: new Date(dayAfterTomorrow.getTime() + 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to generate mock bookings dynamically
export const generateMockBooking = (
  eventType: EventType,
  guestName: string,
  guestEmail: string,
  startTime: Date
): Booking => {
  const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60 * 1000);
  return {
    id: `bk-${Date.now()}`,
    eventTypeId: eventType.id,
    eventType,
    guestName,
    guestEmail,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    createdAt: new Date().toISOString(),
  };
};
