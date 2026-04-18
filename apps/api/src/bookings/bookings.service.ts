import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForOwner() {
    return this.prisma.booking.findMany({
      include: {
        eventType: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }
}
