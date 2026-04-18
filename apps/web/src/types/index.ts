// Types based on TypeSpec API specification

// =============== CORE MODELS ===============

export interface EventType {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  createdAt: string; // UTC ISO string
  updatedAt: string; // UTC ISO string
}

export interface Booking {
  id: string;
  eventTypeId: string;
  eventType: EventType;
  guestName: string;
  guestEmail: string;
  startTime: string; // UTC ISO string
  endTime: string; // UTC ISO string
  createdAt: string; // UTC ISO string
}

export interface TimeSlot {
  startTime: string; // UTC ISO string
  endTime: string; // UTC ISO string
  isAvailable: boolean;
}

// =============== REQUEST MODELS ===============

export interface CreateEventTypeRequest {
  name: string;
  description?: string;
  durationMinutes: number;
}

export interface UpdateEventTypeRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string; // UTC ISO string
}

// =============== ERROR MODELS ===============

export interface ApiError {
  code: string;
  message: string;
}

export interface NotFoundError extends ApiError {
  code: 'NOT_FOUND';
}

export interface ConflictError extends ApiError {
  code: 'TIME_SLOT_OCCUPIED';
  conflictingBookingId: string;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  details: string[];
}

export interface BadRequestError extends ApiError {
  code: 'BAD_REQUEST';
}

// =============== API RESPONSE TYPES ===============

export type ApiResponse<T> = T | ApiError;

// =============== APP STATE TYPES ===============

export interface BookingFlowState {
  selectedEventType: EventType | null;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
}
