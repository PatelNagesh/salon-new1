import { IController } from '../../core/interfaces/IController';

/**
 * Service controller interface
 */
export interface IServiceController extends IController {
  /**
   * Get service by ID
   */
  getService(req: any, res: any): Promise<void>;

  /**
   * Get all services
   */
  getAllServices(req: any, res: any): Promise<void>;

  /**
   * Create service
   */
  createService(req: any, res: any): Promise<void>;

  /**
   * Update service
   */
  updateService(req: any, res: any): Promise<void>;

  /**
   * Delete service
   */
  deleteService(req: any, res: any): Promise<void>;

  /**
   * Get services by salon
   */
  getServicesBySalon(req: any, res: any): Promise<void>;

  /**
   * Get services by category
   */
  getServicesByCategory(req: any, res: any): Promise<void>;
}
