import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Public API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Test data
  let testEventType30min: { id: string; name: string; durationMinutes: number };
  let testEventType60min: { id: string; name: string; durationMinutes: number };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean up bookings and event types before each test
    await prisma.booking.deleteMany({});
    await prisma.eventType.deleteMany({});

    // Create test event types
    testEventType30min = await prisma.eventType.create({
      data: {
        name: '30min Meeting',
        description: '30 minute meeting',
        durationMinutes: 30,
      },
    });

    testEventType60min = await prisma.eventType.create({
      data: {
        name: '60min Consultation',
        description: '60 minute consultation',
        durationMinutes: 60,
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({});
    await prisma.eventType.deleteMany({});
    await app.close();
  });

  describe('GET /public/event-types', () => {
    it('should return all event types with public access (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/event-types')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      // Verify each event type has required fields
      response.body.forEach((eventType: unknown) => {
        expect(eventType).toHaveProperty('id');
        expect(eventType).toHaveProperty('name');
        expect(eventType).toHaveProperty('description');
        expect(eventType).toHaveProperty('durationMinutes');
        expect(eventType).toHaveProperty('createdAt');
        expect(eventType).toHaveProperty('updatedAt');
      });

      // Verify data matches created event types
      const eventNames = response.body.map((et: { name: string }) => et.name);
      expect(eventNames).toContain('30min Meeting');
      expect(eventNames).toContain('60min Consultation');
    });

    it('should return same data as owner endpoint (200 OK)', async () => {
      const publicResponse = await request(app.getHttpServer())
        .get('/public/event-types')
        .expect(200);

      const ownerResponse = await request(app.getHttpServer())
        .get('/api/event-types')
        .expect(200);

      // Both should have same data (order should match as well since both use createdAt desc)
      expect(publicResponse.body).toHaveLength(ownerResponse.body.length);

      // Check that IDs match
      const publicIds = publicResponse.body.map((et: { id: string }) => et.id).sort();
      const ownerIds = ownerResponse.body.map((et: { id: string }) => et.id).sort();
      expect(publicIds).toEqual(ownerIds);
    });

    it('should return empty array when no event types exist (200 OK)', async () => {
      // Delete all event types
      await prisma.eventType.deleteMany({});

      const response = await request(app.getHttpServer())
        .get('/public/event-types')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return event types ordered by createdAt desc', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/event-types')
        .expect(200);

      // Should be sorted by createdAt desc (newest first)
      expect(response.body[0].name).toBe('60min Consultation');
      expect(response.body[1].name).toBe('30min Meeting');
    });
  });

  describe('GET /public/slots', () => {
    it('should return time slots for a specific date (Scenario A8)', async () => {
      const date = '2024-06-15';

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify each slot has required fields
      response.body.forEach((slot: unknown) => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot).toHaveProperty('isAvailable');
        expect(typeof slot.isAvailable).toBe('boolean');
      });
    });

    it('should return array with startTime, endTime, isAvailable for each slot', async () => {
      const date = '2024-06-15';

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slot = response.body[0];

      // Verify ISO 8601 format for times
      expect(slot.startTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(slot.endTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Verify isAvailable is boolean
      expect(typeof slot.isAvailable).toBe('boolean');
    });

    it('should correctly mark booked slots as unavailable', async () => {
      const date = '2024-06-15';

      // Create a booking at 10:00
      await prisma.booking.create({
        data: {
          eventTypeId: testEventType30min.id,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          startTime: new Date('2024-06-15T10:00:00Z'),
          endTime: new Date('2024-06-15T10:30:00Z'),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      // Find the 10:00 slot
      const slotAt10 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );

      expect(slotAt10).toBeDefined();
      expect(slotAt10.isAvailable).toBe(false);

      // Find the 10:30 slot (should be available)
      const slotAt1030 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:30:00'),
      );

      expect(slotAt1030).toBeDefined();
      expect(slotAt1030.isAvailable).toBe(true);
    });

    it('should return 400 when eventTypeId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ date: '2024-06-15' })
        .expect(400);

      expect(response.body.message).toContain('Event type not found');
    });

    it('should return 400 when date is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id })
        .expect(400);

      expect(response.body.message).toContain('Invalid date format');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date: 'not-a-date' })
        .expect(400);

      expect(response.body.message).toContain('Invalid date format');
    });

    it('should return 400 for another invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date: '15-06-2024' })
        .expect(400);

      expect(response.body.message).toContain('Invalid date format');
    });

    it('should return 400 for non-existent event type', async () => {
      const nonExistingId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: nonExistingId, date: '2024-06-15' })
        .expect(400);

      expect(response.body.message).toContain('Event type not found');
    });
  });

  describe('Slot Generation Logic', () => {
    it('should generate slots for working hours 9:00-18:00', async () => {
      const date = '2024-06-15';

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      // For 30min duration: 9:00-18:00 = 9 hours = 18 slots
      expect(response.body).toHaveLength(18);

      // First slot should start at 9:00
      const firstSlot = response.body[0];
      expect(firstSlot.startTime).toContain('T09:00:00');

      // Last slot should start at 17:30
      const lastSlot = response.body[response.body.length - 1];
      expect(lastSlot.startTime).toContain('T17:30:00');
      expect(lastSlot.endTime).toContain('T18:00:00');
    });

    it('should respect event type duration for slot generation', async () => {
      const date = '2024-06-15';

      // Test with 60min event type
      const response60min = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType60min.id, date })
        .expect(200);

      // For 60min duration: 9:00-18:00 = 9 hours = 9 slots
      expect(response60min.body).toHaveLength(9);

      // Each slot should be 60 minutes apart
      const firstSlot = response60min.body[0];
      expect(firstSlot.startTime).toContain('T09:00:00');
      expect(firstSlot.endTime).toContain('T10:00:00');

      const secondSlot = response60min.body[1];
      expect(secondSlot.startTime).toContain('T10:00:00');
      expect(secondSlot.endTime).toContain('T11:00:00');
    });

    it('should correctly calculate availability for all slots', async () => {
      const date = '2024-06-15';

      // All slots should be available when there are no bookings
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      response.body.forEach((slot: { isAvailable: boolean }) => {
        expect(slot.isAvailable).toBe(true);
      });
    });

    it('should handle edge case - fully booked day', async () => {
      const date = '2024-06-15';

      // Create bookings for all slots with 60min event type (9 slots)
      for (let hour = 9; hour < 18; hour++) {
        await prisma.booking.create({
          data: {
            eventTypeId: testEventType60min.id,
            guestName: `User ${hour}`,
            guestEmail: `user${hour}@example.com`,
            startTime: new Date(`2024-06-15T${hour.toString().padStart(2, '0')}:00:00Z`),
            endTime: new Date(`2024-06-15T${(hour + 1).toString().padStart(2, '0')}:00:00Z`),
          },
        });
      }

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType60min.id, date })
        .expect(200);

      // All slots should be unavailable
      response.body.forEach((slot: { isAvailable: boolean }) => {
        expect(slot.isAvailable).toBe(false);
      });
    });

    it('should handle edge case - empty day (no bookings)', async () => {
      const date = '2024-06-15';

      // No bookings created
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      // All 18 slots should be available
      expect(response.body).toHaveLength(18);
      response.body.forEach((slot: { isAvailable: boolean }) => {
        expect(slot.isAvailable).toBe(true);
      });
    });

    it('should handle edge case - partially booked day', async () => {
      const date = '2024-06-15';

      // Create a few bookings
      await prisma.booking.create({
        data: {
          eventTypeId: testEventType30min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: new Date('2024-06-15T10:00:00Z'),
          endTime: new Date('2024-06-15T10:30:00Z'),
        },
      });

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType30min.id,
          guestName: 'User 2',
          guestEmail: 'user2@example.com',
          startTime: new Date('2024-06-15T14:00:00Z'),
          endTime: new Date('2024-06-15T14:30:00Z'),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      // 10:00 and 14:00 slots should be unavailable
      const slotAt10 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10.isAvailable).toBe(false);

      const slotAt14 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T14:00:00'),
      );
      expect(slotAt14.isAvailable).toBe(false);

      // Other slots should be available
      const slotAt11 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T11:00:00'),
      );
      expect(slotAt11.isAvailable).toBe(true);
    });

    it('should handle overlapping bookings correctly', async () => {
      const date = '2024-06-15';

      // Create a 60min booking from 10:00 to 11:00
      await prisma.booking.create({
        data: {
          eventTypeId: testEventType60min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: new Date('2024-06-15T10:00:00Z'),
          endTime: new Date('2024-06-15T11:00:00Z'),
        },
      });

      // Check 30min slots - both 10:00 and 10:30 should be unavailable
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAt10 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10.isAvailable).toBe(false);

      const slotAt1030 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:30:00'),
      );
      expect(slotAt1030.isAvailable).toBe(false);

      // 11:00 slot should be available
      const slotAt11 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T11:00:00'),
      );
      expect(slotAt11.isAvailable).toBe(true);
    });

    it('should handle edge case - booking at day boundaries', async () => {
      const date = '2024-06-15';

      // Create booking at start of day (9:00)
      await prisma.booking.create({
        data: {
          eventTypeId: testEventType30min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: new Date('2024-06-15T09:00:00Z'),
          endTime: new Date('2024-06-15T09:30:00Z'),
        },
      });

      // Create booking at end of day (17:30)
      await prisma.booking.create({
        data: {
          eventTypeId: testEventType30min.id,
          guestName: 'User 2',
          guestEmail: 'user2@example.com',
          startTime: new Date('2024-06-15T17:30:00Z'),
          endTime: new Date('2024-06-15T18:00:00Z'),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      // First slot (9:00) should be unavailable
      expect(response.body[0].isAvailable).toBe(false);

      // Last slot (17:30) should be unavailable
      expect(response.body[response.body.length - 1].isAvailable).toBe(false);

      // Middle slot should be available
      const slotAt12 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T12:00:00'),
      );
      expect(slotAt12.isAvailable).toBe(true);
    });
  });

  describe('Integration with Bookings', () => {
    it('should mark slot unavailable after creating booking', async () => {
      const date = '2024-06-15';
      const startTime = '2024-06-15T10:00:00.000Z';

      // Check slots before booking - should be available
      const beforeResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotBefore = beforeResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotBefore.isAvailable).toBe(true);

      // Create a booking
      await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          startTime,
        })
        .expect(201);

      // Check slots after booking - should be unavailable
      const afterResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAfter = afterResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAfter.isAvailable).toBe(false);
    });

    it('should mark slot available again after deleting booking', async () => {
      const date = '2024-06-15';
      const startTime = '2024-06-15T10:00:00.000Z';

      // Create a booking
      const bookingResponse = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          startTime,
        })
        .expect(201);

      // Verify slot is unavailable
      const withBookingResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotWithBooking = withBookingResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotWithBooking.isAvailable).toBe(false);

      // Delete the booking
      await prisma.booking.delete({
        where: { id: bookingResponse.body.id },
      });

      // Check slots after deletion - should be available again
      const afterDeleteResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAfterDelete = afterDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAfterDelete.isAvailable).toBe(true);
    });

    it('should correctly handle multiple bookings on same day', async () => {
      const date = '2024-06-15';

      // Create multiple bookings
      const booking1 = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(201);

      const booking2 = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'User 2',
          guestEmail: 'user2@example.com',
          startTime: '2024-06-15T11:00:00.000Z',
        })
        .expect(201);

      const booking3 = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'User 3',
          guestEmail: 'user3@example.com',
          startTime: '2024-06-15T14:00:00.000Z',
        })
        .expect(201);

      // Check slots - 10:00, 11:00, and 14:00 should be unavailable
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAt10 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10.isAvailable).toBe(false);

      const slotAt11 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T11:00:00'),
      );
      expect(slotAt11.isAvailable).toBe(false);

      const slotAt14 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T14:00:00'),
      );
      expect(slotAt14.isAvailable).toBe(false);

      // Other slots should be available
      const slotAt12 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T12:00:00'),
      );
      expect(slotAt12.isAvailable).toBe(true);

      // Delete one booking and verify
      await prisma.booking.delete({
        where: { id: booking2.body.id },
      });

      const afterDeleteResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAt11AfterDelete = afterDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T11:00:00'),
      );
      expect(slotAt11AfterDelete.isAvailable).toBe(true);

      // 10:00 and 14:00 should still be unavailable
      const slotAt10AfterDelete = afterDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10AfterDelete.isAvailable).toBe(false);

      const slotAt14AfterDelete = afterDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T14:00:00'),
      );
      expect(slotAt14AfterDelete.isAvailable).toBe(false);

      // Cleanup
      await prisma.booking.deleteMany({
        where: {
          id: { in: [booking1.body.id, booking3.body.id] },
        },
      });
    });

    it('should correctly show slots for different event types independently', async () => {
      const date = '2024-06-15';

      // Create booking with 30min event type at 10:00
      await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(201);

      // Check 30min slots - 10:00 should be unavailable
      const response30min = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slot30minAt10 = response30min.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slot30minAt10.isAvailable).toBe(false);

      // Check 60min slots - 10:00 should also be unavailable (overlaps)
      const response60min = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType60min.id, date })
        .expect(200);

      const slot60minAt10 = response60min.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slot60minAt10.isAvailable).toBe(false);
    });

    it('should handle bookings across different dates independently', async () => {
      const date1 = '2024-06-15';
      const date2 = '2024-06-16';

      // Create booking on date1 at 10:00
      await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(201);

      // Check date1 slots - 10:00 should be unavailable
      const responseDate1 = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date: date1 })
        .expect(200);

      const slotDate1At10 = responseDate1.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotDate1At10.isAvailable).toBe(false);

      // Check date2 slots - 10:00 should be available (no booking on this date)
      const responseDate2 = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date: date2 })
        .expect(200);

      const slotDate2At10 = responseDate2.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotDate2At10.isAvailable).toBe(true);
    });
  });

  describe('Slot Edge Cases with Bookings', () => {
    it('should handle booking spanning multiple slots', async () => {
      const date = '2024-06-15';

      // Create 60min booking at 10:00
      await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType60min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(201);

      // Check 30min slots - both 10:00 and 10:30 should be unavailable
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAt10 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10.isAvailable).toBe(false);

      const slotAt1030 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:30:00'),
      );
      expect(slotAt1030.isAvailable).toBe(false);
    });

    it('should correctly handle back-to-back bookings', async () => {
      const date = '2024-06-15';

      // Create booking at 10:00-10:30
      await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(201);

      // Create booking at 10:30-11:00
      await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType30min.id,
          guestName: 'User 2',
          guestEmail: 'user2@example.com',
          startTime: '2024-06-15T10:30:00.000Z',
        })
        .expect(201);

      // Check 60min slots - 10:00 should be unavailable (overlaps with both 30min bookings)
      const response = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType60min.id, date })
        .expect(200);

      const slotAt10 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10.isAvailable).toBe(false);

      // 9:00 should be available
      const slotAt9 = response.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T09:00:00'),
      );
      expect(slotAt9.isAvailable).toBe(true);
    });

    it('should handle booking deletion with cascading availability update', async () => {
      const date = '2024-06-15';

      // Create multiple bookings
      const booking1 = await prisma.booking.create({
        data: {
          eventTypeId: testEventType30min.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: new Date('2024-06-15T10:00:00Z'),
          endTime: new Date('2024-06-15T10:30:00Z'),
        },
      });

      const booking2 = await prisma.booking.create({
        data: {
          eventTypeId: testEventType30min.id,
          guestName: 'User 2',
          guestEmail: 'user2@example.com',
          startTime: new Date('2024-06-15T11:00:00Z'),
          endTime: new Date('2024-06-15T11:30:00Z'),
        },
      });

      // Verify both are unavailable
      const withBothResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAt10 = withBothResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10.isAvailable).toBe(false);

      const slotAt11 = withBothResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T11:00:00'),
      );
      expect(slotAt11.isAvailable).toBe(false);

      // Delete first booking
      await prisma.booking.delete({ where: { id: booking1.id } });

      // 10:00 should be available, 11:00 still unavailable
      const afterFirstDeleteResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAt10AfterFirstDelete = afterFirstDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10AfterFirstDelete.isAvailable).toBe(true);

      const slotAt11AfterFirstDelete = afterFirstDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T11:00:00'),
      );
      expect(slotAt11AfterFirstDelete.isAvailable).toBe(false);

      // Delete second booking
      await prisma.booking.delete({ where: { id: booking2.id } });

      // Both should be available now
      const afterSecondDeleteResponse = await request(app.getHttpServer())
        .get('/public/slots')
        .query({ eventTypeId: testEventType30min.id, date })
        .expect(200);

      const slotAt10AfterSecondDelete = afterSecondDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T10:00:00'),
      );
      expect(slotAt10AfterSecondDelete.isAvailable).toBe(true);

      const slotAt11AfterSecondDelete = afterSecondDeleteResponse.body.find(
        (slot: { startTime: string }) => slot.startTime.includes('T11:00:00'),
      );
      expect(slotAt11AfterSecondDelete.isAvailable).toBe(true);
    });
  });
});
