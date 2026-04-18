import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking, CreateBookingRequest } from '../types';
import { getOwnerBookings, createBooking } from '../api';
import { AVAILABLE_SLOTS_KEY } from './usePublicApi';

const OWNER_BOOKINGS_KEY = 'ownerBookings';

// Get all bookings for owner
export const useOwnerBookings = () => {
  return useQuery<Booking[]>({
    queryKey: [OWNER_BOOKINGS_KEY],
    queryFn: getOwnerBookings,
  });
};

// Create booking (guest)
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Booking, Error, CreateBookingRequest>({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OWNER_BOOKINGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [AVAILABLE_SLOTS_KEY] });
    },
  });
};
