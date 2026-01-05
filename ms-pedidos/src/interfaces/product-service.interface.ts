export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  available: boolean;
  stallId: string;
}

export interface UpdateStockDto {
  productId: string;
  quantity: number;
  operation: 'decrement' | 'increment';
}

export interface VerifyStockDto {
  productId: string;
  quantity: number;
}