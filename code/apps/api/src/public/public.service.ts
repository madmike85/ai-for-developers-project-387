import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllEventTypes() {
    return this.prisma.eventType.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailableSlots(eventTypeId: string, date: string) {
    // Validate eventTypeId is provided
    if (!eventTypeId) {
      throw new BadRequestException('Event type not found');
    }

    // Validate date is provided
    if (!date) {
      throw new BadRequestException('Invalid date format');
    }

    // Validate event type exists
    const eventType = await this.prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      throw new BadRequestException('Event type not found');
    }

    // Parse the date
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // Generate slots for the date (9:00 - 18:00)
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    const durationMinutes = eventType.durationMinutes;

    // Get existing bookings for this date
    const dayStart = new Date(selectedDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Generate slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += durationMinutes) {
        const slotStart = new Date(selectedDate);
        slotStart.setUTCHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

        // Check for conflicts
        const isOverlapping = existingBookings.some((booking) => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: !isOverlapping,
        });
      }
    }

    return slots;
  }

  async createBooking(data: CreateBookingDto) {
    // Get event type
    const eventType = await this.prisma.eventType.findUnique({
      where: { id: data.eventTypeId },
    });

    if (!eventType) {
      throw new BadRequestException('Event type not found');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60 * 1000);

    // Check for conflicts
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        AND: [
          {
            startTime: {
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: startTime,
            },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new ConflictException({
        code: 'TIME_SLOT_OCCUPIED',
        message: 'This time slot is already booked',
        conflictingBookingId: conflictingBooking.id,
      });
    }

    // Create booking
    return this.prisma.booking.create({
      data: {
        eventTypeId: data.eventTypeId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        startTime,
        endTime,
      },
      include: {
        eventType: true,
      },
    });
  }
}
