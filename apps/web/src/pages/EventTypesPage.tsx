import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  SimpleGrid,
  Modal,
  Stack,
  Text,
  Center,
  Loader,
  Alert,
  Group,
} from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { EventTypeCard } from '../components/owner/EventTypeCard';
import { EventTypeForm } from '../components/owner/EventTypeForm';
import {
  useEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from '../hooks/useEventTypes';
import type { EventType, CreateEventTypeRequest } from '../types';

export const EventTypesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [deletingEventType, setDeletingEventType] = useState<EventType | null>(null);

  const { data: eventTypes, isLoading, error } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();

  const handleCreate = (data: CreateEventTypeRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdate = (data: CreateEventTypeRequest) => {
    if (!editingEventType) return;
    updateMutation.mutate(
      { id: editingEventType.id, data },
      {
        onSuccess: () => setEditingEventType(null),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingEventType) return;
    deleteMutation.mutate(deletingEventType.id, {
      onSuccess: () => setDeletingEventType(null),
    });
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
        <Group justify="space-between">
          <Title order={2}>Event Types</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Event Type
          </Button>
        </Group>

        {eventTypes?.length === 0 ? (
          <Center py={100}>
            <Text c="dimmed" size="lg">
              No event types yet. Create your first one!
            </Text>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {eventTypes?.map((eventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
                onEdit={setEditingEventType}
                onDelete={setDeletingEventType}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* Create Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Event Type"
        size="md"
      >
        <EventTypeForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={!!editingEventType}
        onClose={() => setEditingEventType(null)}
        title="Edit Event Type"
        size="md"
      >
        {editingEventType && (
          <EventTypeForm
            eventType={editingEventType}
            onSubmit={handleUpdate}
            onCancel={() => setEditingEventType(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deletingEventType}
        onClose={() => setDeletingEventType(null)}
        title="Confirm Delete"
        size="sm"
      >
        <Stack>
          <Text>
            Are you sure you want to delete <strong>{deletingEventType?.name}</strong>?
            This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setDeletingEventType(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};
