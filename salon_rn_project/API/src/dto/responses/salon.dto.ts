/**
 * Salon response DTOs
 */

/**
 * Salon response DTO
 */
export interface SalonResponseDto {
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
 * Salon summary response DTO
 */
export interface SalonSummaryResponseDto {
  id: string;
  name: string;
  city: string;
  state: string;
  status: 'active' | 'inactive' | 'suspended';
  logo?: string;
}

/**
 * Salon detail response DTO
 */
export interface SalonDetailResponseDto extends SalonResponseDto {
  staffCount?: number;
  serviceCount?: number;
  customerCount?: number;
  bookingCount?: number;
}
