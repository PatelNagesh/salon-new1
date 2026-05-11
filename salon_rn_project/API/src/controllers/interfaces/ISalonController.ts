import { IController } from '../../core/interfaces/IController';

/**
 * Salon controller interface
 */
export interface ISalonController extends IController {
  /**
   * Get salon by ID
   */
  getSalon(req: any, res: any): Promise<void>;

  /**
   * Get all salons
   */
  getAllSalons(req: any, res: any): Promise<void>;

  /**
   * Create salon
   */
  createSalon(req: any, res: any): Promise<void>;

  /**
   * Update salon
   */
  updateSalon(req: any, res: any): Promise<void>;

  /**
   * Delete salon
   */
  deleteSalon(req: any, res: any): Promise<void>;

  /**
   * Get salons by city
   */
  getSalonsByCity(req: any, res: any): Promise<void>;

  /**
   * Get salons by owner
   */
  getSalonsByOwner(req: any, res: any): Promise<void>;
}
