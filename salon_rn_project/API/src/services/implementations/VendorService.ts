/**
 * Vendor Service Implementation
 * Handles all vendor-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { IVendorService } from '../interfaces/IVendorService';
import { IVendorRepository } from '../../repositories/interfaces/IVendorRepository';
import { ISalonRepository } from '../../repositories/interfaces/ISalonRepository';
import type { Vendor, CreateVendorDto, UpdateVendorDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, NotFoundException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class VendorService extends BaseService implements IVendorService {
  constructor(
    private vendorRepository: IVendorRepository,
    private salonRepository: ISalonRepository
  ) {
    super();
    this.logger = new Logger('VendorService');
  }

  async create(dto: CreateVendorDto): Promise<Vendor> {
    // Validate business rules
    await this.validateVendor(dto);

    const vendor = await this.vendorRepository.create(dto);

    this.logger.info('Vendor created successfully:', vendor.id);
    return vendor;
  }

  async findById(id: string): Promise<Vendor> {
    return await this.vendorRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Vendor[]> {
    return await this.vendorRepository.findAll(options);
  }

  async update(id: string, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(id);

    // Validate email uniqueness if being updated
    if (dto.email && dto.email !== vendor.email) {
      const existing = await this.vendorRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ValidationException('Email already in use');
      }
    }

    const updated = await this.vendorRepository.update(id, dto);

    this.logger.info('Vendor updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const vendor = await this.vendorRepository.findById(id);

    if (vendor.isActive) {
      throw new ValidationException('Cannot delete active vendor. Deactivate it first.');
    }

    await this.vendorRepository.delete(id);

    this.logger.info('Vendor deleted successfully:', id);
  }

  async findBySalonId(salonId: string): Promise<Vendor[]> {
    return await this.vendorRepository.findBySalonId(salonId);
  }

  async findByEmail(email: string): Promise<Vendor | null> {
    return await this.vendorRepository.findByEmail(email);
  }

  async findByPhone(phone: string): Promise<Vendor | null> {
    return await this.vendorRepository.findByPhone(phone);
  }

  async getActiveVendors(salonId: string): Promise<Vendor[]> {
    return await this.vendorRepository.findActiveVendors(salonId);
  }

  async activate(id: string): Promise<void> {
    const vendor = await this.vendorRepository.findById(id);

    if (vendor.isActive) {
      throw new ValidationException('Vendor is already active');
    }

    await this.vendorRepository.update(id, { isActive: true });

    this.logger.info('Vendor activated successfully:', id);
  }

  async deactivate(id: string): Promise<void> {
    const vendor = await this.vendorRepository.findById(id);

    if (!vendor.isActive) {
      throw new ValidationException('Vendor is already inactive');
    }

    await this.vendorRepository.update(id, { isActive: false });

    this.logger.info('Vendor deactivated successfully:', id);
  }

  private async validateVendor(dto: CreateVendorDto): Promise<void> {
    // Validate salon exists
    const salon = await this.salonRepository.findById(dto.salonId);
    if (!salon) {
      throw new NotFoundException('Salon', dto.salonId);
    }

    // Validate email uniqueness
    if (dto.email) {
      const existing = await this.vendorRepository.findByEmail(dto.email);
      if (existing) {
        throw new ValidationException('Email already in use');
      }
    }

    // Validate phone uniqueness
    if (dto.phone) {
      const existing = await this.vendorRepository.findByPhone(dto.phone);
      if (existing) {
        throw new ValidationException('Phone number already in use');
      }
    }
  }
}
