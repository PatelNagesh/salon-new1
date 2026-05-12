/**
 * Inventory Service Implementation
 * Handles all inventory-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { IInventoryService } from '../interfaces/IInventoryService';
import { IInventoryRepository } from '../../repositories/interfaces/IInventoryRepository';
import { IProductRepository } from '../../repositories/interfaces/IProductRepository';
import { ISalonRepository } from '../../repositories/interfaces/ISalonRepository';
import type { Inventory, CreateInventoryDto, UpdateInventoryDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, NotFoundException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class InventoryService extends BaseService implements IInventoryService {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private productRepository: IProductRepository,
    private salonRepository: ISalonRepository
  ) {
    super();
    this.logger = new Logger('InventoryService');
  }

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    // Validate business rules
    await this.validateInventory(dto);

    const inventory = await this.inventoryRepository.create(dto);

    this.logger.info('Inventory created successfully:', inventory.id);
    return inventory;
  }

  async findById(id: string): Promise<Inventory> {
    return await this.inventoryRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Inventory[]> {
    return await this.inventoryRepository.findAll(options);
  }

  async update(id: string, dto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findById(id);

    const updated = await this.inventoryRepository.update(id, dto);

    this.logger.info('Inventory updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.inventoryRepository.delete(id);

    this.logger.info('Inventory deleted successfully:', id);
  }

  async findBySalonId(salonId: string): Promise<Inventory[]> {
    return await this.inventoryRepository.findBySalonId(salonId);
  }

  async findByProductId(productId: string): Promise<Inventory[]> {
    return await this.inventoryRepository.findByProductId(productId);
  }

  async findLowStock(salonId: string): Promise<Inventory[]> {
    return await this.inventoryRepository.findLowStock(salonId);
  }

  async findByExpiryDate(startDate: Date, endDate: Date): Promise<Inventory[]> {
    return await this.inventoryRepository.findByExpiryDate(startDate, endDate);
  }

  async updateQuantity(id: string, quantity: number): Promise<Inventory> {
    if (quantity < 0) {
      throw new ValidationException('Quantity cannot be negative');
    }

    return await this.inventoryRepository.updateQuantity(id, quantity);
  }

  async adjustQuantity(id: string, adjustment: number): Promise<Inventory> {
    return await this.inventoryRepository.adjustQuantity(id, adjustment);
  }

  async getInventoryValue(salonId: string): Promise<number> {
    return await this.inventoryRepository.getInventoryValue(salonId);
  }

  async getExpiringSoon(salonId: string, days: number = 30): Promise<Inventory[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.inventoryRepository.findByExpiryDate(today, futureDate);
  }

  async restock(id: string, quantity: number): Promise<Inventory> {
    if (quantity <= 0) {
      throw new ValidationException('Restock quantity must be greater than 0');
    }

    const inventory = await this.inventoryRepository.findById(id);
    const newQuantity = inventory.quantity + quantity;

    return await this.inventoryRepository.updateQuantity(id, newQuantity);
  }

  async consume(id: string, quantity: number): Promise<Inventory> {
    if (quantity <= 0) {
      throw new ValidationException('Consume quantity must be greater than 0');
    }

    const inventory = await this.inventoryRepository.findById(id);

    if (inventory.quantity < quantity) {
      throw new ValidationException('Insufficient inventory');
    }

    const newQuantity = inventory.quantity - quantity;
    return await this.inventoryRepository.updateQuantity(id, newQuantity);
  }

  private async validateInventory(dto: CreateInventoryDto): Promise<void> {
    // Validate salon exists
    const salon = await this.salonRepository.findById(dto.salonId);
    if (!salon) {
      throw new NotFoundException('Salon', dto.salonId);
    }

    // Validate product exists
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product', dto.productId);
    }

    // Validate quantity
    if (dto.quantity < 0) {
      throw new ValidationException('Quantity cannot be negative');
    }

    // Validate minimum quantity
    if (dto.minimumQuantity < 0) {
      throw new ValidationException('Minimum quantity cannot be negative');
    }

    // Validate expiry date
    if (dto.expiryDate) {
      const expiryDate = new Date(dto.expiryDate);
      const today = new Date();

      if (expiryDate < today) {
        throw new ValidationException('Expiry date cannot be in the past');
      }
    }
  }
}
