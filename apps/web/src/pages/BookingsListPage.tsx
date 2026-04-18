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
import { BookingCard } from '../components/owner/BookingCard';
import { useOwnerBookings } from '../hooks/useBookings';

export const BookingsListPage = () => {
  const { data: bookings, isLoading, error } = useOwnerBookings();

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
          Failed to load bookings. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>Upcoming Bookings</Title>

        {bookings?.length === 0 ? (
          <Center py={100}>
            <Text c="dimmed" size="lg">
              No bookings yet. They will appear here when guests schedule meetings.
            </Text>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {bookings?.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};
