import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    findAll(): Promise<({
        eventType: {
            description: string | null;
            name: string;
            durationMinutes: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        eventTypeId: string;
        guestName: string;
        guestEmail: string;
        startTime: Date;
        endTime: Date;
    })[]>;
}
