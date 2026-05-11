import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Salon entity interface
 */
export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  openingHours?: Record<string, any>;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

/**
 * Create salon DTO
 */
export interface CreateSalonDto {
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  openingHours?: Record<string, any>;
}

/**
 * Update salon DTO
 */
export interface UpdateSalonDto {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  openingHours?: Record<string, any>;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * Salon repository interface
 */
export interface ISalonRepository extends IRepository<Salon, CreateSalonDto, UpdateSalonDto> {
  findByOwnerId(ownerId: string): Promise<Salon[]>;
  findByCity(city: string): Promise<Salon[]>;
  findByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<Salon[]>;
  existsByName(name: string): Promise<boolean>;
}
