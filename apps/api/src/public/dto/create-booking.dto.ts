import { IsString, IsEmail, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Event type ID' })
  @IsString()
  eventTypeId: string;

  @ApiProperty({ description: 'Guest name' })
  @IsString()
  guestName: string;

  @ApiProperty({ description: 'Guest email' })
  @IsEmail()
  guestEmail: string;

  @ApiProperty({ description: 'Booking start time (ISO 8601)' })
  @IsISO8601()
  startTime: string;
}
