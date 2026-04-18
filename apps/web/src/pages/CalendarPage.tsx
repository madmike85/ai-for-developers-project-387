import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Button,
  Card,
  Center,
  Loader,
  Alert,
  Text,
  Group,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconArrowLeft, IconAlertCircle, IconCalendar } from '@tabler/icons-react';
import { usePublicEventTypes } from '../hooks/usePublicApi';
import { useBookingStore } from '../stores/useBookingStore';
import { getMinDate } from '../utils/date';

export const CalendarPage = () => {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const { selectedEventType, setSelectedDate } = useBookingStore();
  const [date, setDate] = useState<Date | null>(null);

  const { data: eventTypes, isLoading, error } = usePublicEventTypes();

  // Find the event type either from store or from fetched data
  const eventType =
    selectedEventType || eventTypes?.find((et) => et.id === eventTypeId);

  const handleContinue = () => {
    if (date) {
      setSelectedDate(date);
      navigate(`/book/${eventTypeId}/slots`);
    }
  };

  const handleBack = () => {
    navigate('/book');
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !eventType) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          Event type not found. Please go back and try again.
        </Alert>
        <Button mt="md" onClick={handleBack} leftSection={<IconArrowLeft size={16} />}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Group>

        <Stack gap="xs">
          <Title order={2}>Select a Date</Title>
          <Text c="dimmed">
            Choose a date for your <strong>{eventType.name}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Duration: {eventType.durationMinutes} minutes
          </Text>
        </Stack>

        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <IconCalendar size={40} color="var(--mantine-color-blue-6)" />
            <DatePicker
              value={date}
              onChange={(value) => setDate(value ? new Date(value) : null)}
              minDate={getMinDate()}
              firstDayOfWeek={1}
              size="md"
            />
          </Stack>
        </Card>

        <Button
          size="lg"
          disabled={!date}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Stack>
    </Container>
  );
};
