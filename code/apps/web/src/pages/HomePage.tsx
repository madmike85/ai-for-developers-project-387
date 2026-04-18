import { Box, Button, Stack, Text, Badge, Grid, Paper, List, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate('/book');
  };

  const features = [
    'Select event type and convenient time for your meeting.',
    'Quick booking with confirmation and additional notes.',
    'Manage meeting types and view upcoming bookings in admin panel.',
  ];

  return (
    <Box
      style={{
        minHeight: 'calc(100vh - 60px)',
        background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 30%, #fff7ed 70%, #fff 100%)',
      }}
    >
      <Grid style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack
            justify="center"
            gap="lg"
            style={{
              padding: '80px 80px 80px 80px',
              maxWidth: 600,
            }}
          >
            <Badge
              size="lg"
              radius="xl"
              styles={{
                root: {
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  alignSelf: 'flex-start',
                },
              }}
            >
              QUICK CALL BOOKING
            </Badge>

            <Text
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.1,
              }}
            >
              Calendar
            </Text>

            <Text
              size="lg"
              style={{
                color: '#6b7280',
                lineHeight: 1.6,
              }}
            >
              Book a meeting in a minute: select event type and convenient time.
            </Text>

            <Button
              data-testid="cta-book-button"
              size="lg"
              radius="md"
              rightSection={<IconArrowRight size={20} />}
              onClick={handleBookClick}
              styles={{
                root: {
                  backgroundColor: '#f97316',
                  alignSelf: 'flex-start',
                  fontWeight: 600,
                  padding: '0 24px',
                },
              }}
            >
              Book
            </Button>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack
            justify="center"
            style={{
              padding: '80px',
              height: '100%',
            }}
          >
            <Paper
              shadow="sm"
              radius="lg"
              p="xl"
              style={{
                backgroundColor: 'white',
                maxWidth: 480,
              }}
            >
              <Stack gap="md">
                <Text
                  size="xl"
                  fw={700}
                  style={{ color: '#111827' }}
                >
                  Features
                </Text>

                <List
                  spacing="md"
                  size="md"
                  icon={
                    <ThemeIcon size={20} radius="xl" color="orange" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                  styles={{
                    item: {
                      color: '#6b7280',
                      lineHeight: 1.5,
                    },
                    itemWrapper: {
                      alignItems: 'flex-start',
                    },
                  }}
                >
                  {features.map((feature, index) => (
                    <List.Item key={index}>{feature}</List.Item>
                  ))}
                </List>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
};
