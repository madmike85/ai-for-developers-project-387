import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Public (Guest)')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('event-types')
  @ApiOperation({ summary: 'List all event types (public)' })
  @ApiResponse({ status: 200, description: 'List of event types' })
  findAllEventTypes() {
    return this.publicService.findAllEventTypes();
  }

  @Get('slots')
  @ApiOperation({ summary: 'Get available time slots for a date' })
  @ApiQuery({ name: 'eventTypeId', required: true, description: 'Event type ID' })
  @ApiQuery({ name: 'date', required: true, description: 'Date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'List of available time slots' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  findAvailableSlots(
    @Query('eventTypeId') eventTypeId: string,
    @Query('date') date: string,
  ) {
    return this.publicService.findAvailableSlots(eventTypeId, date);
  }

  @Post('bookings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Time slot occupied' })
  createBooking(@Body() data: CreateBookingDto) {
    return this.publicService.createBooking(data);
  }
}
