import {
  Container,
  Title,
  Stack,
  Text,
  Center,
  Loader,
  Alert,
  SimpleGrid,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicEventTypeCard } from '../components/guest/PublicEventTypeCard';
import { usePublicEventTypes } from '../hooks/usePublicApi';
import { useBookingStore } from '../stores/useBookingStore';
import type { EventType } from '../types';

export const PublicEventTypesPage = () => {
  const navigate = useNavigate();
  const { setSelectedEventType, reset } = useBookingStore();
  const { data: eventTypes, isLoading, error } = usePublicEventTypes();

  // Reset booking flow when starting fresh
  useEffect(() => {
    reset();
  }, [reset]);

  const handleSelect = (eventType: EventType) => {
    setSelectedEventType(eventType);
    navigate(`/book/${eventType.id}`);
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          Failed to load event types. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={2}>Select an Event Type</Title>
          <Text c="dimmed">
            Choose the type of meeting you would like to schedule
          </Text>
        </Stack>

        {eventTypes?.length === 0 ? (
          <Center py={100}>
            <Text c="dimmed" size="lg">
              No event types available at the moment.
            </Text>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {eventTypes?.map((eventType) => (
              <PublicEventTypeCard
                key={eventType.id}
                eventType={eventType}
                onSelect={handleSelect}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};
