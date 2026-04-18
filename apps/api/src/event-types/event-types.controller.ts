import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@ApiTags('Event Types (Owner)')
@Controller('api/event-types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all event types' })
  @ApiResponse({ status: 200, description: 'List of event types' })
  findAll() {
    return this.eventTypesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event type' })
  @ApiResponse({ status: 201, description: 'Event type created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() data: CreateEventTypeDto) {
    return this.eventTypesService.create(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event type by ID' })
  @ApiResponse({ status: 200, description: 'Event type found' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  findOne(@Param('id') id: string) {
    return this.eventTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event type' })
  @ApiResponse({ status: 200, description: 'Event type updated' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  update(@Param('id') id: string, @Body() data: UpdateEventTypeDto) {
    return this.eventTypesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete event type' })
  @ApiResponse({ status: 204, description: 'Event type deleted' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  async remove(@Param('id') id: string) {
    await this.eventTypesService.remove(id);
  }
}
