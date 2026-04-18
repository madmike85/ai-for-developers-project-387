import axios from 'axios';
import type {
  EventType,
  Booking,
  TimeSlot,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  CreateBookingRequest,
} from '../types';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============== OWNER API ===============

export const getEventTypes = async (): Promise<EventType[]> => {
  const response = await apiClient.get('/api/event-types');
  return response.data;
};

export const getEventTypeById = async (id: string): Promise<EventType | null> => {
  try {
    const response = await apiClient.get(`/api/event-types/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createEventType = async (
  data: CreateEventTypeRequest
): Promise<EventType> => {
  const response = await apiClient.post('/api/event-types', data);
  return response.data;
};

export const updateEventType = async (
  id: string,
  data: UpdateEventTypeRequest
): Promise<EventType | null> => {
  try {
    const response = await apiClient.patch(`/api/event-types/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const deleteEventType = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/event-types/${id}`);
};

export const getOwnerBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get('/api/owner/bookings');
  return response.data;
};

// =============== PUBLIC API (GUEST) ===============

export const getPublicEventTypes = async (): Promise<EventType[]> => {
  const response = await apiClient.get('/public/event-types');
  return response.data;
};

export const getAvailableSlots = async (
  eventTypeId: string,
  date: Date
): Promise<TimeSlot[]> => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const response = await apiClient.get('/public/slots', {
    params: { eventTypeId, date: dateStr },
  });
  return response.data;
};

export const createBooking = async (
  data: CreateBookingRequest
): Promise<Booking> => {
  const response = await apiClient.post('/public/bookings', data);
  return response.data;
};
