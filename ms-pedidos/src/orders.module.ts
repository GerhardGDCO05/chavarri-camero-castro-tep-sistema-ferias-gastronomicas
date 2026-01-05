import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { ProductsClient } from './clients/products.client';
import { AuthClient } from './clients/auth.client';
import { StallsClient } from './clients/stalls.client';

// Función auxiliar para parsear puertos de manera segura
function parsePort(port: string | undefined, defaultPort: number): number {
    if (!port) return defaultPort;
    const parsed = parseInt(port);
    return isNaN(parsed) ? defaultPort : parsed;
}

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem]),
        ClientsModule.register([
            {
                name: 'PRODUCTS_PACKAGE',
                transport: Transport.TCP,
                options: {
                    host: process.env.PRODUCTS_SERVICE_HOST || 'ms-productos',
                    port: parsePort(process.env.PRODUCTS_SERVICE_PORT, 3003),
                },
            },
            {
                name: 'AUTH_PACKAGE',
                transport: Transport.TCP,
                options: {
                    host: process.env.AUTH_SERVICE_HOST || 'ms-auth',
                    port: parsePort(process.env.AUTH_SERVICE_PORT, 3001),
                },
            },
            {
                name: 'STALLS_PACKAGE',
                transport: Transport.TCP,
                options: {
                    host: process.env.STALLS_SERVICE_HOST || 'ms-puestos',
                    port: parsePort(process.env.STALLS_SERVICE_PORT, 3002),
                },
            },
        ]),
    ],
    controllers: [OrdersController],
    providers: [OrdersService, ProductsClient, AuthClient, StallsClient],
    exports: [OrdersService],
})
export class OrdersModule { }