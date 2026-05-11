import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Staff entity interface
 */
export interface Staff {
  id: string;
  salonId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specializations?: string[];
  commissionRate?: number;
  hourlyRate?: number;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create staff DTO
 */
export interface CreateStaffDto {
  salonId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specializations?: string[];
  commissionRate?: number;
  hourlyRate?: number;
  hireDate: string;
}

/**
 * Update staff DTO
 */
export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specializations?: string[];
  commissionRate?: number;
  hourlyRate?: number;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

/**
 * Staff repository interface
 */
export interface IStaffRepository extends IRepository<Staff, CreateStaffDto, UpdateStaffDto> {
  findBySalonId(salonId: string): Promise<Staff[]>;
  findByUserId(userId: string): Promise<Staff | null>;
  findByStatus(status: 'active' | 'inactive' | 'on_leave' | 'terminated'): Promise<Staff[]>;
  findBySpecialization(specialization: string): Promise<Staff[]>;
  existsByEmail(email: string): Promise<boolean>;
}
