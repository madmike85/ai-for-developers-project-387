/**
 * Test Data Fixtures for E2E Tests
 *
 * This file contains test data constants, helper functions, and TypeScript types
 * for end-to-end testing of the Call Calendar application.
 *
 * Data structure aligns with the Prisma seed at packages/db/prisma/seed.ts
 */

// =============================================================================
// TypeScript Types
// =============================================================================

/**
 * Represents an event type in the system
 */
export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

/**
 * Represents a guest for booking
 */
export interface Guest {
  name: string;
  email: string;
}

/**
 * Represents a booking in the system
 */
export interface Booking {
  id?: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Test data container for a test scenario
 */
export interface TestScenario {
  eventType: EventType;
  guest: Guest;
  date: Date;
}

// =============================================================================
// Test Constants
// =============================================================================

/**
 * Base URL for API requests
 * Matches the NestJS backend default port (3333) from AGENTS.md
 */
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3333';

/**
 * Base URL for the web application
 * Matches the Vite dev server default port (5173)
 */
export const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:5173';

/**
 * Default timeout values for test operations (in milliseconds)
 */
export const DEFAULT_TIMEOUTS = {
  /** Short timeout for quick operations */
  SHORT: 5000,
  /** Medium timeout for standard operations */
  MEDIUM: 10000,
  /** Long timeout for slow operations */
  LONG: 60000,
  /** Extra long timeout for initialization */
  XL: 120000,
} as const;

/**
 * API endpoints for bookings
 */
export const API_ENDPOINTS = {
  BOOKINGS: '/bookings',
  EVENT_TYPES: '/event-types',
  AVAILABILITY: '/availability',
} as const;

// =============================================================================
// Event Type Test Data
// =============================================================================

/**
 * Test event types that match the Prisma seed structure
 * IDs follow the pattern: 'et-' + lowercase-name-with-hyphens
 */
export const TEST_EVENT_TYPES = {
  INTRO_CALL: {
    id: 'et-intro-call',
    name: 'Intro Call',
    description: 'Initial introduction call to discuss your needs',
    durationMinutes: 30,
  } as const satisfies EventType,

  CONSULTATION: {
    id: 'et-consultation',
    name: 'Consultation',
    description: 'Detailed consultation session',
    durationMinutes: 60,
  } as const satisfies EventType,

  QUICK_CHAT: {
    id: 'et-quick-chat',
    name: 'Quick Chat',
    description: 'Short 15-minute conversation',
    durationMinutes: 15,
  } as const satisfies EventType,
} as const;

// =============================================================================
// Sample Guest Test Data
// =============================================================================

/**
 * Sample guest data for testing bookings
 */
export const SAMPLE_GUESTS = {
  /** Standard test guest */
  JOHN_DOE: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  } as const satisfies Guest,

  /** Test guest with special characters in name */
  JANE_SMITH: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  } as const satisfies Guest,

  /** Test guest with long name */
  ALEXANDER_HAMILTON: {
    name: 'Alexander Hamilton',
    email: 'alexander.hamilton@example.com',
  } as const satisfies Guest,

  /** Test guest with hyphenated name */
  MARY_JANE_WATSON: {
    name: 'Mary-Jane Watson',
    email: 'mary.jane.watson@example.com',
  } as const satisfies Guest,

  /** Test guest with non-ASCII characters */
  FRANCOIS_MULLER: {
    name: 'François Müller',
    email: 'francois.muller@example.com',
  } as const satisfies Guest,

  /** Test guest for corporate scenarios */
  SARAH_CORP: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@acme.corp',
  } as const satisfies Guest,

  /** Test guest for international scenarios */
  TANAKA_YUKI: {
    name: 'Tanaka Yuki',
    email: 'tanaka.yuki@example.jp',
  } as const satisfies Guest,
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generates a Date object for a future date relative to now
 *
 * @param days - Number of days in the future (default: 1)
 * @param hours - Hour of the day (0-23, default: 10)
 * @param minutes - Minutes (0-59, default: 0)
 * @returns Date object representing the future date
 *
 * @example
 * getFutureDate(3) // Returns date 3 days from now at 10:00 AM
 * getFutureDate(1, 14, 30) // Returns tomorrow at 2:30 PM
 */
export function getFutureDate(
  days: number = 1,
  hours: number = 10,
  minutes: number = 0,
): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Formats a Date object to YYYY-MM-DD format for API usage
 *
 * @param date - Date object to format
 * @returns String in YYYY-MM-DD format
 *
 * @example
 * formatDateForAPI(new Date(2026, 3, 15)) // '2026-04-15'
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a random email address for testing
 * Uses timestamp and random string to ensure uniqueness
 *
 * @param prefix - Optional prefix for the email (default: 'test')
 * @param domain - Optional domain (default: 'test.example.com')
 * @returns Unique test email address
 *
 * @example
 * generateRandomEmail() // 'test.abc123.1744012800@test.example.com'
 * generateRandomEmail('e2e') // 'e2e.xyz789.1744012800@test.example.com'
 */
export function generateRandomEmail(
  prefix: string = 'test',
  domain: string = 'test.example.com',
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}.${randomStr}.${timestamp}@${domain}`;
}

/**
 * Returns an array of all test event types
 *
 * @returns Array of EventType objects
 *
 * @example
 * const eventTypes = getTestEventTypes();
 * // [Intro Call, Consultation, Quick Chat]
 */
export function getTestEventTypes(): readonly EventType[] {
  return [
    TEST_EVENT_TYPES.INTRO_CALL,
    TEST_EVENT_TYPES.CONSULTATION,
    TEST_EVENT_TYPES.QUICK_CHAT,
  ];
}

/**
 * Returns a single test event type by ID
 *
 * @param eventTypeId - The event type ID to look up
 * @returns EventType object or undefined if not found
 */
export function getTestEventTypeById(eventTypeId: string): EventType | undefined {
  return getTestEventTypes().find((et) => et.id === eventTypeId);
}

/**
 * Returns an array of sample guests
 *
 * @returns Array of Guest objects
 */
export function getSampleGuests(): readonly Guest[] {
  return Object.values(SAMPLE_GUESTS);
}

// =============================================================================
// Test Scenario Builders
// =============================================================================

/**
 * Creates a complete test scenario with event type, guest, and future date
 *
 * @param eventTypeId - ID of the event type (default: 'et-intro-call')
 * @param guestKey - Key from SAMPLE_GUESTS (default: 'JOHN_DOE')
 * @param daysFromNow - Days in the future (default: 1)
 * @returns TestScenario object
 */
export function createTestScenario(
  eventTypeId: keyof typeof TEST_EVENT_TYPES = 'INTRO_CALL',
  guestKey: keyof typeof SAMPLE_GUESTS = 'JOHN_DOE',
  daysFromNow: number = 1,
): TestScenario {
  const eventType = TEST_EVENT_TYPES[eventTypeId];
  const guest = SAMPLE_GUESTS[guestKey];
  const date = getFutureDate(daysFromNow);

  return {
    eventType,
    guest,
    date,
  };
}

/**
 * Creates a booking payload for API requests
 *
 * @param eventType - EventType object
 * @param guest - Guest object
 * @param startTime - Start time Date object
 * @returns Booking object ready for API submission
 */
export function createBookingPayload(
  eventType: EventType,
  guest: Guest,
  startTime: Date,
): Omit<Booking, 'id'> {
  const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60000);

  return {
    eventTypeId: eventType.id,
    guestName: guest.name,
    guestEmail: guest.email,
    startTime,
    endTime,
  };
}

// =============================================================================
// Time Slot Helpers
// =============================================================================

/**
 * Generates available time slots for a given date and duration
 *
 * @param date - Base date
 * @param durationMinutes - Duration of each slot
 * @param startHour - Starting hour (default: 9)
 * @param endHour - Ending hour (default: 17)
 * @returns Array of time slot Date objects
 */
export function generateTimeSlots(
  date: Date,
  durationMinutes: number,
  startHour: number = 9,
  endHour: number = 17,
): Date[] {
  const slots: Date[] = [];
  const slotDuration = durationMinutes * 60000;

  const startTime = new Date(date);
  startTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, 0, 0, 0);

  for (let current = startTime.getTime(); current < endTime.getTime(); current += slotDuration) {
    slots.push(new Date(current));
  }

  return slots;
}

/**
 * Formats a time slot for display or API usage
 *
 * @param date - Date object to format
 * @returns Object with various formatted time strings
 */
export function formatTimeSlot(date: Date): {
  iso: string;
  time: string;
  date: string;
  datetime: string;
} {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    iso: date.toISOString(),
    time: `${hours}:${minutes}`,
    date: formatDateForAPI(date),
    datetime: `${formatDateForAPI(date)}T${hours}:${minutes}`,
  };
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validates if a string is a valid email format
 *
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a date is in the future
 *
 * @param date - Date to validate
 * @returns Boolean indicating if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Validates booking time against event duration
 *
 * @param startTime - Start time Date object
 * @param endTime - End time Date object
 * @param expectedDurationMinutes - Expected duration in minutes
 * @returns Boolean indicating if duration matches
 */
export function validateBookingDuration(
  startTime: Date,
  endTime: Date,
  expectedDurationMinutes: number,
): boolean {
  const actualDuration = (endTime.getTime() - startTime.getTime()) / 60000;
  return actualDuration === expectedDurationMinutes;
}
