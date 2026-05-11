/**
 * Inventory management service interface
 */
export interface IInventoryManagementService {
  /**
   * Get inventory items
   */
  getInventoryItems(salonId: string, filters?: any): Promise<any[]>;

  /**
   * Get inventory item details
   */
  getInventoryItem(inventoryId: string): Promise<any>;

  /**
   * Update inventory quantity
   */
  updateInventoryQuantity(inventoryId: string, quantity: number, reason?: string): Promise<any>;

  /**
   * Get low stock items
   */
  getLowStockItems(salonId: string): Promise<any[]>;

  /**
   * Get out of stock items
   */
  getOutOfStockItems(salonId: string): Promise<any[]>;

  /**
   * Restock inventory
   */
  restockInventory(inventoryId: string, quantity: number, notes?: string): Promise<any>;

  /**
   * Create inventory item
   */
  createInventoryItem(inventoryData: any): Promise<any>;

  /**
   * Update inventory item
   */
  updateInventoryItem(inventoryId: string, inventoryData: any): Promise<any>;

  /**
   * Delete inventory item
   */
  deleteInventoryItem(inventoryId: string): Promise<boolean>;

  /**
   * Get inventory history
   */
  getInventoryHistory(inventoryId: string, startDate?: string, endDate?: string): Promise<any[]>;

  /**
   * Get inventory statistics
   */
  getInventoryStatistics(salonId: string): Promise<any>;
}
