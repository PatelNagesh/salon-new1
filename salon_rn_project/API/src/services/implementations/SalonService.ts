/**
 * Salon Service Implementation
 * Handles all salon-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { ISalonService } from '../interfaces/ISalonService';
import { ISalonRepository } from '../../repositories/interfaces/ISalonRepository';
import { IStaffRepository } from '../../repositories/interfaces/IStaffRepository';
import { IServiceRepository } from '../../repositories/interfaces/IServiceRepository';
import type { Salon, CreateSalonDto, UpdateSalonDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, NotFoundException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class SalonService extends BaseService implements ISalonService {
  constructor(
    private salonRepository: ISalonRepository,
    private staffRepository: IStaffRepository,
    private serviceRepository: IServiceRepository
  ) {
    super();
    this.logger = new Logger('SalonService');
  }

  async create(dto: CreateSalonDto): Promise<Salon> {
    // Validate business rules
    await this.validateSalon(dto);

    const salon = await this.salonRepository.create(dto);

    this.logger.info('Salon created successfully:', salon.id);
    return salon;
  }

  async findById(id: string): Promise<Salon> {
    return await this.salonRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Salon[]> {
    return await this.salonRepository.findAll(options);
  }

  async update(id: string, dto: UpdateSalonDto): Promise<Salon> {
    const salon = await this.salonRepository.findById(id);

    // Validate email uniqueness if being updated
    if (dto.email && dto.email !== salon.email) {
      const existing = await this.salonRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ValidationException('Email already in use');
      }
    }

    const updated = await this.salonRepository.update(id, dto);

    this.logger.info('Salon updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Check if salon has active staff
    const staff = await this.staffRepository.findBySalonId(id);
    if (staff.length > 0) {
      throw new ValidationException('Cannot delete salon with active staff members');
    }

    await this.salonRepository.delete(id);

    this.logger.info('Salon deleted successfully:', id);
  }

  async findByOwnerId(ownerId: string): Promise<Salon[]> {
    return await this.salonRepository.findByOwnerId(ownerId);
  }

  async findByEmail(email: string): Promise<Salon | null> {
    return await this.salonRepository.findByEmail(email);
  }

  async findByPhone(phone: string): Promise<Salon | null> {
    return await this.salonRepository.findByPhone(phone);
  }

  async getActiveSalons(): Promise<Salon[]> {
    return await this.salonRepository.findActiveSalons();
  }

  async getSalonStats(salonId: string): Promise<any> {
    const salon = await this.salonRepository.findById(salonId);
    const staff = await this.staffRepository.findBySalonId(salonId);
    const services = await this.serviceRepository.findBySalonId(salonId);

    return {
      salonId,
      name: salon.name,
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.isActive).length,
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      createdAt: salon.createdAt
    };
  }

  async updateBusinessHours(id: string, businessHours: any): Promise<Salon> {
    // Validate business hours format
    this.validateBusinessHours(businessHours);

    return await this.salonRepository.update(id, { businessHours });
  }

  private async validateSalon(dto: CreateSalonDto): Promise<void> {
    // Validate email uniqueness
    if (dto.email) {
      const existing = await this.salonRepository.findByEmail(dto.email);
      if (existing) {
        throw new ValidationException('Email already in use');
      }
    }

    // Validate phone uniqueness
    if (dto.phone) {
      const existing = await this.salonRepository.findByPhone(dto.phone);
      if (existing) {
        throw new ValidationException('Phone number already in use');
      }
    }

    // Validate business hours
    if (dto.businessHours) {
      this.validateBusinessHours(dto.businessHours);
    }
  }

  private validateBusinessHours(businessHours: any): void {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
      const hours = businessHours[day];
      if (!hours) {
        throw new ValidationException(`Business hours missing for ${day}`);
      }

      if (hours.open === 'closed' && hours.close === 'closed') {
        continue; // Closed day is valid
      }

      if (!hours.open || !hours.close) {
        throw new ValidationException(`Invalid business hours for ${day}`);
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(hours.open) || !timeRegex.test(hours.close)) {
        throw new ValidationException(`Invalid time format for ${day}. Use HH:MM format.`);
      }
    }
  }
}
