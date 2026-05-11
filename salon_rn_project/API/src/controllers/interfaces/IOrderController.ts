import { IController } from '../../core/interfaces/IController';

/**
 * Order controller interface
 */
export interface IOrderController extends IController {
  /**
   * Get order by ID
   */
  getOrder(req: any, res: any): Promise<void>;

  /**
   * Get all orders
   */
  getAllOrders(req: any, res: any): Promise<void>;

  /**
   * Create order
   */
  createOrder(req: any, res: any): Promise<void>;

  /**
   * Update order
   */
  updateOrder(req: any, res: any): Promise<void>;

  /**
   * Delete order
   */
  deleteOrder(req: any, res: any): Promise<void>;

  /**
   * Get orders by salon
   */
  getOrdersBySalon(req: any, res: any): Promise<void>;

  /**
   * Get orders by vendor
   */
  getOrdersByVendor(req: any, res: any): Promise<void>;
}
