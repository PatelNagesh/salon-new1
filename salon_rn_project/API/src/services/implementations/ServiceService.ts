/**
 * Service Service Implementation
 * Handles all service-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { IServiceService } from '../interfaces/IServiceService';
import { IServiceRepository } from '../../repositories/interfaces/IServiceRepository';
import { ISalonRepository } from '../../repositories/interfaces/ISalonRepository';
import type { Service, CreateServiceDto, UpdateServiceDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, NotFoundException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class ServiceService extends BaseService implements IServiceService {
  constructor(
    private serviceRepository: IServiceRepository,
    private salonRepository: ISalonRepository
  ) {
    super();
    this.logger = new Logger('ServiceService');
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    // Validate business rules
    await this.validateService(dto);

    const service = await this.serviceRepository.create(dto);

    this.logger.info('Service created successfully:', service.id);
    return service;
  }

  async findById(id: string): Promise<Service> {
    return await this.serviceRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Service[]> {
    return await this.serviceRepository.findAll(options);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.serviceRepository.findById(id);

    // Validate name uniqueness within salon if being updated
    if (dto.name && dto.name !== service.name) {
      const existing = await this.serviceRepository.existsByName(service.salonId, dto.name);
      if (existing) {
        throw new ValidationException('Service name already exists in this salon');
      }
    }

    const updated = await this.serviceRepository.update(id, dto);

    this.logger.info('Service updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);

    if (service.isActive) {
      throw new ValidationException('Cannot delete active service. Deactivate it first.');
    }

    await this.serviceRepository.delete(id);

    this.logger.info('Service deleted successfully:', id);
  }

  async findBySalonId(salonId: string): Promise<Service[]> {
    return await this.serviceRepository.findBySalonId(salonId);
  }

  async findByCategory(category: string): Promise<Service[]> {
    return await this.serviceRepository.findByCategory(category);
  }

  async findByStatus(status: string): Promise<Service[]> {
    return await this.serviceRepository.findByStatus(status);
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]> {
    return await this.serviceRepository.findByPriceRange(minPrice, maxPrice);
  }

  async searchServices(query: string, salonId?: string): Promise<Service[]> {
    return await this.serviceRepository.searchServices(query, salonId);
  }

  async getActiveServices(salonId: string): Promise<Service[]> {
    return await this.serviceRepository.findActiveServices(salonId);
  }

  async getPopularServices(salonId: string, limit?: number): Promise<Service[]> {
    return await this.serviceRepository.getPopularServices(salonId, limit);
  }

  async activate(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);

    if (service.isActive) {
      throw new ValidationException('Service is already active');
    }

    await this.serviceRepository.update(id, { isActive: true });

    this.logger.info('Service activated successfully:', id);
  }

  async deactivate(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);

    if (!service.isActive) {
      throw new ValidationException('Service is already inactive');
    }

    await this.serviceRepository.update(id, { isActive: false });

    this.logger.info('Service deactivated successfully:', id);
  }

  private async validateService(dto: CreateServiceDto): Promise<void> {
    // Validate salon exists
    const salon = await this.salonRepository.findById(dto.salonId);
    if (!salon) {
      throw new NotFoundException('Salon', dto.salonId);
    }

    // Validate name uniqueness within salon
    const existing = await this.serviceRepository.existsByName(dto.salonId, dto.name);
    if (existing) {
      throw new ValidationException('Service name already exists in this salon');
    }

    // Validate duration
    if (dto.duration <= 0) {
      throw new ValidationException('Service duration must be greater than 0');
    }

    // Validate price
    if (dto.price < 0) {
      throw new ValidationException('Service price cannot be negative');
    }
  }
}
