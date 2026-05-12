/**
 * Service Service Interface
 * Defines the contract for service-related business operations
 */

import type { Service, CreateServiceDto, UpdateServiceDto, QueryOptions } from '../../core/types/common.types';

export interface IServiceService {
  create(dto: CreateServiceDto): Promise<Service>;
  findById(id: string): Promise<Service>;
  findAll(options?: QueryOptions): Promise<Service[]>;
  update(id: string, dto: UpdateServiceDto): Promise<Service>;
  delete(id: string): Promise<void>;
  findBySalonId(salonId: string): Promise<Service[]>;
  findByCategory(category: string): Promise<Service[]>;
  findByStatus(status: string): Promise<Service[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]>;
  searchServices(query: string, salonId?: string): Promise<Service[]>;
  getActiveServices(salonId: string): Promise<Service[]>;
  getPopularServices(salonId: string, limit?: number): Promise<Service[]>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}
