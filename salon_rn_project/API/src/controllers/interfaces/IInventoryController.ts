import { IController } from '../../core/interfaces/IController';

/**
 * Inventory controller interface
 */
export interface IInventoryController extends IController {
  /**
   * Get inventory by ID
   */
  getInventory(req: any, res: any): Promise<void>;

  /**
   * Get all inventory
   */
  getAllInventory(req: any, res: any): Promise<void>;

  /**
   * Create inventory
   */
  createInventory(req: any, res: any): Promise<void>;

  /**
   * Update inventory
   */
  updateInventory(req: any, res: any): Promise<void>;

  /**
   * Delete inventory
   */
  deleteInventory(req: any, res: any): Promise<void>;

  /**
   * Get inventory by salon
   */
  getInventoryBySalon(req: any, res: any): Promise<void>;

  /**
   * Get low stock items
   */
  getLowStockItems(req: any, res: any): Promise<void>;

  /**
   * Restock inventory
   */
  restockInventory(req: any, res: any): Promise<void>;
}
