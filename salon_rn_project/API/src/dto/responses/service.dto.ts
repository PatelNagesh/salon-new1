/**
 * Service response DTOs
 */

/**
 * Service response DTO
 */
export interface ServiceResponseDto {
  id: string;
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/**
 * Service summary response DTO
 */
export interface ServiceSummaryResponseDto {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
  status: 'active' | 'inactive' | 'archived';
}

/**
 * Service detail response DTO
 */
export interface ServiceDetailResponseDto extends ServiceResponseDto {
  salonName?: string;
  bookingCount?: number;
  averageRating?: number;
}
