import { create } from 'zustand';
import type { EventType, TimeSlot } from '../types';

interface BookingState {
  selectedEventType: EventType | null;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  setSelectedEventType: (eventType: EventType | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedEventType: null,
  selectedDate: null,
  selectedSlot: null,
  setSelectedEventType: (eventType) => set({ selectedEventType: eventType }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  reset: () => set({
    selectedEventType: null,
    selectedDate: null,
    selectedSlot: null,
  }),
}));
