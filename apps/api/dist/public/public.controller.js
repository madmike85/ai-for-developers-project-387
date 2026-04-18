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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_service_1 = require("./public.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
let PublicController = class PublicController {
    publicService;
    constructor(publicService) {
        this.publicService = publicService;
    }
    findAllEventTypes() {
        return this.publicService.findAllEventTypes();
    }
    findAvailableSlots(eventTypeId, date) {
        return this.publicService.findAvailableSlots(eventTypeId, date);
    }
    createBooking(data) {
        return this.publicService.createBooking(data);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('event-types'),
    (0, swagger_1.ApiOperation)({ summary: 'List all event types (public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of event types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "findAllEventTypes", null);
__decorate([
    (0, common_1.Get)('slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available time slots for a date' }),
    (0, swagger_1.ApiQuery)({ name: 'eventTypeId', required: true, description: 'Event type ID' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: true, description: 'Date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of available time slots' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Query)('eventTypeId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "findAvailableSlots", null);
__decorate([
    (0, common_1.Post)('bookings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a booking' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Booking created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Time slot occupied' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "createBooking", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('Public (Guest)'),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map