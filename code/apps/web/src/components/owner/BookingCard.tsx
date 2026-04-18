import { Card, Text, Group, Badge, Stack } from '@mantine/core';
import { IconCalendar, IconClock, IconUser, IconMail } from '@tabler/icons-react';
import type { Booking } from '../../types';
import { formatDateTimeLocal, formatDuration } from '../../utils/date';

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard = ({ booking }: BookingCardProps) => {
  return (
    <Card withBorder shadow="sm" padding="md" radius="md">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <IconCalendar size={18} color="var(--mantine-color-blue-6)" />
            <Text fw={500}>{formatDateTimeLocal(booking.startTime)}</Text>
          </Group>
          <Badge variant="light" color="blue">
            {booking.eventType.name}
          </Badge>
        </Group>

        <Group gap="xs">
          <IconClock size={16} color="var(--mantine-color-gray-5)" />
          <Text size="sm" c="dimmed">
            {formatDuration(booking.eventType.durationMinutes)}
          </Text>
        </Group>

        <Group gap="xs">
          <IconUser size={16} color="var(--mantine-color-gray-5)" />
          <Text size="sm">{booking.guestName}</Text>
        </Group>

        <Group gap="xs">
          <IconMail size={16} color="var(--mantine-color-gray-5)" />
          <Text size="sm" c="dimmed">
            {booking.guestEmail}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};
