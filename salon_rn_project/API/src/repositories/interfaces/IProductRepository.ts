import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Product repository interface
 */
export interface IProductRepository extends IRepository {
  /**
   * Find product by vendor ID
   */
  findByVendorId(vendorId: string): Promise<any[]>;

  /**
   * Find product by category
   */
  findByCategory(category: string): Promise<any[]>;

  /**
   * Find active products
   */
  findActive(): Promise<any[]>;

  /**
   * Search products by name
   */
  search(query: string): Promise<any[]>;

  /**
   * Find products by price range
   */
  findByPriceRange(minPrice: number, maxPrice: number): Promise<any[]>;

  /**
   * Find low stock products
   */
  findLowStock(threshold: number): Promise<any[]>;
}
