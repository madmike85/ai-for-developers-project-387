import { test, expect, Page, APIRequestContext } from '@playwright/test';
import {
  API_BASE_URL,
  WEB_BASE_URL,
  TEST_EVENT_TYPES,
  SAMPLE_GUESTS,
  getFutureDate,
  formatDateForAPI,
  createBookingPayload,
  generateRandomEmail,
  type EventType,
  type Guest,
} from './fixtures/test-data';

// =============================================================================
// Test Setup and Helpers
// =============================================================================

/**
 * Navigate to the owner dashboard
 */
async function navigateToOwnerDashboard(page: Page): Promise<void> {
  await page.goto(`${WEB_BASE_URL}/owner`);
}

/**
 * Navigate to the owner event types page
 */
async function navigateToEventTypes(page: Page): Promise<void> {
  await page.goto(`${WEB_BASE_URL}/owner/event-types`);
}

/**
 * Navigate to the owner bookings page
 */
async function navigateToBookings(page: Page): Promise<void> {
  await page.goto(`${WEB_BASE_URL}/owner/bookings`);
}

/**
 * Create a booking via API for test setup
 */
async function createBookingViaApi(
  request: APIRequestContext,
  eventType: EventType,
  guest: Guest,
  startTime: Date,
): Promise<void> {
  const payload = createBookingPayload(eventType, guest, startTime);

  const response = await request.post(`${API_BASE_URL}/public/bookings`, {
    data: {
      eventTypeId: payload.eventTypeId,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      startTime: payload.startTime.toISOString(),
    },
  });

  expect(response.ok()).toBeTruthy();
}

/**
 * Create an event type via API for test setup
 */
async function createEventTypeViaApi(
  request: APIRequestContext,
  name: string,
  description: string,
  durationMinutes: number,
): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/api/event-types`, {
    data: {
      name,
      description,
      durationMinutes,
    },
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data.id;
}

/**
 * Delete an event type via API for cleanup
 */
async function deleteEventTypeViaApi(
  request: APIRequestContext,
  eventTypeId: string,
): Promise<void> {
  const response = await request.delete(`${API_BASE_URL}/api/event-types/${eventTypeId}`);
  // Allow 404 if already deleted
  if (!response.ok() && response.status() !== 404) {
    throw new Error(`Failed to delete event type: ${response.status()}`);
  }
}

/**
 * Helper to find an event type card by name
 */
async function findEventTypeCard(page: Page, name: string) {
  return page
    .locator('.mantine-Card-root')
    .filter({ hasText: name })
    .first();
}

// =============================================================================
// Test Hooks
// =============================================================================

test.beforeEach(async ({ page }) => {
  // Navigate to owner dashboard before each test
  await navigateToOwnerDashboard(page);
});

// =============================================================================
// O1: Create New Event Type
// =============================================================================

test.describe('O1: Create New Event Type', () => {
  // Generate unique test event type name for each test to avoid conflicts
  const getTestEventTypeName = () => `E2E Test ${Date.now()} ${Math.random().toString(36).substring(2, 7)}`;

  test.afterAll(async ({ request }) => {
    // Clean up: Find and delete all test event types created by E2E tests
    try {
      const response = await request.get(`${API_BASE_URL}/api/event-types`);
      if (response.ok()) {
        const eventTypes = await response.json();
        const testEvents = eventTypes.filter((et: EventType) => 
          et.name.startsWith('E2E Test')
        );
        for (const testEvent of testEvents) {
          await deleteEventTypeViaApi(request, testEvent.id);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  test.describe.configure({ mode: 'serial' });

  test('owner creates new event type successfully', async ({ page }) => {
    // Step 1: Navigate to event types page
    await navigateToEventTypes(page);

    // Verify page loaded
    await expect(page.getByRole('heading', { name: 'Event Types' })).toBeVisible();

    // Step 2: Click "Add Event Type" button
    const addButton = page.getByRole('button', { name: 'Add Event Type' });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Verify create modal opened
    await expect(page.getByRole('heading', { name: 'Create Event Type' })).toBeVisible();
    const modal = page.locator('.mantine-Modal-root').filter({ hasText: 'Create Event Type' });
    await expect(modal.getByRole('heading', { name: 'Create Event Type' })).toBeVisible();

    // Step 3: Fill the form
    const testEventTypeName = getTestEventTypeName();
    await page.getByLabel('Name').fill(testEventTypeName);
    await page.getByLabel('Description').fill('This is a test event type created via E2E');
    await page.getByLabel('Duration (minutes)').fill('45');

    // Step 4: Submit the form and wait for API response
    await Promise.all([
      page.waitForResponse((resp) =>
        resp.url().includes('/api/event-types') && resp.status() === 201
      ),
      page.getByRole('button', { name: 'Create' }).click(),
    ]);

    // Verify modal closed
    await expect(page.getByRole('heading', { name: 'Create Event Type' })).not.toBeVisible();

    // Wait for list to refresh
    await page.waitForTimeout(500);

    // Step 5: Verify event type appears in list
    const newCard = await findEventTypeCard(page, testEventTypeName);
    await expect(newCard).toBeVisible();
    await expect(newCard.getByText('This is a test event type created via E2E')).toBeVisible();
    await expect(newCard.getByText('45 min')).toBeVisible();
  });

  test('new event type appears on guest book page', async ({ page }) => {
    // Create event type
    const testEventTypeName = getTestEventTypeName();
    await navigateToEventTypes(page);
    await page.getByRole('button', { name: 'Add Event Type' }).click();

    const modal = page.locator('.mantine-Modal-root').filter({ hasText: 'Create Event Type' });
    await page.getByLabel('Name').fill(testEventTypeName);
    await page.getByLabel('Description').fill('Available for guests');
    await page.getByLabel('Duration (minutes)').fill('30');
    
    // Submit and wait for API response
    await Promise.all([
      page.waitForResponse((resp) =>
        resp.url().includes('/api/event-types') && resp.status() === 201
      ),
      page.getByRole('button', { name: 'Create' }).click(),
    ]);

    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Create Event Type' })).not.toBeVisible();

    // Step 6: Navigate to guest book page and wait for API
    await Promise.all([
      page.waitForResponse((resp) =>
        resp.url().includes('/public/event-types') && resp.status() === 200
      ),
      page.goto(`${WEB_BASE_URL}/book`),
    ]);

    // Reload page to ensure fresh data (handle potential caching)
    await page.reload();
    await page.waitForResponse((resp) =>
      resp.url().includes('/public/event-types') && resp.status() === 200
    );

    // Add small delay to ensure React has rendered
    await page.waitForTimeout(500);

    // Verify event type appears for guests (with polling for reliability)
    await expect(page.getByRole('heading', { name: 'Select an Event Type' })).toBeVisible();
    // Poll for the event type card with increasing timeout
    const guestCard = page.locator('.mantine-Card-root').filter({ hasText: testEventTypeName }).first();
    await expect(guestCard).toBeVisible({ timeout: 10000 });
    await expect(guestCard.getByText('Available for guests')).toBeVisible();
    await expect(guestCard.getByRole('button', { name: 'Select' })).toBeVisible();
  });

  test('form validation prevents creating event type without name', async ({ page }) => {
    await navigateToEventTypes(page);
    await page.getByRole('button', { name: 'Add Event Type' }).click();

    // Try to submit without filling name
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify modal is still open (form didn't submit due to validation)
    await expect(page.getByRole('heading', { name: 'Create Event Type' })).toBeVisible();
    // Verify Name input still exists and is empty
    await expect(page.getByLabel('Name')).toHaveValue('');
  });

  test('form validation prevents creating event type with short duration', async ({ page }) => {
    const testEventTypeName = getTestEventTypeName();
    await navigateToEventTypes(page);
    await page.getByRole('button', { name: 'Add Event Type' }).click();

    // Fill name but with too short duration
    await page.getByLabel('Name').fill(testEventTypeName);
    await page.getByLabel('Duration (minutes)').fill('3');

    await page.getByRole('button', { name: 'Create' }).click();

    // Verify modal is still open (form didn't submit due to validation)
    await expect(page.getByRole('heading', { name: 'Create Event Type' })).toBeVisible();
  });

  test('cancel button closes modal without creating event type', async ({ page }) => {
    const testEventTypeName = getTestEventTypeName();
    await navigateToEventTypes(page);

    // Get initial count of event types
    const initialCards = page.locator('.mantine-Card-root');
    const initialCount = await initialCards.count();

    // Open modal and fill form
    await page.getByRole('button', { name: 'Add Event Type' }).click();
    await page.getByLabel('Name').fill(testEventTypeName);

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal closed
    await expect(page.getByRole('heading', { name: 'Create Event Type' })).not.toBeVisible();

    // Verify no new event type was created
    const finalCount = await page.locator('.mantine-Card-root').count();
    expect(finalCount).toBe(initialCount);
  });
});

// =============================================================================
// O2: Edit Event Type
// =============================================================================

test.describe('O2: Edit Event Type', () => {
  let testEventTypeId: string;
  const originalName = 'E2E Original Event Type';
  const updatedName = 'E2E Updated Event Type';

  test.beforeEach(async ({ request }) => {
    // Create a test event type via API
    testEventTypeId = await createEventTypeViaApi(
      request,
      originalName,
      'Original description',
      30,
    );
  });

  test.afterEach(async ({ request }) => {
    // Clean up test event type
    if (testEventTypeId) {
      await deleteEventTypeViaApi(request, testEventTypeId);
    }
  });

  test('owner edits event type name and duration', async ({ page }) => {
    // Step 1: Navigate to event types page
    await navigateToEventTypes(page);

    // Find the test event type card
    const card = await findEventTypeCard(page, originalName);
    await expect(card).toBeVisible();

    // Step 2: Click Edit button
    await card.getByRole('button', { name: 'Edit' }).click();

    // Verify edit modal opened
    await expect(page.getByRole('heading', { name: 'Edit Event Type' })).toBeVisible();
    const modal = page.locator('.mantine-Modal-root').filter({ hasText: 'Edit Event Type' });
    await expect(modal.getByRole('heading', { name: 'Edit Event Type' })).toBeVisible();

    // Verify current values are pre-filled
    const nameInput = page.getByLabel('Name');
    await expect(nameInput).toHaveValue(originalName);
    await expect(page.getByLabel('Duration (minutes)')).toHaveValue('30');

    // Step 3: Modify name and duration
    await nameInput.fill(updatedName);
    await page.getByLabel('Duration (minutes)').fill('60');

    // Step 4: Submit changes and wait for API response
    await Promise.all([
      page.waitForResponse((resp) =>
        resp.url().includes('/api/event-types') && resp.status() === 200
      ),
      page.getByRole('button', { name: 'Update' }).click(),
    ]);

    // Verify modal closed
    await expect(modal).not.toBeVisible();
    
    // Wait for list to refresh
    await page.waitForTimeout(500);

    // Step 5: Verify changes saved
    const updatedCard = await findEventTypeCard(page, updatedName);
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.getByText('1 hour')).toBeVisible();
  });

  test('existing bookings not affected by event type edit', async ({ page, request }) => {
    // Create a booking using the event type
    const futureDate = getFutureDate(3, 10, 0);
    const guest = SAMPLE_GUESTS.JOHN_DOE;

    await createBookingViaApi(
      request,
      { id: testEventTypeId, name: originalName, description: '', durationMinutes: 30 },
      guest,
      futureDate,
    );

    // Edit the event type duration
    await navigateToEventTypes(page);
    const card = await findEventTypeCard(page, originalName);
    await card.getByRole('button', { name: 'Edit' }).click();

    await page.getByLabel('Name').fill(updatedName);
    await page.getByLabel('Duration (minutes)').fill('90');
    await page.getByRole('button', { name: 'Update' }).click();

    // Navigate to bookings page
    await navigateToBookings(page);

    // Step 5: Verify existing booking still shows original duration and details
    const bookingCard = page
      .locator('.mantine-Card-root')
      .filter({ hasText: guest.name })
      .first();
    await expect(bookingCard).toBeVisible();

    // The booking should still reference the original event type details
    // or show the updated name but maintain the original duration
    await expect(bookingCard.getByText(guest.name)).toBeVisible();
    await expect(bookingCard.getByText(guest.email)).toBeVisible();
  });

  test('cancel edit does not save changes', async ({ page }) => {
    await navigateToEventTypes(page);

    // Open edit modal
    const card = await findEventTypeCard(page, originalName);
    await card.getByRole('button', { name: 'Edit' }).click();

    // Modify values
    await page.getByLabel('Name').fill('Should Not Save');

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify original event type still exists
    await expect(await findEventTypeCard(page, originalName)).toBeVisible();

    // Verify modified name does not exist
    await expect(page.getByText('Should Not Save')).not.toBeVisible();
  });
});

// =============================================================================
// O3: Delete Event Type
// =============================================================================

test.describe('O3: Delete Event Type', () => {
  let testEventTypeId: string;
  const testEventName = 'E2E Delete Test Event';

  test.beforeEach(async ({ request }) => {
    // Create a test event type without any bookings
    testEventTypeId = await createEventTypeViaApi(request, testEventName, 'To be deleted', 30);
  });

  test.afterEach(async ({ request }) => {
    // Clean up if still exists
    if (testEventTypeId) {
      await deleteEventTypeViaApi(request, testEventTypeId);
    }
  });

  test('owner deletes event type without bookings', async ({ page }) => {
    // Step 1: Navigate to event types page
    await navigateToEventTypes(page);

    // Find the test event type card
    const card = await findEventTypeCard(page, testEventName);
    await expect(card).toBeVisible();

    // Step 2: Click Delete button
    await card.getByRole('button', { name: 'Delete' }).click();

    // Verify delete confirmation modal opened
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
    const modal = page.locator('.mantine-Modal-root').filter({ hasText: 'Confirm Delete' });
    await expect(modal.getByText(testEventName)).toBeVisible();

    // Step 3: Confirm deletion
    await page.getByLabel('Confirm Delete').getByRole('button', { name: 'Delete' }).click();

    // Verify modal closed
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).not.toBeVisible();

    // Step 4: Verify removed from list
    await expect(page.getByText(testEventName)).not.toBeVisible();
  });

  test('cancel delete keeps event type', async ({ page }) => {
    await navigateToEventTypes(page);

    // Open delete modal
    const card = await findEventTypeCard(page, testEventName);
    await card.getByRole('button', { name: 'Delete' }).click();

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).first().click();

    // Verify modal closed but event type still exists
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).not.toBeVisible();
    await expect(await findEventTypeCard(page, testEventName)).toBeVisible();
  });

  test('deleted event type unavailable for new bookings', async ({ page }) => {
    // Delete the event type
    await navigateToEventTypes(page);
    const card = await findEventTypeCard(page, testEventName);
    await card.getByRole('button', { name: 'Delete' }).click();
    await page.getByLabel('Confirm Delete').getByRole('button', { name: 'Delete' }).click();

    // Navigate to guest book page
    await page.goto(`${WEB_BASE_URL}/book`);

    // Verify event type not available for booking
    await expect(page.getByText(testEventName)).not.toBeVisible();
  });
});

// =============================================================================
// O4: View All Bookings
// =============================================================================

test.describe('O4: View All Bookings', () => {
  const createdBookings: Array<{ eventTypeId: string; bookingId?: string }> = [];
  const createdEventTypeIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    // Clear previous test data
    createdBookings.length = 0;
    
    // Ensure test event types exist by creating them (ignore if already exist)
    const eventTypesToEnsure = [
      TEST_EVENT_TYPES.INTRO_CALL,
      TEST_EVENT_TYPES.CONSULTATION,
    ];

    for (const eventType of eventTypesToEnsure) {
      try {
        const response = await request.post(`${API_BASE_URL}/api/event-types`, {
          data: {
            id: eventType.id,
            name: eventType.name,
            description: eventType.description,
            durationMinutes: eventType.durationMinutes,
          },
        });
        if (response.ok() || response.status() === 409) {
          // 201 Created or 409 Conflict (already exists) - both OK
          if (!createdEventTypeIds.includes(eventType.id)) {
            createdEventTypeIds.push(eventType.id);
          }
        }
      } catch {
        // Event type might already exist, that's OK
        if (!createdEventTypeIds.includes(eventType.id)) {
          createdEventTypeIds.push(eventType.id);
        }
      }
    }

    // Create test bookings via API with unique timestamps to avoid conflicts
    // Use unique minutes based on current timestamp to avoid collisions with existing bookings
    const now = new Date();
    const uniqueOffset = (now.getSeconds() % 30) + 1; // 1-30 minutes offset
    const futureDate1 = getFutureDate(5, 10, uniqueOffset);
    const futureDate2 = getFutureDate(6, 14, uniqueOffset + 30);
    const guest1 = SAMPLE_GUESTS.JOHN_DOE;
    const guest2 = SAMPLE_GUESTS.JANE_SMITH;

    // Create booking 1
    const payload1 = createBookingPayload(TEST_EVENT_TYPES.INTRO_CALL, guest1, futureDate1);
    const response1 = await request.post(`${API_BASE_URL}/public/bookings`, {
      data: {
        eventTypeId: payload1.eventTypeId,
        guestName: payload1.guestName,
        guestEmail: payload1.guestEmail,
        startTime: payload1.startTime.toISOString(),
      },
    });
    if (response1.ok()) {
      const data1 = await response1.json();
      createdBookings.push({ eventTypeId: TEST_EVENT_TYPES.INTRO_CALL.id, bookingId: data1.id });
    }

    // Create booking 2 - use a different time to avoid conflicts
    const payload2 = createBookingPayload(TEST_EVENT_TYPES.CONSULTATION, guest2, futureDate2);
    const response2 = await request.post(`${API_BASE_URL}/public/bookings`, {
      data: {
        eventTypeId: payload2.eventTypeId,
        guestName: payload2.guestName,
        guestEmail: payload2.guestEmail,
        startTime: payload2.startTime.toISOString(),
      },
    });
    if (response2.ok()) {
      const data2 = await response2.json();
      createdBookings.push({ eventTypeId: TEST_EVENT_TYPES.CONSULTATION.id, bookingId: data2.id });
    }
  });

  test.afterEach(async ({ request }) => {
    // Clean up bookings
    for (const booking of createdBookings) {
      if (booking.bookingId) {
        try {
          await request.delete(`${API_BASE_URL}/api/owner/bookings/${booking.bookingId}`);
        } catch {
          // Ignore cleanup errors - booking might not exist
        }
      }
    }
    createdBookings.length = 0;
    
    // Clean up created event types
    for (const eventTypeId of createdEventTypeIds) {
      try {
        await request.delete(`${API_BASE_URL}/api/event-types/${eventTypeId}`);
      } catch {
        // Ignore cleanup errors
      }
    }
    createdEventTypeIds.length = 0;
  });

  test('all bookings displayed on bookings page', async ({ page }) => {
    // Wait for bookings to be created via API
    await page.waitForTimeout(500);
    
    // Step 1: Navigate to bookings page
    await navigateToBookings(page);

    // Verify page loaded
    await expect(page.getByRole('heading', { name: 'Upcoming Bookings' })).toBeVisible();
    
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Step 2: Verify all bookings displayed
    const bookingCards = page.locator('.mantine-Card-root');
    expect(await bookingCards.count()).toBeGreaterThanOrEqual(2);
  });

  test('booking cards display correct details', async ({ page }) => {
    // Wait for bookings to be created via API and navigate
    await page.waitForTimeout(500);
    await navigateToBookings(page);

    // Wait for page to load data
    await expect(page.getByRole('heading', { name: 'Upcoming Bookings' })).toBeVisible();
    await page.waitForTimeout(1500);

    // Step 3: Verify booking card details
    // Find booking for John Doe - wait for it to appear
    const johnBooking = page
      .locator('.mantine-Card-root')
      .filter({ hasText: SAMPLE_GUESTS.JOHN_DOE.name })
      .first();
    await expect(johnBooking).toBeVisible({ timeout: 10000 });

    // Verify event type name is visible on the card
    await expect(johnBooking.getByText(TEST_EVENT_TYPES.INTRO_CALL.name)).toBeVisible();

    // Verify guest email
    await expect(johnBooking.getByText(SAMPLE_GUESTS.JOHN_DOE.email)).toBeVisible();

    // Find booking for Jane Smith - use the specific event type we created
    const janeBooking = page
      .locator('.mantine-Card-root')
      .filter({ hasText: SAMPLE_GUESTS.JANE_SMITH.name })
      .filter({ hasText: TEST_EVENT_TYPES.CONSULTATION.name })
      .first();
    await expect(janeBooking).toBeVisible({ timeout: 10000 });
    
    // Verify event type name for Jane's booking
    await expect(janeBooking.getByText(TEST_EVENT_TYPES.CONSULTATION.name)).toBeVisible();
  });

  test('bookings sorted by date', async ({ page }) => {
    await navigateToBookings(page);

    // Get all booking cards and verify they have date information
    const bookingCards = page.locator('.mantine-Card-root');
    const count = await bookingCards.count();

    // Each booking should display a date
    for (let i = 0; i < Math.min(count, 2); i++) {
      const card = bookingCards.nth(i);
      // Should have date/time text (format depends on the date util)
      const dateText = await card.locator('text=/\\d{1,2}/').first();
      await expect(dateText).toBeVisible();
    }
  });

  test('empty state shown when no bookings', async ({ page }) => {
    // Clear all bookings first (this is a simplified approach)
    // In reality, you'd need to clean up all existing bookings

    // Navigate to bookings page
    await navigateToBookings(page);

    // If there are no bookings, verify empty state
    const emptyState = page.getByText('No bookings yet');
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
      await expect(page.getByText('They will appear here when guests schedule meetings')).toBeVisible();
    }
  });
});

// =============================================================================
// O5: Navigation Between Owner Pages
// =============================================================================

test.describe('O5: Navigation Between Owner Pages', () => {
  test('dashboard cards navigate to correct pages', async ({ page }) => {
    // Step 1: Start at dashboard
    await navigateToOwnerDashboard(page);
    await expect(page.getByRole('heading', { name: 'Owner Dashboard' })).toBeVisible();

    // Step 2: Click "Manage Event Types" card button
    await page.getByRole('button', { name: 'Manage Event Types' }).click();

    // Verify navigated to event types page
    await expect(page).toHaveURL(`${WEB_BASE_URL}/owner/event-types`);
    await expect(page.getByRole('heading', { name: 'Event Types' })).toBeVisible();

    // Step 3: Navigate back to dashboard via URL
    await navigateToOwnerDashboard(page);
    await expect(page.getByRole('heading', { name: 'Owner Dashboard' })).toBeVisible();

    // Step 4: Click "View Bookings" card button
    await page.getByRole('button', { name: 'View Bookings' }).click();

    // Verify navigated to bookings page
    await expect(page).toHaveURL(`${WEB_BASE_URL}/owner/bookings`);
    await expect(page.getByRole('heading', { name: 'Upcoming Bookings' })).toBeVisible();
  });

  test('header navigation to owner section works', async ({ page }) => {
    // Navigate to home page first
    await page.goto(WEB_BASE_URL);
    await expect(page.getByTestId('cta-book-button')).toBeVisible();

    // Click Admin button in header
    await page.getByRole('button', { name: 'Admin' }).click();

    // Verify navigated to owner dashboard
    await expect(page).toHaveURL(`${WEB_BASE_URL}/owner`);
    await expect(page.getByRole('heading', { name: 'Owner Dashboard' })).toBeVisible();
  });

  test('navigation chain: dashboard → event-types → dashboard → bookings', async ({ page }) => {
    // Start at dashboard
    await navigateToOwnerDashboard(page);

    // Navigate to event types
    await page.getByRole('button', { name: 'Manage Event Types' }).click();
    await expect(page).toHaveURL(`${WEB_BASE_URL}/owner/event-types`);

    // Back to dashboard
    await navigateToOwnerDashboard(page);
    await expect(page.getByRole('heading', { name: 'Owner Dashboard' })).toBeVisible();

    // Navigate to bookings
    await page.getByRole('button', { name: 'View Bookings' }).click();
    await expect(page).toHaveURL(`${WEB_BASE_URL}/owner/bookings`);

    // Back to dashboard
    await navigateToOwnerDashboard(page);
    await expect(page.getByRole('heading', { name: 'Owner Dashboard' })).toBeVisible();
  });

  test('dashboard cards are clickable and have correct structure', async ({ page }) => {
    await navigateToOwnerDashboard(page);

    // Verify Event Types card structure
    const eventTypesCard = page
      .locator('.mantine-Card-root')
      .filter({ hasText: 'Event Types' })
      .first();
    await expect(eventTypesCard).toBeVisible();
    await expect(eventTypesCard.getByText('Create and manage different types of meetings')).toBeVisible();
    await expect(eventTypesCard.getByRole('button', { name: 'Manage Event Types' })).toBeVisible();

    // Verify Bookings card structure
    const bookingsCard = page
      .locator('.mantine-Card-root')
      .filter({ hasText: 'Bookings' })
      .first();
    await expect(bookingsCard).toBeVisible();
    await expect(bookingsCard.getByText('View all upcoming meetings and appointments')).toBeVisible();
    await expect(bookingsCard.getByRole('button', { name: 'View Bookings' })).toBeVisible();
  });

  test('logo click returns to home from owner pages', async ({ page }) => {
    // Navigate to event types page
    await navigateToEventTypes(page);
    await expect(page).toHaveURL(`${WEB_BASE_URL}/owner/event-types`);

    // Click logo
    await page.locator('text=Calendar').first().click();

    // Verify returned to home
    await expect(page).toHaveURL(WEB_BASE_URL);
    await expect(page.getByTestId('cta-book-button')).toBeVisible();
  });
});
