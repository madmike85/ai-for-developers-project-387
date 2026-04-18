import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';
export declare class EventTypesController {
    private readonly eventTypesService;
    constructor(eventTypesService: EventTypesService);
    findAll(): Promise<{
        description: string | null;
        name: string;
        durationMinutes: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(data: CreateEventTypeDto): Promise<{
        description: string | null;
        name: string;
        durationMinutes: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<{
        description: string | null;
        name: string;
        durationMinutes: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateEventTypeDto): Promise<{
        description: string | null;
        name: string;
        durationMinutes: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<void>;
}
