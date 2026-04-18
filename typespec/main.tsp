import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@service({
  title: "Call Calendar API",
  version: "1.0.0",
})
@server("http://localhost:3000", "Local development server")
namespace CallCalendarApi;

// =============== MODELS ===============

model EventType {
  id: string;
  name: string;
  description?: string;
  durationMinutes: int32;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model Booking {
  id: string;
  eventTypeId: string;
  eventType: EventType;
  guestName: string;
  guestEmail: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  createdAt: utcDateTime;
}

model TimeSlot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  isAvailable: boolean;
}

// =============== REQUEST MODELS ===============

model CreateEventTypeRequest {
  name: string;
  description?: string;
  durationMinutes: int32;
}

model UpdateEventTypeRequest {
  name?: string;
  description?: string;
  durationMinutes?: int32;
}

model CreateBookingRequest {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: utcDateTime;
}

// =============== ERROR MODELS ===============

@error
model NotFoundError {
  code: "NOT_FOUND";
  message: string;
}

@error
model ConflictError {
  code: "TIME_SLOT_OCCUPIED";
  message: string;
  conflictingBookingId: string;
}

@error
model ValidationError {
  code: "VALIDATION_ERROR";
  message: string;
  details: string[];
}

@error
model BadRequestError {
  code: "BAD_REQUEST";
  message: string;
}

// =============== OWNER API ===============

@route("/api")
namespace OwnerApi {
  @route("/event-types")
  interface EventTypes {
    @get
    list(): EventType[];

    @post
    @statusCode(201)
    create(@body body: CreateEventTypeRequest): EventType | ValidationError;
  }

  @route("/event-types/{id}")
  interface EventTypeById {
    @get
    get(@path id: string): EventType | NotFoundError;

    @patch
    update(@path id: string, @body body: UpdateEventTypeRequest): EventType | NotFoundError | ValidationError;

    @delete
    @statusCode(204)
    delete(@path id: string): void | NotFoundError;
  }

  @route("/owner/bookings")
  interface OwnerBookings {
    @get
    list(): Booking[];
  }
}

// =============== PUBLIC API (Guest) ===============

@route("/public")
namespace PublicApi {
  @route("/event-types")
  interface PublicEventTypes {
    @get
    list(): EventType[];
  }

  @route("/slots")
  interface PublicSlots {
    @get
    list(
      @query eventTypeId: string,
      @query date: plainDate
    ): TimeSlot[] | BadRequestError;
  }

  @route("/bookings")
  interface PublicBookings {
    @post
    @statusCode(201)
    create(@body body: CreateBookingRequest): Booking | ValidationError | ConflictError;
  }
}
