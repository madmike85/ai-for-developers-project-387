import { Group, Button, Box, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };
  const handleGuestClick = () => {
    navigate('/book');
  };

  const handleOwnerClick = () => {
    navigate('/owner');
  };

  return (
    <Box
      style={{
        padding: '16px 80px',
        backgroundColor: 'white',
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="xs" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <IconCalendar size={24} color="#f97316" />
          <Text fw={600} size="lg">Calendar</Text>
        </Group>

        <Group gap="lg">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleGuestClick}
            styles={{
              root: {
                color: '#6b7280',
              },
            }}
          >
            Book
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={handleOwnerClick}
            styles={{
              root: {
                color: '#6b7280',
              },
            }}
          >
            Admin
          </Button>
        </Group>
      </Group>
    </Box>
  );
};
