import { Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import type { TimeSlot } from '../../types';
import { formatTimeLocal } from '../../utils/date';

interface TimeSlotItemProps {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (slot: TimeSlot) => void;
}

export const TimeSlotItem = ({ slot, isSelected, onSelect }: TimeSlotItemProps) => {
  if (!slot.isAvailable) {
    return (
      <Button
        variant="light"
        color="gray"
        disabled
        fullWidth
        size="md"
      >
        {formatTimeLocal(slot.startTime)} - Booked
      </Button>
    );
  }

  return (
    <Button
      variant={isSelected ? 'filled' : 'light'}
      color={isSelected ? 'blue' : 'green'}
      onClick={() => onSelect(slot)}
      fullWidth
      size="md"
      rightSection={isSelected ? <IconCheck size={16} /> : null}
    >
      {formatTimeLocal(slot.startTime)}
    </Button>
  );
};
