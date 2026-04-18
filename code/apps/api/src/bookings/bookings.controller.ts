import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';

@ApiTags('Bookings (Owner)')
@Controller('api/owner/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all bookings for owner' })
  @ApiResponse({ status: 200, description: 'List of all bookings' })
  findAll() {
    return this.bookingsService.findAllForOwner();
  }
}
