/**
 * Product Service Interface
 * Defines the contract for product-related business operations
 */

import type { Product, CreateProductDto, UpdateProductDto, QueryOptions } from '../../core/types/common.types';

export interface IProductService {
  /**
   * Create a new product
   */
  create(dto: CreateProductDto): Promise<Product>;

  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product>;

  /**
   * Find all products with optional query options
   */
  findAll(options?: QueryOptions): Promise<Product[]>;

  /**
   * Update an existing product
   */
  update(id: string, dto: UpdateProductDto): Promise<Product>;

  /**
   * Delete a product
   */
  delete(id: string): Promise<void>;

  /**
   * Find products by salon ID
   */
  findBySalonId(salonId: string): Promise<Product[]>;

  /**
   * Find products by vendor ID
   */
  findByVendorId(vendorId: string): Promise<Product[]>;

  /**
   * Find products by category
   */
  findByCategory(category: string): Promise<Product[]>;

  /**
   * Find product by SKU
   */
  findBySku(sku: string): Promise<Product | null>;

  /**
   * Search products by query
   */
  searchProducts(query: string, salonId?: string): Promise<Product[]>;

  /**
   * Get active products for a salon
   */
  getActiveProducts(salonId: string): Promise<Product[]>;

  /**
   * Activate a product
   */
  activate(id: string): Promise<void>;

  /**
   * Deactivate a product
   */
  deactivate(id: string): Promise<void>;
}
