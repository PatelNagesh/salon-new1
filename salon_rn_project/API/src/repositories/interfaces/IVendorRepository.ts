import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Vendor entity interface
 */
export interface Vendor {
  id: string;
  salonId: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create vendor DTO
 */
export interface CreateVendorDto {
  salonId: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
}

/**
 * Update vendor DTO
 */
export interface UpdateVendorDto {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
}

/**
 * Vendor repository interface
 */
export interface IVendorRepository extends IRepository<Vendor, CreateVendorDto, UpdateVendorDto> {
  findBySalonId(salonId: string): Promise<Vendor[]>;
  findByEmail(email: string): Promise<Vendor | null>;
  existsByEmail(email: string): Promise<boolean>;
}
