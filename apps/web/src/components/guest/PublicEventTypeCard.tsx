import { Card, Text, Group, Badge, Button, Stack } from '@mantine/core';
import { IconClock, IconArrowRight } from '@tabler/icons-react';
import type { EventType } from '../../types';
import { formatDuration } from '../../utils/date';

interface PublicEventTypeCardProps {
  eventType: EventType;
  onSelect: (eventType: EventType) => void;
}

export const PublicEventTypeCard = ({ eventType, onSelect }: PublicEventTypeCardProps) => {
  return (
    <Card withBorder shadow="sm" padding="lg" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg">
            {eventType.name}
          </Text>
          <Badge leftSection={<IconClock size={12} />} variant="light" color="green">
            {formatDuration(eventType.durationMinutes)}
          </Badge>
        </Group>

        {eventType.description && (
          <Text size="sm" c="dimmed">
            {eventType.description}
          </Text>
        )}

        <Button
          mt="sm"
          rightSection={<IconArrowRight size={16} />}
          onClick={() => onSelect(eventType)}
          fullWidth
        >
          Select
        </Button>
      </Stack>
    </Card>
  );
};
