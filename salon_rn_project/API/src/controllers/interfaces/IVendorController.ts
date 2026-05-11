import { IController } from '../../core/interfaces/IController';

/**
 * Vendor controller interface
 */
export interface IVendorController extends IController {
  /**
   * Get vendor by ID
   */
  getVendor(req: any, res: any): Promise<void>;

  /**
   * Get all vendors
   */
  getAllVendors(req: any, res: any): Promise<void>;

  /**
   * Create vendor
   */
  createVendor(req: any, res: any): Promise<void>;

  /**
   * Update vendor
   */
  updateVendor(req: any, res: any): Promise<void>;

  /**
   * Delete vendor
   */
  deleteVendor(req: any, res: any): Promise<void>;

  /**
   * Get vendors by salon
   */
  getVendorsBySalon(req: any, res: any): Promise<void>;
}
