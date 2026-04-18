import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Button,
  Center,
  Loader,
  Alert,
  Text,
  Group,
  SimpleGrid,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle, IconClock } from '@tabler/icons-react';
import { TimeSlotItem } from '../components/guest/TimeSlotItem';
import { useAvailableSlots } from '../hooks/usePublicApi';
import { useBookingStore } from '../stores/useBookingStore';
import { formatDateLocal } from '../utils/date';
import type { TimeSlot } from '../types';

export const TimeSlotsPage = () => {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const {
    selectedEventType,
    selectedDate,
    selectedSlot,
    setSelectedSlot,
  } = useBookingStore();

  const { data: slots, isLoading, error } = useAvailableSlots(
    eventTypeId || '',
    selectedDate
  );

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      navigate(`/book/${eventTypeId}/confirm`);
    }
  };

  const handleBack = () => {
    navigate(`/book/${eventTypeId}`);
  };

  if (!selectedDate) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          No date selected. Please go back and select a date.
        </Alert>
        <Button mt="md" onClick={handleBack} leftSection={<IconArrowLeft size={16} />}>
          Go Back
        </Button>
      </Container>
    );
  }

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
          Failed to load available time slots. Please try again.
        </Alert>
        <Button mt="md" onClick={handleBack} leftSection={<IconArrowLeft size={16} />}>
          Go Back
        </Button>
      </Container>
    );
  }

  const availableSlots = slots?.filter((slot) => slot.isAvailable) || [];

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
          <Title order={2}>Select a Time</Title>
          <Text c="dimmed">
            Available slots for <strong>{formatDateLocal(selectedDate.toISOString())}</strong>
          </Text>
          {selectedEventType && (
            <Text size="sm" c="dimmed">
              {selectedEventType.name} ({selectedEventType.durationMinutes} minutes)
            </Text>
          )}
        </Stack>

        {availableSlots.length === 0 ? (
          <Alert icon={<IconClock size={16} />} color="yellow" title="No Available Slots">
            All time slots are booked for this date. Please select another date.
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {slots?.map((slot, index) => (
              <TimeSlotItem
                key={index}
                slot={slot}
                isSelected={selectedSlot?.startTime === slot.startTime}
                onSelect={handleSlotSelect}
              />
            ))}
          </SimpleGrid>
        )}

        <Button
          size="lg"
          disabled={!selectedSlot}
          onClick={handleContinue}
          color="green"
        >
          Continue to Booking
        </Button>
      </Stack>
    </Container>
  );
};
