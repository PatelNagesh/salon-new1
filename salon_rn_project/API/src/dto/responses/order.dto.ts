/**
 * Order response DTOs
 */

/**
 * Order response DTO
 */
export interface OrderResponseDto {
  id: string;
  salonId: string;
  vendorId: string;
  orderNumber?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order summary response DTO
 */
export interface OrderSummaryResponseDto {
  id: string;
  orderNumber?: string;
  vendorName?: string;
  orderDate: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  totalAmount?: number;
}

/**
 * Order detail response DTO
 */
export interface OrderDetailResponseDto extends OrderResponseDto {
  salonName?: string;
  vendorName?: string;
  vendorContact?: string;
  items?: OrderItemResponseDto[];
  totalAmount?: number;
  isOverdue?: boolean;
  daysUntilDelivery?: number;
}

/**
 * Order item response DTO
 */
export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}
