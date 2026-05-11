/**
 * Product response DTOs
 */

/**
 * Product response DTO
 */
export interface ProductResponseDto {
  id: string;
  salonId: string;
  vendorId?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  image?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

/**
 * Product summary response DTO
 */
export interface ProductSummaryResponseDto {
  id: string;
  name: string;
  sku?: string;
  category: string;
  sellingPrice: number;
  currentStock: number;
  status: 'active' | 'inactive' | 'discontinued';
  image?: string;
}

/**
 * Product detail response DTO
 */
export interface ProductDetailResponseDto extends ProductResponseDto {
  salonName?: string;
  vendorName?: string;
  isLowStock: boolean;
  orderCount?: number;
  totalSold?: number;
}
