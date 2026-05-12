/**
 * Salon Service Interface
 * Defines the contract for salon-related business operations
 */

import type { Salon, CreateSalonDto, UpdateSalonDto, QueryOptions } from '../../core/types/common.types';

export interface ISalonService {
  create(dto: CreateSalonDto): Promise<Salon>;
  findById(id: string): Promise<Salon>;
  findAll(options?: QueryOptions): Promise<Salon[]>;
  update(id: string, dto: UpdateSalonDto): Promise<Salon>;
  delete(id: string): Promise<void>;
  findByOwnerId(ownerId: string): Promise<Salon[]>;
  findByEmail(email: string): Promise<Salon | null>;
  findByPhone(phone: string): Promise<Salon | null>;
  getActiveSalons(): Promise<Salon[]>;
  getSalonStats(salonId: string): Promise<any>;
  updateBusinessHours(id: string, businessHours: any): Promise<Salon>;
}
