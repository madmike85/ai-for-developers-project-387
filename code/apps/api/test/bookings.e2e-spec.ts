import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Bookings API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Test data
  let testEventType1: { id: string; name: string; durationMinutes: number };
  let testEventType2: { id: string; name: string; durationMinutes: number };

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
    testEventType1 = await prisma.eventType.create({
      data: {
        name: 'Test Meeting 30min',
        description: '30 minute test meeting',
        durationMinutes: 30,
      },
    });

    testEventType2 = await prisma.eventType.create({
      data: {
        name: 'Test Consultation 60min',
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

  describe('A6: GET /api/owner/bookings', () => {
    it('should return all bookings with event type details (200 OK)', async () => {
      // Create test bookings
      const startTime1 = new Date('2024-06-15T10:00:00Z');
      const endTime1 = new Date(startTime1.getTime() + 30 * 60 * 1000);

      const startTime2 = new Date('2024-06-15T14:00:00Z');
      const endTime2 = new Date(startTime2.getTime() + 60 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
          startTime: startTime1,
          endTime: endTime1,
        },
      });

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType2.id,
          guestName: 'Jane Smith',
          guestEmail: 'jane@example.com',
          startTime: startTime2,
          endTime: endTime2,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/owner/bookings')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      // Verify each booking has required fields
      response.body.forEach((booking: unknown) => {
        expect(booking).toHaveProperty('id');
        expect(booking).toHaveProperty('eventTypeId');
        expect(booking).toHaveProperty('guestName');
        expect(booking).toHaveProperty('guestEmail');
        expect(booking).toHaveProperty('startTime');
        expect(booking).toHaveProperty('endTime');
        expect(booking).toHaveProperty('createdAt');
        expect(booking).toHaveProperty('eventType');
      });

      // Verify event type details are included
      const firstBooking = response.body[0];
      expect(firstBooking.eventType).toHaveProperty('id');
      expect(firstBooking.eventType).toHaveProperty('name');
      expect(firstBooking.eventType).toHaveProperty('durationMinutes');
    });

    it('should return empty array when no bookings exist (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/owner/bookings')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return bookings sorted by startTime descending', async () => {
      const startTime1 = new Date('2024-06-15T10:00:00Z');
      const endTime1 = new Date(startTime1.getTime() + 30 * 60 * 1000);

      const startTime2 = new Date('2024-06-16T14:00:00Z');
      const endTime2 = new Date(startTime2.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'Earlier Booking',
          guestEmail: 'earlier@example.com',
          startTime: startTime1,
          endTime: endTime1,
        },
      });

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'Later Booking',
          guestEmail: 'later@example.com',
          startTime: startTime2,
          endTime: endTime2,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/owner/bookings')
        .expect(200);

      expect(response.body).toHaveLength(2);
      // Should be sorted by startTime desc (later first)
      expect(response.body[0].guestName).toBe('Later Booking');
      expect(response.body[1].guestName).toBe('Earlier Booking');
    });
  });

  describe('A7: POST /public/bookings (Success)', () => {
    it('should create booking with valid data (201 Created)', async () => {
      const startTime = '2024-06-15T10:00:00.000Z';
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        startTime,
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      // Verify response contains created booking with generated ID
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');
      expect(response.body.eventTypeId).toBe(createData.eventTypeId);
      expect(response.body.guestName).toBe(createData.guestName);
      expect(response.body.guestEmail).toBe(createData.guestEmail);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should include event type relation in response (201 Created)', async () => {
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        startTime: '2024-06-15T10:00:00.000Z',
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      // Verify event type details are included
      expect(response.body).toHaveProperty('eventType');
      expect(response.body.eventType.id).toBe(testEventType1.id);
      expect(response.body.eventType.name).toBe(testEventType1.name);
      expect(response.body.eventType.durationMinutes).toBe(
        testEventType1.durationMinutes,
      );
    });

    it('should calculate endTime based on event type duration (201 Created)', async () => {
      const startTime = '2024-06-15T10:00:00.000Z';
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        startTime,
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      // Verify endTime is calculated (startTime + 30 minutes)
      expect(response.body).toHaveProperty('startTime');
      expect(response.body).toHaveProperty('endTime');

      const expectedEndTime = new Date(
        new Date(startTime).getTime() + testEventType1.durationMinutes * 60 * 1000,
      );
      expect(new Date(response.body.endTime).toISOString()).toBe(
        expectedEndTime.toISOString(),
      );
    });

    it('should calculate endTime correctly for different durations (201 Created)', async () => {
      const startTime = '2024-06-15T10:00:00.000Z';
      const createData = {
        eventTypeId: testEventType2.id, // 60 minute duration
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        startTime,
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      // Verify endTime is calculated (startTime + 60 minutes)
      const expectedEndTime = new Date(
        new Date(startTime).getTime() + testEventType2.durationMinutes * 60 * 1000,
      );
      expect(new Date(response.body.endTime).toISOString()).toBe(
        expectedEndTime.toISOString(),
      );
    });
  });

  describe('N1: POST /public/bookings (Conflict)', () => {
    it('should return 409 when time slot is occupied', async () => {
      // Create an existing booking
      const startTime = new Date('2024-06-15T10:00:00Z');
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'Existing User',
          guestEmail: 'existing@example.com',
          startTime,
          endTime,
        },
      });

      // Try to create another booking at the same time
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'New User',
        guestEmail: 'new@example.com',
        startTime: startTime.toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(409);

      expect(response.body.message).toContain('already booked');
    });

    it('should include error code TIME_SLOT_OCCUPIED (409)', async () => {
      const startTime = new Date('2024-06-15T10:00:00Z');
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'Existing User',
          guestEmail: 'existing@example.com',
          startTime,
          endTime,
        },
      });

      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'New User',
        guestEmail: 'new@example.com',
        startTime: startTime.toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(409);

      expect(response.body).toHaveProperty('code', 'TIME_SLOT_OCCUPIED');
    });

    it('should include conflictingBookingId (409)', async () => {
      const startTime = new Date('2024-06-15T10:00:00Z');
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      const existingBooking = await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'Existing User',
          guestEmail: 'existing@example.com',
          startTime,
          endTime,
        },
      });

      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'New User',
        guestEmail: 'new@example.com',
        startTime: startTime.toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(409);

      expect(response.body).toHaveProperty('conflictingBookingId');
      expect(response.body.conflictingBookingId).toBe(existingBooking.id);
    });
  });

  describe('Validation Tests: POST /public/bookings', () => {
    it('should return 400 when eventTypeId is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('eventTypeId')]),
      );
    });

    it('should return 400 when guestName is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType1.id,
          guestEmail: 'test@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('guestName')]),
      );
    });

    it('should return 400 when guestEmail is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType1.id,
          guestName: 'Test User',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('guestEmail')]),
      );
    });

    it('should return 400 when startTime is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType1.id,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('startTime')]),
      );
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType1.id,
          guestName: 'Test User',
          guestEmail: 'invalid-email',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('email')]),
      );
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType1.id,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          startTime: 'invalid-date',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('startTime')]),
      );
    });

    it('should return 400 for non-existent event type', async () => {
      const nonExistingId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: nonExistingId,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
        })
        .expect(400);

      expect(response.body.message).toContain('Event type not found');
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should return 400 when sending extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send({
          eventTypeId: testEventType1.id,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          startTime: '2024-06-15T10:00:00.000Z',
          extraField: 'should not be allowed',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('should not exist')]),
      );
    });
  });

  describe('Double Booking Prevention', () => {
    it('should prevent booking at same time with different event types (409)', async () => {
      // Create booking with event type 1
      const startTime = new Date('2024-06-15T10:00:00Z');
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime,
          endTime,
        },
      });

      // Try to book same time with different event type
      const createData = {
        eventTypeId: testEventType2.id,
        guestName: 'User 2',
        guestEmail: 'user2@example.com',
        startTime: startTime.toISOString(),
      };

      await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(409);
    });

    it('should detect overlapping time ranges (409)', async () => {
      // Create booking from 10:00 to 10:30
      const startTime1 = new Date('2024-06-15T10:00:00Z');
      const endTime1 = new Date(startTime1.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: startTime1,
          endTime: endTime1,
        },
      });

      // Try to book from 10:15 to 10:45 (overlaps by 15 minutes)
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'User 2',
        guestEmail: 'user2@example.com',
        startTime: '2024-06-15T10:15:00.000Z',
      };

      await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(409);
    });

    it('should allow booking that ends exactly when another starts (201)', async () => {
      // Create booking from 10:00 to 10:30
      const startTime1 = new Date('2024-06-15T10:00:00Z');
      const endTime1 = new Date(startTime1.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: startTime1,
          endTime: endTime1,
        },
      });

      // Book at exactly 10:30 (should be allowed)
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'User 2',
        guestEmail: 'user2@example.com',
        startTime: '2024-06-15T10:30:00.000Z',
      };

      await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);
    });

    it('should allow booking that starts exactly when another ends (201)', async () => {
      // Create booking from 10:00 to 10:30
      const startTime1 = new Date('2024-06-15T10:00:00Z');
      const endTime1 = new Date(startTime1.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: startTime1,
          endTime: endTime1,
        },
      });

      // Book at 09:30 that ends at 10:00 (should be allowed)
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'User 2',
        guestEmail: 'user2@example.com',
        startTime: '2024-06-15T09:30:00.000Z',
      };

      await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);
    });

    it('should detect overlapping when new booking completely contains existing (409)', async () => {
      // Create booking from 10:00 to 10:30
      const startTime1 = new Date('2024-06-15T10:00:00Z');
      const endTime1 = new Date(startTime1.getTime() + 30 * 60 * 1000);

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType1.id,
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: startTime1,
          endTime: endTime1,
        },
      });

      // Try to book from 09:45 to 10:45 (60 min booking that contains the existing one)
      const createData = {
        eventTypeId: testEventType2.id,
        guestName: 'User 2',
        guestEmail: 'user2@example.com',
        startTime: '2024-06-15T09:45:00.000Z',
      };

      await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(409);
    });

    it('should detect overlapping when existing booking completely contains new (409)', async () => {
      // Create 60-minute booking from 10:00 to 11:00
      const startTime1 = new Date('2024-06-15T10:00:00Z');

      await prisma.booking.create({
        data: {
          eventTypeId: testEventType2.id, // 60 min duration
          guestName: 'User 1',
          guestEmail: 'user1@example.com',
          startTime: startTime1,
          endTime: new Date(startTime1.getTime() + 60 * 60 * 1000),
        },
      });

      // Try to book 30 min from 10:15 to 10:45 (inside the existing 60 min booking)
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'User 2',
        guestEmail: 'user2@example.com',
        startTime: '2024-06-15T10:15:00.000Z',
      };

      await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(409);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in guestName', async () => {
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'User with émojis 🎉 and <special> chars',
        guestEmail: 'test@example.com',
        startTime: '2024-06-15T10:00:00.000Z',
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      expect(response.body.guestName).toBe(createData.guestName);
    });

    it('should handle very long guest names (up to reasonable limit)', async () => {
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'A'.repeat(200),
        guestEmail: 'test@example.com',
        startTime: '2024-06-15T10:00:00.000Z',
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      expect(response.body.guestName).toBe(createData.guestName);
    });

    it('should handle complex email addresses', async () => {
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'Test User',
        guestEmail: 'test.user+tag@subdomain.example.com',
        startTime: '2024-06-15T10:00:00.000Z',
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      expect(response.body.guestEmail).toBe(createData.guestEmail);
    });

    it('should handle different ISO 8601 date formats', async () => {
      const createData = {
        eventTypeId: testEventType1.id,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        startTime: '2024-06-15T10:00:00Z', // No milliseconds
      };

      const response = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(createData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should create multiple non-conflicting bookings', async () => {
      const booking1 = {
        eventTypeId: testEventType1.id,
        guestName: 'User 1',
        guestEmail: 'user1@example.com',
        startTime: '2024-06-15T10:00:00.000Z',
      };

      const booking2 = {
        eventTypeId: testEventType1.id,
        guestName: 'User 2',
        guestEmail: 'user2@example.com',
        startTime: '2024-06-15T11:00:00.000Z',
      };

      const response1 = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(booking1)
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/public/bookings')
        .send(booking2)
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);

      // Verify both bookings exist in the list
      const listResponse = await request(app.getHttpServer())
        .get('/api/owner/bookings')
        .expect(200);

      expect(listResponse.body).toHaveLength(2);
    });
  });
});
