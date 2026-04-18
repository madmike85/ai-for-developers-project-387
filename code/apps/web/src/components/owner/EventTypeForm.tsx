import { useState } from 'react';
import { Stack, TextInput, Textarea, NumberInput, Button, Group } from '@mantine/core';
import type { CreateEventTypeRequest, EventType } from '../../types';

interface EventTypeFormProps {
  eventType?: EventType;
  onSubmit: (data: CreateEventTypeRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EventTypeForm = ({
  eventType,
  onSubmit,
  onCancel,
  isLoading,
}: EventTypeFormProps) => {
  const [name, setName] = useState(eventType?.name || '');
  const [description, setDescription] = useState(eventType?.description || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    eventType?.durationMinutes || 30
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!durationMinutes || durationMinutes < 5) {
      newErrors.durationMinutes = 'Duration must be at least 5 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateEventTypeRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      durationMinutes,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="e.g., Intro Call"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Textarea
          label="Description"
          placeholder="Brief description of this event type"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={2}
        />

        <NumberInput
          label="Duration (minutes)"
          placeholder="30"
          value={durationMinutes}
          onChange={(value) => setDurationMinutes(typeof value === 'number' ? value : 30)}
          min={5}
          max={480}
          step={5}
          error={errors.durationMinutes}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {eventType ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
