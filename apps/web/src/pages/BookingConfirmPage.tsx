import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Button,
  Alert,
  Text,
  Modal,
  Card,
  Group,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { BookingForm } from '../components/guest/BookingForm';
import { useCreateBooking } from '../hooks/useBookings';
import { useBookingStore } from '../stores/useBookingStore';
import { toUTCISOString } from '../utils/date';

export const BookingConfirmPage = () => {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const { selectedEventType, selectedSlot, reset } = useBookingStore();
  const createMutation = useCreateBooking();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (guestName: string, guestEmail: string) => {
    if (!selectedEventType || !selectedSlot) return;

    setError(null);

    try {
      await createMutation.mutateAsync({
        eventTypeId: selectedEventType.id,
        guestName,
        guestEmail,
        startTime: toUTCISOString(new Date(selectedSlot.startTime)),
      });

      setIsSuccessModalOpen(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'TIME_SLOT_OCCUPIED') {
        setError('This time slot has just been booked by someone else. Please select another time.');
      } else {
        setError('An error occurred while creating your booking. Please try again.');
      }
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    reset();
    navigate('/book');
  };

  const handleBack = () => {
    navigate(`/book/${eventTypeId}/slots`);
  };

  if (!selectedEventType || !selectedSlot) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          Missing booking information. Please start over.
        </Alert>
        <Button
          mt="md"
          onClick={() => navigate('/book')}
          leftSection={<IconArrowLeft size={16} />}
        >
          Start Over
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

        <Title order={2}>Complete Your Booking</Title>

        <BookingForm
          eventType={selectedEventType}
          slot={selectedSlot}
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isLoading={createMutation.isPending}
          error={error}
        />
      </Stack>

      {/* Success Modal */}
      <Modal
        opened={isSuccessModalOpen}
        onClose={handleSuccessClose}
        title="Booking Confirmed!"
        size="sm"
        centered
      >
        <Stack align="center" gap="md">
          <IconCheck size={48} color="var(--mantine-color-green-6)" />
          <Card withBorder w="100%">
            <Stack gap="xs">
              <Text fw={500}>{selectedEventType.name}</Text>
              <Text size="sm" c="dimmed">
                Your booking has been confirmed. You will receive a confirmation email shortly.
              </Text>
            </Stack>
          </Card>
          <Button onClick={handleSuccessClose} fullWidth color="green">
            Done
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};
