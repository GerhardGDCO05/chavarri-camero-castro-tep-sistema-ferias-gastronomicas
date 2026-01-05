import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/order-status.dto';
import { ProductsClient } from '../clients/products.client';
import { AuthClient } from '../clients/auth.client';
import { StallsClient } from '../clients/stalls.client';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        private productsClient: ProductsClient,
        private authClient: AuthClient,
        private stallsClient: StallsClient,
    ) { }

    async createOrder(createOrderDto: CreateOrderDto, customerId: string): Promise<Order> {
        try {
            // Validar que el puesto esté activo
            const isStallActive = await this.stallsClient.isStallActive(createOrderDto.stallId);
            if (!isStallActive) {
                throw new HttpException('El puesto no está activo', HttpStatus.BAD_REQUEST);
            }

            // Validar stock y calcular total
            let total = 0;
            const orderItems: Partial<OrderItem>[] = [];

            for (const item of createOrderDto.items) {
                // Verificar stock
                const isAvailable = await this.productsClient.verifyStock(item.productId, item.quantity);
                if (!isAvailable) {
                    throw new HttpException(
                        `Producto ${item.productId} no disponible en la cantidad solicitada`,
                        HttpStatus.BAD_REQUEST,
                    );
                }

                // Obtener información del producto
                const product = await this.productsClient.getProduct(item.productId);

                // Validar que el producto pertenezca al puesto
                if (product.stallId !== createOrderDto.stallId) {
                    throw new HttpException(
                        `El producto ${item.productId} no pertenece al puesto`,
                        HttpStatus.BAD_REQUEST,
                    );
                }

                total += product.price * item.quantity;

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: product.price,
                });
            }

            // Crear la orden
            const order = this.orderRepository.create({
                customerId,
                stallId: createOrderDto.stallId,
                total,
                status: 'pendiente',
            });

            const savedOrder = await this.orderRepository.save(order);

            // Crear items de la orden
            for (const item of orderItems) {
                const orderItem = this.orderItemRepository.create({
                    ...item,
                    orderId: savedOrder.id,
                });
                await this.orderItemRepository.save(orderItem);
            }

            // Actualizar stock de productos
            for (const item of createOrderDto.items) {
                await this.productsClient.updateStock(item.productId, item.quantity);
            }

            // Cargar relaciones - Manejar el posible null
            const fullOrder = await this.orderRepository.findOne({
                where: { id: savedOrder.id },
                relations: ['items'],
            });

            if (!fullOrder) {
                this.logger.error(`Orden no encontrada después de crear: ${savedOrder.id}`);
                throw new HttpException('Error al recuperar la orden creada', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            return fullOrder;
        } catch (error) {
            this.logger.error(`Error creando orden: ${error.message}`, error.stack);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(page = 1, limit = 10): Promise<{ data: Order[]; total: number }> {
        try {
            const [data, total] = await this.orderRepository.findAndCount({
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' },
                relations: ['items'],
            });

            return { data, total };
        } catch (error) {
            this.logger.error(`Error obteniendo todas las órdenes: ${error.message}`);
            throw new HttpException('Error al obtener las órdenes', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: string): Promise<Order> {
        try {
            const order = await this.orderRepository.findOne({
                where: { id },
                relations: ['items'],
            });

            if (!order) {
                throw new HttpException('Orden no encontrada', HttpStatus.NOT_FOUND);
            }

            return order;
        } catch (error) {
            this.logger.error(`Error obteniendo orden ${id}: ${error.message}`);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Error al obtener la orden', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByCustomer(customerId: string): Promise<Order[]> {
        try {
            return await this.orderRepository.find({
                where: { customerId },
                order: { createdAt: 'DESC' },
                relations: ['items'],
            });
        } catch (error) {
            this.logger.error(`Error obteniendo órdenes del cliente ${customerId}: ${error.message}`);
            throw new HttpException('Error al obtener las órdenes del cliente', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateOrderStatus(id: string, statusDto: UpdateOrderStatusDto): Promise<Order> {
        try {
            const order = await this.findOne(id);

            order.status = statusDto.status;
            order.updatedAt = new Date();

            const updatedOrder = await this.orderRepository.save(order);
            return updatedOrder;
        } catch (error) {
            this.logger.error(`Error actualizando estado de orden ${id}: ${error.message}`);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Error al actualizar el estado de la orden', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getOrderStatistics(stallId?: string): Promise<any> {
        try {
            let query = this.orderRepository.createQueryBuilder('order');

            if (stallId) {
                query = query.where('order.stall_id = :stallId', { stallId });
            }

            const totalOrders = await query.getCount();
            const totalRevenue = await query.select('SUM(order.total)', 'total').getRawOne();
            const completedOrders = await query
                .where('order.status = :status', { status: 'entregado' })
                .getCount();

            return {
                totalOrders,
                totalRevenue: parseFloat(totalRevenue.total) || 0,
                completedOrders,
                completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
            };
        } catch (error) {
            this.logger.error(`Error obteniendo estadísticas: ${error.message}`);
            throw new HttpException('Error al obtener estadísticas', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Método auxiliar para manejar findOne de manera segura
    async findOneSafe(id: string): Promise<Order | null> {
        try {
            return await this.orderRepository.findOne({
                where: { id },
                relations: ['items'],
            });
        } catch (error) {
            this.logger.error(`Error en findOneSafe para orden ${id}: ${error.message}`);
            return null;
        }
    }

    // Método para obtener órdenes con filtros opcionales
    async findOrdersWithFilters(filters?: {
        customerId?: string;
        stallId?: string;
        status?: 'pendiente' | 'preparando' | 'listo' | 'entregado';
        startDate?: Date;
        endDate?: Date;
    }): Promise<Order[]> {
        try {
            const queryBuilder = this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.items', 'items');

            if (filters?.customerId) {
                queryBuilder.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
            }

            if (filters?.stallId) {
                queryBuilder.andWhere('order.stallId = :stallId', { stallId: filters.stallId });
            }

            if (filters?.status) {
                queryBuilder.andWhere('order.status = :status', { status: filters.status });
            }

            if (filters?.startDate) {
                queryBuilder.andWhere('order.createdAt >= :startDate', { startDate: filters.startDate });
            }

            if (filters?.endDate) {
                queryBuilder.andWhere('order.createdAt <= :endDate', { endDate: filters.endDate });
            }

            queryBuilder.orderBy('order.createdAt', 'DESC');

            return await queryBuilder.getMany();
        } catch (error) {
            this.logger.error(`Error obteniendo órdenes con filtros: ${error.message}`);
            throw new HttpException('Error al obtener órdenes filtradas', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}