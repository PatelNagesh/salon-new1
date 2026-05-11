import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Customer entity interface
 */
export interface Customer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferences?: Record<string, any>;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

/**
 * Create customer DTO
 */
export interface CreateCustomerDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferences?: Record<string, any>;
  notes?: string;
}

/**
 * Update customer DTO
 */
export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferences?: Record<string, any>;
  notes?: string;
  status?: 'active' | 'inactive' | 'blocked';
}

/**
 * Customer repository interface
 */
export interface ICustomerRepository extends IRepository<Customer, CreateCustomerDto, UpdateCustomerDto> {
  findByUserId(userId: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByStatus(status: 'active' | 'inactive' | 'blocked'): Promise<Customer[]>;
  findByCity(city: string): Promise<Customer[]>;
  existsByEmail(email: string): Promise<boolean>;
}
