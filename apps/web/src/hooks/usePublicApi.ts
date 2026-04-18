import { useQuery } from '@tanstack/react-query';
import type { EventType, TimeSlot } from '../types';
import { getPublicEventTypes, getAvailableSlots } from '../api';

const PUBLIC_EVENT_TYPES_KEY = 'publicEventTypes';
export const AVAILABLE_SLOTS_KEY = 'availableSlots';

// Get public event types (guest)
export const usePublicEventTypes = () => {
  return useQuery<EventType[]>({
    queryKey: [PUBLIC_EVENT_TYPES_KEY],
    queryFn: getPublicEventTypes,
  });
};

// Get available time slots for a specific date
export const useAvailableSlots = (eventTypeId: string, date: Date | string | null) => {
  // Normalize date: if it's a string, convert to Date object
  const normalizedDate = typeof date === 'string' ? new Date(date) : date;

  return useQuery<TimeSlot[]>({
    queryKey: [AVAILABLE_SLOTS_KEY, eventTypeId, normalizedDate?.toISOString()],
    queryFn: () => {
      if (!normalizedDate) throw new Error('Date is required');
      return getAvailableSlots(eventTypeId, normalizedDate);
    },
    enabled: !!eventTypeId && !!normalizedDate,
  });
};
