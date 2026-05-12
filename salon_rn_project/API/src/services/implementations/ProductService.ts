/**
 * Product Service Implementation
 * Handles all product-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { IProductService } from '../interfaces/IProductService';
import { IProductRepository } from '../../repositories/interfaces/IProductRepository';
import { IVendorRepository } from '../../repositories/interfaces/IVendorRepository';
import { ISalonRepository } from '../../repositories/interfaces/ISalonRepository';
import type { Product, CreateProductDto, UpdateProductDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, NotFoundException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class ProductService extends BaseService implements IProductService {
  constructor(
    private productRepository: IProductRepository,
    private vendorRepository: IVendorRepository,
    private salonRepository: ISalonRepository
  ) {
    super();
    this.logger = new Logger('ProductService');
  }

  async create(dto: CreateProductDto): Promise<Product> {
    // Validate business rules
    await this.validateProduct(dto);

    const product = await this.productRepository.create(dto);

    this.logger.info('Product created successfully:', product.id);
    return product;
  }

  async findById(id: string): Promise<Product> {
    return await this.productRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Product[]> {
    return await this.productRepository.findAll(options);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findById(id);

    // Validate SKU uniqueness if being updated
    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.productRepository.findBySku(dto.sku);
      if (existing && existing.id !== id) {
        throw new ValidationException('SKU already in use');
      }
    }

    const updated = await this.productRepository.update(id, dto);

    this.logger.info('Product updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (product.isActive) {
      throw new ValidationException('Cannot delete active product. Deactivate it first.');
    }

    await this.productRepository.delete(id);

    this.logger.info('Product deleted successfully:', id);
  }

  async findBySalonId(salonId: string): Promise<Product[]> {
    return await this.productRepository.findBySalonId(salonId);
  }

  async findByVendorId(vendorId: string): Promise<Product[]> {
    return await this.productRepository.findByVendorId(vendorId);
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.findByCategory(category);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return await this.productRepository.findBySku(sku);
  }

  async searchProducts(query: string, salonId?: string): Promise<Product[]> {
    return await this.productRepository.searchProducts(query, salonId);
  }

  async getActiveProducts(salonId: string): Promise<Product[]> {
    return await this.productRepository.findActiveProducts(salonId);
  }

  async activate(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (product.isActive) {
      throw new ValidationException('Product is already active');
    }

    await this.productRepository.update(id, { isActive: true });

    this.logger.info('Product activated successfully:', id);
  }

  async deactivate(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product.isActive) {
      throw new ValidationException('Product is already inactive');
    }

    await this.productRepository.update(id, { isActive: false });

    this.logger.info('Product deactivated successfully:', id);
  }

  private async validateProduct(dto: CreateProductDto): Promise<void> {
    // Validate salon exists
    const salon = await this.salonRepository.findById(dto.salonId);
    if (!salon) {
      throw new NotFoundException('Salon', dto.salonId);
    }

    // Validate vendor exists
    const vendor = await this.vendorRepository.findById(dto.vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor', dto.vendorId);
    }

    // Validate SKU uniqueness
    if (dto.sku) {
      const existing = await this.productRepository.findBySku(dto.sku);
      if (existing) {
        throw new ValidationException('SKU already in use');
      }
    }

    // Validate price
    if (dto.price < 0) {
      throw new ValidationException('Product price cannot be negative');
    }

    // Validate cost
    if (dto.cost < 0) {
      throw new ValidationException('Product cost cannot be negative');
    }

    // Validate cost is less than price
    if (dto.cost >= dto.price) {
      throw new ValidationException('Product cost must be less than price');
    }
  }
}
