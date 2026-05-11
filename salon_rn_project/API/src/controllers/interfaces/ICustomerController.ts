import { IController } from '../../core/interfaces/IController';

/**
 * Customer controller interface
 */
export interface ICustomerController extends IController {
  /**
   * Get customer by ID
   */
  getCustomer(req: any, res: any): Promise<void>;

  /**
   * Get all customers
   */
  getAllCustomers(req: any, res: any): Promise<void>;

  /**
   * Create customer
   */
  createCustomer(req: any, res: any): Promise<void>;

  /**
   * Update customer
   */
  updateCustomer(req: any, res: any): Promise<void>;

  /**
   * Delete customer
   */
  deleteCustomer(req: any, res: any): Promise<void>;

  /**
   * Get customer booking history
   */
  getCustomerHistory(req: any, res: any): Promise<void>;

  /**
   * Get customer statistics
   */
  getCustomerStatistics(req: any, res: any): Promise<void>;
}
