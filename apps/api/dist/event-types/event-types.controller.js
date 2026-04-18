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
exports.EventTypesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const event_types_service_1 = require("./event-types.service");
const create_event_type_dto_1 = require("./dto/create-event-type.dto");
const update_event_type_dto_1 = require("./dto/update-event-type.dto");
let EventTypesController = class EventTypesController {
    eventTypesService;
    constructor(eventTypesService) {
        this.eventTypesService = eventTypesService;
    }
    findAll() {
        return this.eventTypesService.findAll();
    }
    create(data) {
        return this.eventTypesService.create(data);
    }
    findOne(id) {
        return this.eventTypesService.findOne(id);
    }
    update(id, data) {
        return this.eventTypesService.update(id, data);
    }
    async remove(id) {
        await this.eventTypesService.remove(id);
    }
};
exports.EventTypesController = EventTypesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all event types' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of event types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event type' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event type created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_type_dto_1.CreateEventTypeDto]),
    __metadata("design:returntype", void 0)
], EventTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event type by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event type found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event type updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event type not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_type_dto_1.UpdateEventTypeDto]),
    __metadata("design:returntype", void 0)
], EventTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete event type' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Event type deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventTypesController.prototype, "remove", null);
exports.EventTypesController = EventTypesController = __decorate([
    (0, swagger_1.ApiTags)('Event Types (Owner)'),
    (0, common_1.Controller)('api/event-types'),
    __metadata("design:paramtypes", [event_types_service_1.EventTypesService])
], EventTypesController);
//# sourceMappingURL=event-types.controller.js.map