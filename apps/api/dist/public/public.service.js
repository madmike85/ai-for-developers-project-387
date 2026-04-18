"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicService = class PublicService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllEventTypes() {
        return this.prisma.eventType.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAvailableSlots(eventTypeId, date) {
        if (!eventTypeId) {
            throw new common_1.BadRequestException('Event type not found');
        }
        if (!date) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        const eventType = await this.prisma.eventType.findUnique({
            where: { id: eventTypeId },
        });
        if (!eventType) {
            throw new common_1.BadRequestException('Event type not found');
        }
        const selectedDate = new Date(date);
        if (isNaN(selectedDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        const slots = [];
        const startHour = 9;
        const endHour = 18;
        const durationMinutes = eventType.durationMinutes;
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
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += durationMinutes) {
                const slotStart = new Date(selectedDate);
                slotStart.setUTCHours(hour, minute, 0, 0);
                const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
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
    async createBooking(data) {
        const eventType = await this.prisma.eventType.findUnique({
            where: { id: data.eventTypeId },
        });
        if (!eventType) {
            throw new common_1.BadRequestException('Event type not found');
        }
        const startTime = new Date(data.startTime);
        const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60 * 1000);
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
            throw new common_1.ConflictException({
                code: 'TIME_SLOT_OCCUPIED',
                message: 'This time slot is already booked',
                conflictingBookingId: conflictingBooking.id,
            });
        }
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
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map