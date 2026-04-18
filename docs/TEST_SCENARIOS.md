# Call Calendar - Test Scenarios Document

This document contains comprehensive test scenarios for the Call Calendar application, covering Guest workflows, Owner workflows, API endpoints, and Integration scenarios.

---

## Legend

| Priority | Description |
|----------|-------------|
| **Critical** | Core functionality that must work for the application to be usable |
| **High** | Important features with significant user impact |
| **Medium** | Nice-to-have features, edge cases, or error scenarios |

| Type | Description |
|------|-------------|
| **E2E** | End-to-end tests simulating real user flows through the UI |
| **API** | Backend API endpoint tests |
| **Integration** | Cross-system workflow tests |

---

## 1. Guest Scenarios (G1-G5)

### G1: Successful Meeting Booking

| Field | Value |
|-------|-------|
| **Scenario ID** | G1 |
| **Priority** | Critical |
| **Type** | E2E |
| **Description** | Guest successfully completes the full booking flow from event type selection to confirmation |

**Preconditions:**
- Application is running (frontend: `http://localhost:5173`, backend: `http://localhost:3000`)
- At least one event type exists in the system (e.g., "Consultation Call", 30 minutes)
- PostgreSQL database is accessible
- Available time slots exist for a future date

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Navigate to homepage `/` | Homepage loads with "Book" button visible |
| 2 | Click "Book" button | Redirected to `/book` showing event types list |
| 3 | Select an event type (e.g., "Consultation Call") | Redirected to `/book/:eventTypeId` (Calendar page) |
| 4 | Select a future date on the calendar | Calendar highlights selected date, "Continue" button enabled |
| 5 | Click "Continue to Time Slots" | Redirected to `/book/:eventTypeId/slots` showing time slots |
| 6 | Select an available time slot | Slot is highlighted, "Continue to Booking" button enabled |
| 7 | Click "Continue to Booking" | Redirected to `/book/:eventTypeId/confirm` with booking form |
| 8 | Enter guest name: "John Doe" | Name field populated, no validation errors |
| 9 | Enter guest email: "john@example.com" | Email field populated, no validation errors |
| 10 | Click "Confirm Booking" | Loading state, then success modal appears |
| 11 | Click "Done" on success modal | Redirected to `/book`, booking store is reset |

**Expected Results:**

- [x] Success modal displays with booking details
- [x] New booking appears in owner's bookings list
- [x] Selected time slot becomes unavailable for new bookings
- [x] No console errors during the flow
- [x] All network requests return 2xx status codes

**Test Data:**
```typescript
{
  guestName: "John Doe",
  guestEmail: "john@example.com",
  eventTypeId: "existing-event-type-id",
  date: "2026-04-15",  // Future date
  timeSlot: "10:00"    // Available slot
}
```

---

### G2: Cannot Book Occupied Time Slot

| Field | Value |
|-------|-------|
| **Scenario ID** | G2 |
| **Priority** | Critical |
| **Type** | E2E |
| **Description** | Guest attempts to book a time slot that has already been booked by another user |

**Preconditions:**
- Event type exists
- A booking already exists for a specific time slot (e.g., "Consultation Call" at 2026-04-15 10:00)

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Navigate to `/book` | Event types page loads |
| 2 | Select same event type as existing booking | Calendar page loads |
| 3 | Select the date with existing booking | Time slots page loads |
| 4 | Observe time slots for 10:00 | The 10:00 slot should show as unavailable/booked |
| 5 | Attempt to select 10:00 slot | Selection should be disabled or show "Occupied" status |

**Expected Results:**

- [x] Booked time slot is visually marked as unavailable (disabled state)
- [x] Occupied slot cannot be selected
- [x] API returns correct availability status for slots

**Test Data:**
```typescript
// Pre-existing booking in database
{
  eventTypeId: "event-type-1",
  guestName: "Jane Smith",
  guestEmail: "jane@example.com",
  startTime: "2026-04-15T10:00:00.000Z"
}

// Attempted new booking
{
  eventTypeId: "event-type-1",
  date: "2026-04-15",
  timeSlot: "10:00"
}
```

---

### G3: Form Validation on Booking Confirmation

| Field | Value |
|-------|-------|
| **Scenario ID** | G3 |
| **Priority** | High |
| **Type** | E2E |
| **Description** | Guest attempts to submit booking form with invalid or missing data |

**Preconditions:**
- Guest has navigated to booking confirmation page with valid event type, date, and slot selected

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Leave "Your Name" field empty | Field shows "Name is required" error |
| 2 | Leave "Your Email" field empty | Field shows "Email is required" error |
| 3 | Enter invalid email: "invalid-email" | Field shows "Please enter a valid email" error |
| 4 | Enter name: "A" (1 character) | Field shows validation error (min 2 characters) |
| 5 | Click "Confirm Booking" with invalid fields | Form should not submit, errors remain visible |
| 6 | Enter valid name: "John Doe" | Error clears for name field |
| 7 | Enter valid email: "john@example.com" | Error clears for email field |
| 8 | Click "Confirm Booking" | Form submits successfully |

**Expected Results:**

- [x] Empty name field shows "Name is required" error
- [x] Empty email field shows "Email is required" error
- [x] Invalid email format shows validation error
- [x] Form submission is blocked when validation errors exist
- [x] Submit button is disabled while validation errors exist (optional)
- [x] API is not called with invalid data

**Test Data (Invalid):**
```typescript
{ guestName: "", guestEmail: "" }
{ guestName: "A", guestEmail: "invalid" }
{ guestName: "John", guestEmail: "john@" }
```

**Test Data (Valid):**
```typescript
{ guestName: "John Doe", guestEmail: "john@example.com" }
```

---

### G4: Navigate Back Through Booking Flow

| Field | Value |
|-------|-------|
| **Scenario ID** | G4 |
| **Priority** | Medium |
| **Type** | E2E |
| **Description** | Guest navigates backward through the booking flow using "Back" buttons |

**Preconditions:**
- Guest has progressed through event type → calendar → time slots → booking form

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | From booking confirmation page, click "Back" button | Returns to time slots page, previously selected slot still highlighted |
| 2 | From time slots page, click "Back" button | Returns to calendar page, previously selected date still highlighted |
| 3 | From calendar page, click "Back" button | Returns to event types page |
| 4 | Click "Back" again or navigate back | Returns to homepage |

**Expected Results:**

- [x] State is preserved when navigating back (selected date, slot remain selected)
- [x] URL changes correctly for each navigation step
- [x] No data loss occurs during backward navigation
- [x] Forward navigation works correctly after going back

---

### G5: Booking Flow State Persistence

| Field | Value |
|-------|-------|
| **Scenario ID** | G5 |
| **Priority** | Medium |
| **Type** | E2E |
| **Description** | Booking store state persists during navigation and page refresh |

**Preconditions:**
- Guest has selected event type, date, and time slot

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Select event type, date, and time slot | All selections are active |
| 2 | Navigate to different page (e.g., home) then return | Previously selected data is preserved in store |
| 3 | Refresh browser on confirmation page | If using sessionStorage/localStorage, data persists |
| 4 | Directly access `/book/:eventTypeId/confirm` without prior selections | Shows error "Missing booking information. Please start over." |

**Expected Results:**

- [x] State persists during in-app navigation
- [x] Error message displayed when accessing confirmation page without proper flow
- [x] "Start Over" button redirects to event types page

---

## 2. Owner Scenarios (O1-O5)

### O1: Create New Event Type

| Field | Value |
|-------|-------|
| **Scenario ID** | O1 |
| **Priority** | Critical |
| **Type** | E2E |
| **Description** | Owner creates a new event type with valid data |

**Preconditions:**
- Owner is on Event Types management page (`/owner/event-types`)

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Click "New Event Type" button | Modal/form opens for creating event type |
| 2 | Enter name: "Discovery Call" | Name field populated |
| 3 | Enter description: "Initial consultation call" | Description field populated |
| 4 | Enter duration: 45 | Duration field shows 45 minutes |
| 5 | Click "Create" button | Modal closes, new event type appears in list |

**Expected Results:**

- [x] New event type appears in the list with correct details
- [x] API returns 201 Created status
- [x] New event type is available for guests to book immediately
- [x] Duration is correctly displayed (e.g., "45 minutes")

**Test Data:**
```typescript
{
  name: "Discovery Call",
  description: "Initial consultation call",
  durationMinutes: 45
}
```

---

### O2: Edit Event Type

| Field | Value |
|-------|-------|
| **Scenario ID** | O2 |
| **Priority** | High |
| **Type** | E2E |
| **Description** | Owner modifies an existing event type |

**Preconditions:**
- At least one event type exists in the system
- Owner is on Event Types page

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Click "Edit" button on an existing event type | Edit modal opens with pre-populated data |
| 2 | Change name from "Old Name" to "Updated Name" | Name field updated |
| 3 | Change duration from 30 to 60 | Duration field updated |
| 4 | Click "Save" button | Modal closes, list updates with new values |

**Expected Results:**

- [x] Event type details are updated in the list
- [x] API returns 200 OK status
- [x] Existing bookings are NOT affected by the change
- [x] Future bookings use updated duration

**Test Data:**
```typescript
// Before
{ name: "Consultation", durationMinutes: 30 }

// After
{ name: "Extended Consultation", durationMinutes: 60 }
```

---

### O3: Delete Event Type

| Field | Value |
|-------|-------|
| **Scenario ID** | O3 |
| **Priority** | High |
| **Type** | E2E |
| **Description** | Owner deletes an event type |

**Preconditions:**
- At least one event type exists
- Owner is on Event Types page

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Click "Delete" button on an event type | Confirmation dialog appears |
| 2 | Confirm deletion | Event type removed from list, success notification shown |

**Expected Results:**

- [x] Event type no longer appears in the list
- [x] API returns 204 No Content
- [x] Guests can no longer book this event type
- [x] Existing bookings are preserved (see scenario N2)

**Edge Case - Delete with bookings:**
- [ ] System should handle deletion gracefully (either prevent deletion or cascade/soft delete)

---

### O4: View All Bookings

| Field | Value |
|-------|-------|
| **Scenario ID** | O4 |
| **Priority** | Critical |
| **Type** | E2E |
| **Description** | Owner views all upcoming bookings across all event types |

**Preconditions:**
- Multiple bookings exist in the system from various event types
- Owner is on Bookings page (`/owner/bookings`)

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Navigate to `/owner/bookings` | Bookings list page loads |
| 2 | Observe the bookings list | All bookings displayed with guest info, event type, date/time |
| 3 | Scroll through list | List is ordered by date (descending - newest first) |

**Expected Results:**

- [x] All bookings from all event types are displayed
- [x] Each booking shows: guest name, guest email, event type name, start time, duration
- [x] Bookings are sorted by startTime in descending order (newest first)
- [x] Empty state message shown when no bookings exist

**Test Data:**
```typescript
// Bookings in database
[
  { guestName: "Alice", eventType: "Call", startTime: "2026-04-20T10:00:00Z" },
  { guestName: "Bob", eventType: "Meeting", startTime: "2026-04-18T14:00:00Z" },
  { guestName: "Carol", eventType: "Call", startTime: "2026-04-15T09:00:00Z" }
]
```

---

### O5: Navigation Between Owner Pages

| Field | Value |
|-------|-------|
| **Scenario ID** | O5 |
| **Priority** | Medium |
| **Type** | E2E |
| **Description** | Owner navigates between dashboard, event types, and bookings pages |

**Step-by-step Actions:**

| Step | Action | Expected URL |
|------|--------|--------------|
| 1 | Navigate to `/owner` | Owner dashboard page |
| 2 | Click "Event Types" link | Navigates to `/owner/event-types` |
| 3 | Click "Bookings" link | Navigates to `/owner/bookings` |
| 4 | Click browser back button | Returns to `/owner/event-types` |
| 5 | Click logo or home link | Returns to homepage `/` |

**Expected Results:**

- [x] All navigation links work correctly
- [x] Active page is visually highlighted in navigation
- [x] Browser back/forward buttons work correctly
- [x] Page content updates correctly on navigation

---

## 3. Negative Scenarios (N1-N4)

### N1: Double Booking Prevention

| Field | Value |
|-------|-------|
| **Scenario ID** | N1 |
| **Priority** | Critical |
| **Type** | Integration |
| **Description** | System prevents two guests from booking the same time slot simultaneously |

**Preconditions:**
- Event type exists
- Specific time slot is available
- Two browser sessions/requests attempt to book simultaneously

**Step-by-step Actions:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Guest A opens booking form for slot 10:00 | Form loads with slot details |
| 2 | Guest B opens booking form for same slot 10:00 | Form loads with slot details |
| 3 | Guest A clicks "Confirm Booking" | Booking succeeds, success modal shown |
| 4 | Guest B clicks "Confirm Booking" immediately after | Booking fails with "TIME_SLOT_OCCUPIED" error |

**Expected Results:**

- [x] First booking (Guest A) succeeds with 201 Created
- [x] Second booking (Guest B) fails with 409 Conflict
- [x] Error message: "This time slot has just been booked by someone else..."
- [x] Guest B sees occupied slot status on refresh
- [x] Database constraint prevents duplicate bookings

**API Test:**
```bash
# First request succeeds
curl -X POST http://localhost:3000/public/bookings \
  -H "Content-Type: application/json" \
  -d '{"eventTypeId":"et1","guestName":"Alice","guestEmail":"alice@test.com","startTime":"2026-04-15T10:00:00Z"}'
# Response: 201 Created

# Second request fails
curl -X POST http://localhost:3000/public/bookings \
  -H "Content-Type: application/json" \
  -d '{"eventTypeId":"et1","guestName":"Bob","guestEmail":"bob@test.com","startTime":"2026-04-15T10:00:00Z"}'
# Response: 409 Conflict
```

---

### N2: Delete Event Type with Existing Bookings

| Field | Value |
|-------|-------|
| **Scenario ID** | N2 |
| **Priority** | High |
| **Type** | Integration |
| **Description** | Owner attempts to delete an event type that has existing bookings |

**Preconditions:**
- Event type exists with at least one booking

**Step-by-step Actions:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Owner attempts to delete event type with bookings | System either prevents deletion or handles gracefully |

**Expected Results (Option A - Prevent Deletion):**

- [x] API returns 400 Bad Request with error message
- [x] Error: "Cannot delete event type with existing bookings"
- [x] Event type remains in database
- [x] Existing bookings are preserved

**Expected Results (Option B - Cascade/Soft Delete):**

- [x] Event type is marked as deleted/archived
- [x] Existing bookings remain in database with reference to deleted event type
- [x] Guests can no longer book this event type
- [x] Owner can still view historical bookings

---

### N3: Select Past Date

| Field | Value |
|-------|-------|
| **Scenario ID** | N3 |
| **Priority** | Medium |
| **Type** | E2E |
| **Description** | Guest attempts to select a past date in the calendar |

**Preconditions:**
- Current date is 2026-04-07
- Guest is on calendar page

**Step-by-step Actions:**

| Step | Action | Expected UI State |
|------|--------|-------------------|
| 1 | Attempt to click on past date (e.g., 2026-04-01) | Past dates are disabled/non-selectable |
| 2 | Attempt to select today's date | Behavior depends on implementation (disabled or time-limited) |
| 3 | Select future date | Date is selectable, "Continue" button enabled |

**Expected Results:**

- [x] Past dates are visually disabled (grayed out)
- [x] Past dates cannot be selected
- [x] Future dates are selectable
- [x] Current date behavior follows business rules

---

### N4: Invalid API Requests

| Field | Value |
|-------|-------|
| **Scenario ID** | N4 |
| **Priority** | Medium |
| **Type** | API |
| **Description** | API receives requests with invalid data or parameters |

**Test Cases:**

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid Event Type ID | `GET /api/event-types/invalid-id` | 404 Not Found |
| Missing Required Fields | `POST /api/event-types` with `{}` | 400 Bad Request, validation errors |
| Invalid Duration | `POST /api/event-types` with `durationMinutes: 500` | 400 Bad Request (max 480) |
| Invalid Email | `POST /public/bookings` with `guestEmail: "invalid"` | 400 Bad Request |
| Invalid Date Format | `GET /public/slots?date=invalid` | 400 Bad Request |
| Non-existent Event Type for Slots | `GET /public/slots?eventTypeId=invalid&date=2026-04-15` | 404 Not Found |

**Expected Results:**

- [x] All invalid requests return appropriate 4xx status codes
- [x] Validation errors include descriptive messages
- [x] No server-side crashes or 500 errors for invalid input
- [x] Whitelist validation prevents extra/unknown fields (when `forbidNonWhitelisted: true`)

---

## 4. API Test Scenarios (A1-A8)

### A1: List All Event Types (Owner)

| Field | Value |
|-------|-------|
| **Scenario ID** | A1 |
| **Priority** | Critical |
| **Type** | API |
| **Endpoint** | `GET /api/event-types` |

**Test Cases:**

| Case | Expected Result |
|------|-----------------|
| Empty database | Returns `[]` with 200 OK |
| Multiple event types | Returns array of event type objects |

**Expected Response:**
```json
{
  "status": 200,
  "body": [
    {
      "id": "cl...",
      "name": "Consultation Call",
      "description": "Initial call",
      "durationMinutes": 30,
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

---

### A2: Create Event Type (Owner)

| Field | Value |
|-------|-------|
| **Scenario ID** | A2 |
| **Priority** | Critical |
| **Type** | API |
| **Endpoint** | `POST /api/event-types` |

**Test Cases:**

| Case | Request Body | Expected Response |
|------|--------------|-------------------|
| Valid data | `{"name":"Test","durationMinutes":30}` | 201 Created, returns created object |
| Missing name | `{"durationMinutes":30}` | 400 Bad Request |
| Invalid duration (too low) | `{"name":"Test","durationMinutes":1}` | 400 Bad Request (min 5) |
| Invalid duration (too high) | `{"name":"Test","durationMinutes":500}` | 400 Bad Request (max 480) |
| Name too short | `{"name":"A","durationMinutes":30}` | 400 Bad Request (min 2 chars) |

**Valid Request:**
```bash
curl -X POST http://localhost:3000/api/event-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Discovery Call",
    "description": "Initial consultation",
    "durationMinutes": 45
  }'
```

---

### A3: Get Single Event Type (Owner)

| Field | Value |
|-------|-------|
| **Scenario ID** | A3 |
| **Priority** | High |
| **Type** | API |
| **Endpoint** | `GET /api/event-types/:id` |

**Test Cases:**

| Case | URL | Expected Response |
|------|-----|-------------------|
| Valid ID | `/api/event-types/{valid-id}` | 200 OK, returns event type |
| Invalid ID | `/api/event-types/invalid` | 404 Not Found |

---

### A4: Update Event Type (Owner)

| Field | Value |
|-------|-------|
| **Scenario ID** | A4 |
| **Priority** | High |
| **Type** | API |
| **Endpoint** | `PATCH /api/event-types/:id` |

**Test Cases:**

| Case | Request Body | Expected Response |
|------|--------------|-------------------|
| Partial update | `{"name":"New Name"}` | 200 OK, name updated |
| Full update | `{"name":"X","description":"Y","durationMinutes":60}` | 200 OK, all fields updated |
| Invalid ID | Any body | 404 Not Found |
| Invalid data | `{"durationMinutes":500}` | 400 Bad Request |

---

### A5: Delete Event Type (Owner)

| Field | Value |
|-------|-------|
| **Scenario ID** | A5 |
| **Priority** | High |
| **Type** | API |
| **Endpoint** | `DELETE /api/event-types/:id` |

**Test Cases:**

| Case | URL | Expected Response |
|------|-----|-------------------|
| Valid ID | `/api/event-types/{valid-id}` | 204 No Content |
| Invalid ID | `/api/event-types/invalid` | 404 Not Found |
| With bookings | `/api/event-types/{id-with-bookings}` | 400 Bad Request or handled gracefully |

---

### A6: List All Bookings (Owner)

| Field | Value |
|-------|-------|
| **Scenario ID** | A6 |
| **Priority** | Critical |
| **Type** | API |
| **Endpoint** | `GET /api/owner/bookings` |

**Expected Response:**
```json
{
  "status": 200,
  "body": [
    {
      "id": "cl...",
      "eventTypeId": "et...",
      "guestName": "John Doe",
      "guestEmail": "john@example.com",
      "startTime": "2026-04-15T10:00:00.000Z",
      "eventType": {
        "id": "et...",
        "name": "Consultation Call",
        "durationMinutes": 30
      }
    }
  ]
}
```

---

### A7: List Public Event Types (Guest)

| Field | Value |
|-------|-------|
| **Scenario ID** | A7 |
| **Priority** | Critical |
| **Type** | API |
| **Endpoint** | `GET /public/event-types` |

**Test Cases:**

| Case | Expected Response |
|------|-------------------|
| Normal request | 200 OK, returns event types array |

---

### A8: Get Available Slots (Guest)

| Field | Value |
|-------|-------|
| **Scenario ID** | A8 |
| **Priority** | Critical |
| **Type** | API |
| **Endpoint** | `GET /public/slots?eventTypeId={id}&date={YYYY-MM-DD}` |

**Test Cases:**

| Case | Query Params | Expected Response |
|------|--------------|-------------------|
| Valid request | `?eventTypeId=valid&date=2026-04-15` | 200 OK, returns slots array with availability |
| Missing eventTypeId | `?date=2026-04-15` | 400 Bad Request |
| Missing date | `?eventTypeId=valid` | 400 Bad Request |
| Invalid date format | `?eventTypeId=valid&date=invalid` | 400 Bad Request |
| Non-existent event type | `?eventTypeId=invalid&date=2026-04-15` | 404 Not Found |

**Expected Response:**
```json
{
  "status": 200,
  "body": [
    {
      "startTime": "2026-04-15T09:00:00.000Z",
      "endTime": "2026-04-15T09:30:00.000Z",
      "isAvailable": true
    },
    {
      "startTime": "2026-04-15T10:00:00.000Z",
      "endTime": "2026-04-15T10:30:00.000Z",
      "isAvailable": false
    }
  ]
}
```

---

## 5. Integration Scenarios (I1-I3)

### I1: Full Booking Lifecycle

| Field | Value |
|-------|-------|
| **Scenario ID** | I1 |
| **Priority** | Critical |
| **Type** | Integration |
| **Description** | Complete end-to-end flow from event type creation to booking confirmation to viewing in owner dashboard |

**Preconditions:**
- Clean database state

**Step-by-step Actions:**

| Step | Action | API/Action |
|------|--------|------------|
| 1 | Owner creates new event type | `POST /api/event-types` |
| 2 | Verify event type exists | `GET /api/event-types` |
| 3 | Guest views public event types | `GET /public/event-types` |
| 4 | Guest checks available slots | `GET /public/slots?eventTypeId=X&date=2026-04-15` |
| 5 | Guest creates booking | `POST /public/bookings` |
| 6 | Owner views all bookings | `GET /api/owner/bookings` |
| 7 | Guest checks slots again | `GET /public/slots?eventTypeId=X&date=2026-04-15` |

**Expected Results:**

- [x] Event type created successfully (201)
- [x] Event type appears in public list
- [x] Available slots returned for selected date
- [x] Booking created successfully (201)
- [x] Booking appears in owner's bookings list with correct details
- [x] Previously available slot now shows as occupied (isAvailable: false)

---

### I2: Time Slot Accuracy

| Field | Value |
|-------|-------|
| **Scenario ID** | I2 |
| **Priority** | High |
| **Type** | Integration |
| **Description** | Verify that time slot calculations correctly account for event duration and existing bookings |

**Preconditions:**
- Event type "Quick Call" with 30-minute duration
- Event type "Long Meeting" with 60-minute duration
- Booking exists for "Quick Call" at 10:00-10:30 on 2026-04-15

**Test Cases:**

| Case | Action | Expected Result |
|------|--------|-----------------|
| Different event types | Book "Long Meeting" at 10:00 | Should be blocked (time conflict with 10:00-10:30 booking) |
| Adjacent slots | Book "Quick Call" at 10:30 | Should succeed (no overlap with 10:00-10:30) |
| Different days | Book "Quick Call" at 10:00 on 2026-04-16 | Should succeed (different day) |

**Expected Results:**

- [x] Time slots correctly calculated based on event duration
- [x] Overlapping bookings are prevented across all event types
- [x] Adjacent (non-overlapping) bookings are allowed
- [x] Bookings on different dates don't conflict

---

### I3: Concurrent Booking Attempt

| Field | Value |
|-------|-------|
| **Scenario ID** | I3 |
| **Priority** | Critical |
| **Type** | Integration |
| **Description** | Multiple guests attempt to book the same slot concurrently, ensuring only one succeeds |

**Preconditions:**
- Event type exists
- Specific time slot is available
- Load testing tool or parallel API requests ready

**Step-by-step Actions:**

| Step | Action |
|------|--------|
| 1 | Send 5 simultaneous POST requests to `/public/bookings` for the same slot |
| 2 | Observe responses |
| 3 | Verify database state |

**Expected Results:**

- [x] Exactly 1 request succeeds (201 Created)
- [x] 4 requests fail with 409 Conflict
- [x] Database contains exactly 1 booking for that slot
- [x] No duplicate entries in database

**Load Test Script:**
```bash
# Using parallel command or similar
for i in {1..5}; do
  curl -X POST http://localhost:3000/public/bookings \
    -H "Content-Type: application/json" \
    -d "{\"eventTypeId\":\"et1\",\"guestName\":\"Guest$i\",\"guestEmail\":\"guest$i@test.com\",\"startTime\":\"2026-04-15T10:00:00Z\"}" &
done
wait
```

---

## Appendix A: Test Data Templates

### Event Types

```typescript
const eventTypes = [
  {
    name: "Quick Call",
    description: "15-minute introductory call",
    durationMinutes: 15
  },
  {
    name: "Consultation",
    description: "Standard consultation session",
    durationMinutes: 30
  },
  {
    name: "Deep Dive",
    description: "In-depth discussion and planning",
    durationMinutes: 60
  },
  {
    name: "Workshop",
    description: "Interactive workshop session",
    durationMinutes: 120
  }
];
```

### Bookings

```typescript
const bookings = [
  {
    eventTypeId: "et-quick-call",
    guestName: "Alice Johnson",
    guestEmail: "alice@example.com",
    startTime: "2026-04-15T09:00:00.000Z"
  },
  {
    eventTypeId: "et-consultation",
    guestName: "Bob Smith",
    guestEmail: "bob@example.com",
    startTime: "2026-04-15T10:00:00.000Z"
  },
  {
    eventTypeId: "et-deep-dive",
    guestName: "Carol White",
    guestEmail: "carol@example.com",
    startTime: "2026-04-16T14:00:00.000Z"
  }
];
```

---

## Appendix B: Running the Tests

### E2E Tests (Using Playwright)

```bash
# Install dependencies
cd apps/web
npm install

# Run all E2E tests
npm run test:e2e

# Run specific scenario
npm run test:e2e -- tests/booking-flow.spec.ts

# Run with UI mode for debugging
npm run test:e2e -- --ui
```

### API Tests (Using Jest + Supertest)

```bash
cd apps/api
npm install

# Run API tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- bookings.controller.spec.ts
```

### Integration Tests

```bash
# Start the full stack
docker-compose up -d

# Run integration test suite
npm run test:integration
```

---

## Appendix C: Test Environment Setup

### Required Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Database |
| API Server | 3000 | Backend API |
| Web Dev Server | 5173 | Frontend |

### Environment Variables

```bash
# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/call_calendar"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# apps/web/.env
VITE_API_URL="http://localhost:3000"
```

---

## Document Information

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Last Updated** | 2026-04-07 |
| **Author** | Test Team |
| **Application** | Call Calendar |
| **Repository** | /Users/mscheglakov/Desktop/ai-for-developers/ai-for-developers-project-386 |

---

*This document should be reviewed and updated when new features are added or existing functionality changes.*
