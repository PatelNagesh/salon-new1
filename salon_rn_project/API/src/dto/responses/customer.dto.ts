/**
 * Customer response DTOs
 */

/**
 * Customer response DTO
 */
export interface CustomerResponseDto {
  id: string;
  salonId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blacklisted';
  createdAt: string;
  updatedAt: string;
}

/**
 * Customer summary response DTO
 */
export interface CustomerSummaryResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'blacklisted';
  avatar?: string;
}

/**
 * Customer detail response DTO
 */
export interface CustomerDetailResponseDto extends CustomerResponseDto {
  salonName?: string;
  fullName: string;
  bookingCount?: number;
  totalSpent?: number;
  lastVisitDate?: string;
  averageRating?: number;
}
