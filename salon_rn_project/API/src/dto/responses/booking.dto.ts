/**
 * Booking response DTOs
 */

/**
 * Booking response DTO
 */
export interface BookingResponseDto {
  id: string;
  salonId: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  createdAt: string;
  updatedAt: string;
}

/**
 * Booking summary response DTO
 */
export interface BookingSummaryResponseDto {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
}

/**
 * Booking detail response DTO
 */
export interface BookingDetailResponseDto extends BookingResponseDto {
  salonName?: string;
  customerName?: string;
  staffName?: string;
  serviceName?: string;
  servicePrice?: number;
  serviceDuration?: number;
}
