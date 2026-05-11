/**
 * Vendor response DTOs
 */

/**
 * Vendor response DTO
 */
export interface VendorResponseDto {
  id: string;
  salonId: string;
  name: string;
  contactPerson: string;
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
 * Vendor summary response DTO
 */
export interface VendorSummaryResponseDto {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
}

/**
 * Vendor detail response DTO
 */
export interface VendorDetailResponseDto extends VendorResponseDto {
  salonName?: string;
  productCount?: number;
  orderCount?: number;
  totalOrders?: number;
}
