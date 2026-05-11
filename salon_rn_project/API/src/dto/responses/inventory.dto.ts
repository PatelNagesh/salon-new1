/**
 * Inventory response DTOs
 */

/**
 * Inventory response DTO
 */
export interface InventoryResponseDto {
  id: string;
  salonId: string;
  productId: string;
  quantity: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Inventory summary response DTO
 */
export interface InventorySummaryResponseDto {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  location?: string;
  isLowStock: boolean;
  isExpiringSoon: boolean;
}

/**
 * Inventory detail response DTO
 */
export interface InventoryDetailResponseDto extends InventoryResponseDto {
  salonName?: string;
  productName?: string;
  productSku?: string;
  productCategory?: string;
  minStockLevel?: number;
  isLowStock: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry?: number;
}
