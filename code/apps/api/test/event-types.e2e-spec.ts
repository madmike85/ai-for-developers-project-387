import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('EventTypesController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

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
    // Clean up event types before each test
    await prisma.eventType.deleteMany({});
  });

  afterAll(async () => {
    await prisma.eventType.deleteMany({});
    await app.close();
  });

  describe('A1: GET /api/event-types', () => {
    it('should return an empty array when no event types exist (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/event-types')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of event types with correct structure (200 OK)', async () => {
      // Create test data
      await prisma.eventType.create({
        data: {
          name: 'Initial Consultation',
          description: 'First meeting with client',
          durationMinutes: 30,
        },
      });

      await prisma.eventType.create({
        data: {
          name: 'Team Meeting',
          description: 'Weekly team sync',
          durationMinutes: 60,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/event-types')
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

      // Verify data types
      const firstEvent = response.body[0];
      expect(typeof firstEvent.id).toBe('string');
      expect(typeof firstEvent.name).toBe('string');
      expect(typeof firstEvent.durationMinutes).toBe('number');
    });

    it('should return event types ordered by createdAt desc', async () => {
      await prisma.eventType.create({
        data: {
          name: 'First Event',
          durationMinutes: 15,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.eventType.create({
        data: {
          name: 'Second Event',
          durationMinutes: 30,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/event-types')
        .expect(200);

      expect(response.body[0].name).toBe('Second Event');
      expect(response.body[1].name).toBe('First Event');
    });
  });

  describe('A2: POST /api/event-types', () => {
    it('should create an event type with valid data (201 Created)', async () => {
      const createData = {
        name: 'New Event Type',
        description: 'Description for new event type',
        durationMinutes: 45,
      };

      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send(createData)
        .expect(201);

      // Verify response contains created object with generated ID
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');
      expect(response.body.name).toBe(createData.name);
      expect(response.body.description).toBe(createData.description);
      expect(response.body.durationMinutes).toBe(createData.durationMinutes);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create an event type without optional description (201 Created)', async () => {
      const createData = {
        name: 'Event Without Description',
        durationMinutes: 30,
      };

      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send(createData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createData.name);
      expect(response.body.description).toBeNull();
      expect(response.body.durationMinutes).toBe(createData.durationMinutes);
    });

    it('should generate unique IDs for each created event type', async () => {
      const createData1 = {
        name: 'Event Type 1',
        durationMinutes: 30,
      };

      const createData2 = {
        name: 'Event Type 2',
        durationMinutes: 60,
      };

      const response1 = await request(app.getHttpServer())
        .post('/api/event-types')
        .send(createData1)
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/api/event-types')
        .send(createData2)
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);
    });
  });

  describe('A3: GET /api/event-types/:id', () => {
    it('should return a single event type for existing ID (200 OK)', async () => {
      const created = await prisma.eventType.create({
        data: {
          name: 'Specific Event',
          description: 'A specific event type',
          durationMinutes: 90,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/event-types/${created.id}`)
        .expect(200);

      expect(response.body.id).toBe(created.id);
      expect(response.body.name).toBe(created.name);
      expect(response.body.description).toBe(created.description);
      expect(response.body.durationMinutes).toBe(created.durationMinutes);
    });

    it('should return 404 for non-existing event type ID', async () => {
      const nonExistingId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get(`/api/event-types/${nonExistingId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for invalid ID format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/event-types/invalid-id')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('A4: PATCH /api/event-types/:id', () => {
    it('should update an event type (200 OK)', async () => {
      const created = await prisma.eventType.create({
        data: {
          name: 'Original Name',
          description: 'Original description',
          durationMinutes: 30,
        },
      });

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        durationMinutes: 60,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/event-types/${created.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(created.id);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.durationMinutes).toBe(updateData.durationMinutes);
      expect(response.body.createdAt).toBe(created.createdAt.toISOString());
    });

    it('should perform partial update (200 OK)', async () => {
      const created = await prisma.eventType.create({
        data: {
          name: 'Event Name',
          description: 'Event description',
          durationMinutes: 30,
        },
      });

      const updateData = {
        name: 'Only Name Updated',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/event-types/${created.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(created.description);
      expect(response.body.durationMinutes).toBe(created.durationMinutes);
    });

    it('should return 404 for non-existing event type ID', async () => {
      const nonExistingId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .patch(`/api/event-types/${nonExistingId}`)
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should update updatedAt timestamp', async () => {
      const created = await prisma.eventType.create({
        data: {
          name: 'Test Event',
          durationMinutes: 30,
        },
      });

      const originalUpdatedAt = created.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const response = await request(app.getHttpServer())
        .patch(`/api/event-types/${created.id}`)
        .send({ name: 'Updated Test Event' })
        .expect(200);

      const newUpdatedAt = new Date(response.body.updatedAt);
      expect(newUpdatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('A5: DELETE /api/event-types/:id', () => {
    it('should delete an event type (204 No Content)', async () => {
      const created = await prisma.eventType.create({
        data: {
          name: 'Event To Delete',
          durationMinutes: 30,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/event-types/${created.id}`)
        .expect(204);

      // Verify the event type was actually deleted
      const found = await prisma.eventType.findUnique({
        where: { id: created.id },
      });
      expect(found).toBeNull();
    });

    it('should return 404 for non-existing event type ID', async () => {
      const nonExistingId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .delete(`/api/event-types/${nonExistingId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return empty body for successful deletion', async () => {
      const created = await prisma.eventType.create({
        data: {
          name: 'Event To Delete',
          durationMinutes: 30,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/api/event-types/${created.id}`)
        .expect(204);

      expect(response.body).toEqual({});
      expect(response.text).toBe('');
    });
  });

  describe('Negative Tests: Validation Errors', () => {
    describe('POST validation', () => {
      it('should return 400 when name is missing', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            durationMinutes: 30,
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('name')]),
        );
      });

      it('should return 400 when durationMinutes is missing', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 'Test Event',
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('durationMinutes')]),
        );
      });

      it('should return 400 when name is too short (less than 2 characters)', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 'A',
            durationMinutes: 30,
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('name')]),
        );
      });

      it('should return 400 when name is too long (more than 100 characters)', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 'A'.repeat(101),
            durationMinutes: 30,
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('name')]),
        );
      });

      it('should return 400 when durationMinutes is less than 5', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 'Test Event',
            durationMinutes: 4,
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('durationMinutes')]),
        );
      });

      it('should return 400 when durationMinutes is greater than 480', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 'Test Event',
            durationMinutes: 481,
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('durationMinutes')]),
        );
      });

      it('should return 400 when durationMinutes is not an integer', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 'Test Event',
            durationMinutes: 30.5,
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('durationMinutes')]),
        );
      });

      it('should return 400 when name is not a string', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 123,
            durationMinutes: 30,
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('name')]),
        );
      });

      it('should return 400 when sending extra fields', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({
            name: 'Test Event',
            durationMinutes: 30,
            extraField: 'should not be allowed',
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('should not exist')]),
        );
      });

      it('should return 400 for empty request body', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/event-types')
          .send({})
          .expect(400);

        expect(response.body.message).toBeDefined();
      });
    });

    describe('PATCH validation', () => {
      it('should return 400 when updating with invalid name', async () => {
        const created = await prisma.eventType.create({
          data: {
            name: 'Valid Event',
            durationMinutes: 30,
          },
        });

        const response = await request(app.getHttpServer())
          .patch(`/api/event-types/${created.id}`)
          .send({
            name: 'A', // too short
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('name')]),
        );
      });

      it('should return 400 when updating with invalid durationMinutes', async () => {
        const created = await prisma.eventType.create({
          data: {
            name: 'Valid Event',
            durationMinutes: 30,
          },
        });

        const response = await request(app.getHttpServer())
          .patch(`/api/event-types/${created.id}`)
          .send({
            durationMinutes: 500, // exceeds max
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('durationMinutes')]),
        );
      });

      it('should return 400 when sending extra fields in PATCH', async () => {
        const created = await prisma.eventType.create({
          data: {
            name: 'Valid Event',
            durationMinutes: 30,
          },
        });

        const response = await request(app.getHttpServer())
          .patch(`/api/event-types/${created.id}`)
          .send({
            name: 'Updated Name',
            extraField: 'should not be allowed',
          })
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('should not exist')]),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should allow event types with same name (no unique constraint)', async () => {
      const eventData = {
        name: 'Duplicate Name',
        durationMinutes: 30,
      };

      const response1 = await request(app.getHttpServer())
        .post('/api/event-types')
        .send(eventData)
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/api/event-types')
        .send(eventData)
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);
      expect(response1.body.name).toBe(response2.body.name);
    });

    it('should handle boundary values for durationMinutes (min: 5)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({
          name: 'Minimum Duration',
          durationMinutes: 5,
        })
        .expect(201);

      expect(response.body.durationMinutes).toBe(5);
    });

    it('should handle boundary values for durationMinutes (max: 480)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({
          name: 'Maximum Duration',
          durationMinutes: 480,
        })
        .expect(201);

      expect(response.body.durationMinutes).toBe(480);
    });

    it('should handle boundary values for name (min: 2 chars)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({
          name: 'AB',
          durationMinutes: 30,
        })
        .expect(201);

      expect(response.body.name).toBe('AB');
    });

    it('should handle boundary values for name (max: 100 chars)', async () => {
      const longName = 'A'.repeat(100);

      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({
          name: longName,
          durationMinutes: 30,
        })
        .expect(201);

      expect(response.body.name).toBe(longName);
    });

    it('should handle description with empty string', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({
          name: 'Empty Description Test',
          description: '',
          durationMinutes: 30,
        })
        .expect(201);

      expect(response.body.description).toBe('');
    });

    it('should handle special characters in name and description', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({
          name: 'Event with special chars: <script>alert("xss")</script>',
          description: 'Description with émojis 🎉 and & < > "quotes"',
          durationMinutes: 30,
        })
        .expect(201);

      expect(response.body.name).toContain('<script>');
      expect(response.body.description).toContain('🎉');
    });
  });
});
