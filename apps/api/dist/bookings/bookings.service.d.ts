import { PrismaService } from '../prisma/prisma.service';
export declare class BookingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllForOwner(): Promise<({
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
