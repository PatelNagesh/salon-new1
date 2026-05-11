import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Service repository interface
 */
export interface IServiceRepository extends IRepository {
  /**
   * Find service by salon ID
   */
  findBySalonId(salonId: string): Promise<any[]>;

  /**
   * Find service by category
   */
  findByCategory(category: string): Promise<any[]>;

  /**
   * Find active services
   */
  findActive(): Promise<any[]>;

  /**
   * Search services by name
   */
  searchByName(query: string): Promise<any[]>;

  /**
   * Find services by price range
   */
  findByPriceRange(minPrice: number, maxPrice: number): Promise<any[]>;

  /**
   * Find services by duration
   */
  findByDuration(minDuration: number, maxDuration: number): Promise<any[]>;
}
