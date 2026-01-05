import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    Patch,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/order-status.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles('cliente')
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        return this.ordersService.createOrder(createOrderDto, req.user.id);
    }

    @Get()
    @Roles('organizador')
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.ordersService.findAll(page, limit);
    }

    @Get('my-orders')
    @Roles('cliente', 'emprendedor')
    async findMyOrders(@Request() req) {
        if (req.user.role === 'cliente') {
            return this.ordersService.findByCustomer(req.user.id);
        }
        // Para emprendedores, filtrar por su puesto
        // Necesitarás implementar esto según tu estructura
    }

    @Get(':id')
    @Roles('cliente', 'emprendedor', 'organizador')
    async findOne(@Param('id') id: string, @Request() req) {
        const order = await this.ordersService.findOne(id);

        // Validar que el usuario tenga acceso
        if (req.user.role === 'cliente' && order.customerId !== req.user.id) {
            throw new Error('No autorizado');
        }

        return order;
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @Roles('emprendedor', 'organizador')
    async updateStatus(
        @Param('id') id: string,
        @Body() statusDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateOrderStatus(id, statusDto);
    }

    @Get('statistics/summary')
    @Roles('organizador', 'emprendedor')
    async getStatistics(@Query('stallId') stallId?: string) {
        return this.ordersService.getOrderStatistics(stallId);
    }
}