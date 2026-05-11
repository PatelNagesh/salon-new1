/**
 * Staff response DTOs
 */

/**
 * Staff response DTO
 */
export interface StaffResponseDto {
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
 * Staff summary response DTO
 */
export interface StaffSummaryResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specializations?: string[];
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  avatar?: string;
}

/**
 * Staff detail response DTO
 */
export interface StaffDetailResponseDto extends StaffResponseDto {
  salonName?: string;
  fullName: string;
  bookingCount?: number;
  totalEarnings?: number;
  averageRating?: number;
}
