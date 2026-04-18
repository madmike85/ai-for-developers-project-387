import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.eventType.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const eventType = await this.prisma.eventType.findUnique({
      where: { id },
    });

    if (!eventType) {
      throw new NotFoundException(`Event type with ID "${id}" not found`);
    }

    return eventType;
  }

  async create(data: CreateEventTypeDto) {
    return this.prisma.eventType.create({
      data,
    });
  }

  async update(id: string, data: UpdateEventTypeDto) {
    await this.findOne(id); // Verify exists

    return this.prisma.eventType.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify exists

    return this.prisma.eventType.delete({
      where: { id },
    });
  }
}
