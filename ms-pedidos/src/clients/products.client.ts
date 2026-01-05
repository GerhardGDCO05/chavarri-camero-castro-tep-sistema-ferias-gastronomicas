import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { Product, UpdateStockDto, VerifyStockDto } from '../interfaces/product-service.interface';

interface ProductsGrpcService {
  getProductById(data: { id: string }): Observable<Product>;
  verifyStock(data: VerifyStockDto): Observable<{ available: boolean; message?: string }>;
  updateStock(data: UpdateStockDto): Observable<{ success: boolean; message?: string }>;
}

@Injectable()
export class ProductsClient implements OnModuleInit {
  private productsService: ProductsGrpcService;

  constructor(@Inject('PRODUCTS_PACKAGE') private client: microservices.ClientGrpc) {}

  onModuleInit() {
    this.productsService = this.client.getService<ProductsGrpcService>('ProductsService');
  }

  async getProduct(productId: string): Promise<Product> {
    try {
      return await firstValueFrom(this.productsService.getProductById({ id: productId }));
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Error fetching product ${productId}: ${error.message}`);
    }
  }

  async verifyStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.productsService.verifyStock({ productId, quantity }),
      );
      return response.available;
    } catch (error) {
      console.error('Error verifying stock:', error);
      return false;
    }
  }

  async updateStock(productId: string, quantity: number, operation: 'decrement' | 'increment' = 'decrement'): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.productsService.updateStock({
          productId,
          quantity,
          operation,
        }),
      );
      return response.success;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  }

  async getMultipleProducts(productIds: string[]): Promise<Product[]> {
    try {
      const products: Product[] = [];
      for (const productId of productIds) {
        const product = await this.getProduct(productId);
        products.push(product);
      }
      return products;
    } catch (error) {
      console.error('Error fetching multiple products:', error);
      return [];
    }
  }
}