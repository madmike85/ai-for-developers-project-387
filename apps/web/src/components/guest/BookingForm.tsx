import { useState } from 'react';
import { Stack, TextInput, Button, Group, Alert, Card, Text } from '@mantine/core';
import { IconAlertCircle, IconCalendar, IconClock } from '@tabler/icons-react';
import type { EventType, TimeSlot } from '../../types';
import { formatDateLocal, formatTimeLocal } from '../../utils/date';
import { isValidEmail, isRequired } from '../../utils/validation';

interface BookingFormProps {
  eventType: EventType;
  slot: TimeSlot;
  onSubmit: (guestName: string, guestEmail: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const BookingForm = ({
  eventType,
  slot,
  onSubmit,
  onCancel,
  isLoading,
  error,
}: BookingFormProps) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(guestName)) {
      newErrors.guestName = 'Name is required';
    }

    if (!isRequired(guestEmail)) {
      newErrors.guestEmail = 'Email is required';
    } else if (!isValidEmail(guestEmail)) {
      newErrors.guestEmail = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(guestName.trim(), guestEmail.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Card withBorder bg="gray.0">
          <Stack gap="xs">
            <Text fw={500}>{eventType.name}</Text>
            <Group gap="xs">
              <IconCalendar size={16} color="var(--mantine-color-gray-5)" />
              <Text size="sm">{formatDateLocal(slot.startTime)}</Text>
            </Group>
            <Group gap="xs">
              <IconClock size={16} color="var(--mantine-color-gray-5)" />
              <Text size="sm">
                {formatTimeLocal(slot.startTime)} - {formatTimeLocal(slot.endTime)}
              </Text>
            </Group>
          </Stack>
        </Card>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {error}
          </Alert>
        )}

        <TextInput
          label="Your Name"
          placeholder="John Doe"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          error={errors.guestName}
          required
        />

        <TextInput
          label="Your Email"
          placeholder="john@example.com"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          error={errors.guestEmail}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} color="green">
            Confirm Booking
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
