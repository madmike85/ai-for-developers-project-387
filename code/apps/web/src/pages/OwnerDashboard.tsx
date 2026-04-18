import { Container, Title, Text, SimpleGrid, Card, Stack, Button } from '@mantine/core';
import { IconCalendarEvent, IconListDetails, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const OwnerDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>Owner Dashboard</Title>
        <Text c="dimmed">Manage your calendar and view upcoming bookings</Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Card withBorder shadow="sm" padding="lg" radius="md">
            <Stack gap="md">
              <IconCalendarEvent size={40} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={600} size="lg">Event Types</Text>
                <Text size="sm" c="dimmed">
                  Create and manage different types of meetings
                </Text>
              </div>
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate('/owner/event-types')}
              >
                Manage Event Types
              </Button>
            </Stack>
          </Card>

          <Card withBorder shadow="sm" padding="lg" radius="md">
            <Stack gap="md">
              <IconListDetails size={40} color="var(--mantine-color-green-6)" />
              <div>
                <Text fw={600} size="lg">Bookings</Text>
                <Text size="sm" c="dimmed">
                  View all upcoming meetings and appointments
                </Text>
              </div>
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate('/owner/bookings')}
              >
                View Bookings
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
};
