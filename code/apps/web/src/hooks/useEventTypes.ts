import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { EventType, CreateEventTypeRequest } from '../types';
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from '../api';

const EVENT_TYPES_KEY = 'eventTypes';

// Get all event types (owner)
export const useEventTypes = () => {
  return useQuery<EventType[]>({
    queryKey: [EVENT_TYPES_KEY],
    queryFn: getEventTypes,
  });
};

// Create event type
export const useCreateEventType = () => {
  const queryClient = useQueryClient();
  
  return useMutation<EventType, Error, CreateEventTypeRequest>({
    mutationFn: createEventType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENT_TYPES_KEY] });
    },
  });
};

// Update event type
export const useUpdateEventType = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    EventType,
    Error,
    { id: string; data: CreateEventTypeRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const result = await updateEventType(id, data);
      // Handle potential null response
      if (!result) {
        throw new Error('Event type not found');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENT_TYPES_KEY] });
    },
  });
};

// Delete event type
export const useDeleteEventType = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await deleteEventType(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENT_TYPES_KEY] });
    },
  });
};
