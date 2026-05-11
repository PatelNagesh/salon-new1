import { BaseController } from '../../core/base/BaseController';
import { ISalonController } from '../interfaces/ISalonController';
import { ISalonRepository } from '../../repositories/interfaces/ISalonRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Salon controller implementation
 */
export class SalonController extends BaseController implements ISalonController {
  constructor(
    private salonRepository: ISalonRepository
  ) {
    super();
    this.logger = new Logger('SalonController');
  }

  async getSalon(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const salon = await this.salonRepository.findById(id);

      if (!salon) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND_002',
            message: 'Salon not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: salon,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllSalons(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const salons = await this.salonRepository.findAll();

      res.status(HttpStatus.OK).json({
        success: true,
        data: salons,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: salons.length,
          totalPages: Math.ceil(salons.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createSalon(req: any, res: any): Promise<void> {
    try {
      const salonData = req.body;

      const salon = await this.salonRepository.create(salonData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: salon,
        message: 'Salon created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateSalon(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const salonData = req.body;

      const salon = await this.salonRepository.update(id, salonData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: salon,
        message: 'Salon updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteSalon(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.salonRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Salon deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getSalonsByCity(req: any, res: any): Promise<void> {
    try {
      const { city } = req.params;

      const salons = await this.salonRepository.findByCity(city);

      res.status(HttpStatus.OK).json({
        success: true,
        data: salons,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getSalonsByOwner(req: any, res: any): Promise<void> {
    try {
      const { ownerId } = req.params;

      const salons = await this.salonRepository.findByOwnerId(ownerId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: salons,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
