import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Inventory entity interface
 */
export interface Inventory {
  id: string;
  salonId: string;
  productId: string;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  lastRestocked?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create inventory DTO
 */
export interface CreateInventoryDto {
  salonId: string;
  productId: string;
  quantity: number;
  location?: string;
  notes?: string;
}

/**
 * Update inventory DTO
 */
export interface UpdateInventoryDto {
  quantity?: number;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  lastRestocked?: string;
  location?: string;
  notes?: string;
}

/**
 * Inventory repository interface
 */
export interface IInventoryRepository extends IRepository<Inventory, CreateInventoryDto, UpdateInventoryDto> {
  findBySalonId(salonId: string): Promise<Inventory[]>;
  findByProductId(productId: string): Promise<Inventory[]>;
  findByStatus(status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'): Promise<Inventory[]>;
  findBySalonAndProduct(salonId: string, productId: string): Promise<Inventory | null>;
  findLowStock(salonId: string): Promise<Inventory[]>;
  findOutOfStock(salonId: string): Promise<Inventory[]>;
  existsBySalonAndProduct(salonId: string, productId: string): Promise<boolean>;
}
