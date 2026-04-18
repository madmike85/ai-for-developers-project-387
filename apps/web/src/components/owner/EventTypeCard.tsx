import { Card, Text, Group, Badge, Button, Stack } from '@mantine/core';
import { IconEdit, IconTrash, IconClock } from '@tabler/icons-react';
import type { EventType } from '../../types';
import { formatDuration } from '../../utils/date';

interface EventTypeCardProps {
  eventType: EventType;
  onEdit: (eventType: EventType) => void;
  onDelete: (eventType: EventType) => void;
}

export const EventTypeCard = ({ eventType, onEdit, onDelete }: EventTypeCardProps) => {
  return (
    <Card withBorder shadow="sm" padding="lg" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg">
            {eventType.name}
          </Text>
          <Badge leftSection={<IconClock size={12} />} variant="light">
            {formatDuration(eventType.durationMinutes)}
          </Badge>
        </Group>

        {eventType.description && (
          <Text size="sm" c="dimmed">
            {eventType.description}
          </Text>
        )}

        <Group gap="xs" mt="sm">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconEdit size={14} />}
            onClick={() => onEdit(eventType)}
          >
            Edit
          </Button>
          <Button
            variant="light"
            color="red"
            size="xs"
            leftSection={<IconTrash size={14} />}
            onClick={() => onDelete(eventType)}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
