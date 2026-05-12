/**
 * Customer Service Interface
 * Defines the contract for customer-related business operations
 */

import type { Customer, CreateCustomerDto, UpdateCustomerDto, QueryOptions } from '../../core/types/common.types';

export interface ICustomerService {
  create(dto: CreateCustomerDto): Promise<Customer>;
  findById(id: string): Promise<Customer>;
  findAll(options?: QueryOptions): Promise<Customer[]>;
  update(id: string, dto: UpdateCustomerDto): Promise<Customer>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<Customer | null>;
  findByPhone(phone: string): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer | null>;
  getBookingHistory(customerId: string): Promise<any[]>;
  getActiveBookings(customerId: string): Promise<any[]>;
}
