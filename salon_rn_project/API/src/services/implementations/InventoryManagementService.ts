import { BaseService } from '../../core/base/BaseService';
  import { IInventoryManagementService } from '../interfaces/IInventoryManagementService';
  import { IInventoryRepository } from '../../repositories/interfaces/IInventoryRepository';
  import { IProductRepository } from '../../repositories/interfaces/IProductRepository';
  import { Logger } from '../../core/utils/logger.util';
  import { ValidationException, ResourceNotFoundException } from '../../exceptions';

  /**
  - Inventory management service implementation
   */
  export class InventoryManagementService extends BaseService implements IInventoryManagementService {
    private logger = new Logger('InventoryManagementService');

    constructor(
      private inventoryRepository: IInventoryRepository,
      private productRepository: IProductRepository
    ) {
      super();
    }

    async getInventory(inventoryId: string): Promise {
      this.logger.info('Getting inventory:', { inventoryId });

  const inventory = await this.inventoryRepository.findById(inventoryId);

  if (!inventory) {
    throw new ResourceNotFoundException('INV_001', 'Inventory not found');
  }

  return inventory;
    }

    async getAllInventory(salonId?: string): Promise<any[]> {
      this.logger.info('Getting all inventory:', { salonId });

  if (salonId) {
    return await this.inventoryRepository.findBySalonId(salonId);
  }

  return await this.inventoryRepository.findAll();
    }

    async createInventory(inventoryData: any): Promise {
      this.logger.info('Creating inventory:', inventoryData);

  // Validate product exists
  const product = await this.productRepository.findById(inventoryData.productId);
  if (!product) {
    throw new ValidationException('VAL_001', 'Product not found');
  }

  // Check if inventory already exists for this product and salon
  const existing = await this.inventoryRepository.findByProductAndSalon(
    inventoryData.productId,
    inventoryData.salonId
  );

  if (existing) {
    throw new ValidationException('VAL_002', 'Inventory already exists for this product');
  }

  return await this.inventoryRepository.create(inventoryData);
    }

    async updateInventory(inventoryId: string, inventoryData: any): Promise {
      this.logger.info('Updating inventory:', { inventoryId, inventoryData });

  const inventory = await this.inventoryRepository.findById(inventoryId);
  if (!inventory) {
    throw new ResourceNotFoundException('INV_001', 'Inventory not found');
  }

  return await this.inventoryRepository.update(inventoryId, inventoryData);
    }

    async deleteInventory(inventoryId: string): Promise {
      this.logger.info('Deleting inventory:', { inventoryId });

  const inventory = await this.inventoryRepository.findById(inventoryId);
  if (!inventory) {
    throw new ResourceNotFoundException('INV_001', 'Inventory not found');
  }

  await this.inventoryRepository.delete(inventoryId);
    }

    async getLowStockItems(salonId: string, threshold?: number): Promise<any[]> {
      this.logger.info('Getting low stock items:', { salonId, threshold });

  const stockThreshold = threshold || 10;
  const allInventory = await this.inventoryRepository.findBySalonId(salonId);

  return allInventory.filter(item => item.quantity <= stockThreshold);
    }

    async restockInventory(inventoryId: string, quantity: number): Promise {
      this.logger.info('Restocking inventory:', { inventoryId, quantity });

  if (quantity <= 0) {
    throw new ValidationException('VAL_003', 'Quantity must be greater than 0');
  }

  const inventory = await this.inventoryRepository.findById(inventoryId);
  if (!inventory) {
    throw new ResourceNotFoundException('INV_001', 'Inventory not found');
  }

  const updatedQuantity = inventory.quantity + quantity;

  return await this.inventoryRepository.update(inventoryId, {
    quantity: updatedQuantity,
    lastRestockedAt: new Date().toISOString()
  });
    }

    async updateStockLevel(inventoryId: string, quantity: number): Promise {
      this.logger.info('Updating stock level:', { inventoryId, quantity });

  if (quantity < 0) {
    throw new ValidationException('VAL_003', 'Quantity cannot be negative');
  }

  const inventory = await this.inventoryRepository.findById(inventoryId);
  if (!inventory) {
    throw new ResourceNotFoundException('INV_001', 'Inventory not found');
  }

  return await this.inventoryRepository.update(inventoryId, {
    quantity
  });
    }

    async getInventoryByProduct(productId: string): Promise<any[]> {
      this.logger.info('Getting inventory by product:', { productId });

  return await this.inventoryRepository.findByProductId(productId);
    }

    async getInventoryBySalon(salonId: string): Promise<any[]> {
      this.logger.info('Getting inventory by salon:', { salonId });

  return await this.inventoryRepository.findBySalonId(salonId);
    }
  }