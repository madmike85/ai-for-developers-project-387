import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { EventTypesPage } from './pages/EventTypesPage';
import { BookingsListPage } from './pages/BookingsListPage';
import { PublicEventTypesPage } from './pages/PublicEventTypesPage';
import { CalendarPage } from './pages/CalendarPage';
import { TimeSlotsPage } from './pages/TimeSlotsPage';
import { BookingConfirmPage } from './pages/BookingConfirmPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Notifications />
          <BrowserRouter>
            <AppShell>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />

                {/* Owner Routes */}
                <Route path="/owner" element={<OwnerDashboard />} />
                <Route path="/owner/event-types" element={<EventTypesPage />} />
                <Route path="/owner/bookings" element={<BookingsListPage />} />

                {/* Guest Routes */}
                <Route path="/book" element={<PublicEventTypesPage />} />
                <Route
                  path="/book/:eventTypeId"
                  element={<CalendarPage />}
                />
                <Route
                  path="/book/:eventTypeId/slots"
                  element={<TimeSlotsPage />}
                />
                <Route
                  path="/book/:eventTypeId/confirm"
                  element={<BookingConfirmPage />}
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </BrowserRouter>
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
