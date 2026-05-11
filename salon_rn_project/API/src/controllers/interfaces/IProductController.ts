import { IController } from '../../core/interfaces/IController';

/**
 * Product controller interface
 */
export interface IProductController extends IController {
  /**
   * Get product by ID
   */
  getProduct(req: any, res: any): Promise<void>;

  /**
   * Get all products
   */
  getAllProducts(req: any, res: any): Promise<void>;

  /**
   * Create product
   */
  createProduct(req: any, res: any): Promise<void>;

  /**
   * Update product
   */
  updateProduct(req: any, res: any): Promise<void>;

  /**
   * Delete product
   */
  deleteProduct(req: any, res: any): Promise<void>;

  /**
   * Get products by vendor
   */
  getProductsByVendor(req: any, res: any): Promise<void>;

  /**
   * Get products by category
   */
  getProductsByCategory(req: any, res: any): Promise<void>;
}
