import { BaseController } from '../../core/base/BaseController';
import { IServiceController } from '../interfaces/IServiceController';
import { IServiceRepository } from '../../repositories/interfaces/IServiceRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Service controller implementation
 */
export class ServiceController extends BaseController implements IServiceController {
  constructor(
    private serviceRepository: IServiceRepository
  ) {
    super();
    this.logger = new Logger('ServiceController');
  }

  async getService(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const service = await this.serviceRepository.findById(id);

      if (!service) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND_002',
            message: 'Service not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: service,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllServices(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const services = await this.serviceRepository.findAll();

      res.status(HttpStatus.OK).json({
        success: true,
        data: services,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: services.length,
          totalPages: Math.ceil(services.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createService(req: any, res: any): Promise<void> {
    try {
      const serviceData = req.body;

      const service = await this.serviceRepository.create(serviceData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: service,
        message: 'Service created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateService(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const serviceData = req.body;

      const service = await this.serviceRepository.update(id, serviceData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: service,
        message: 'Service updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteService(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.serviceRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Service deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getServicesBySalon(req: any, res: any): Promise<void> {
    try {
      const { salonId } = req.params;

      const services = await this.serviceRepository.findBySalonId(salonId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: services,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getServicesByCategory(req: any, res: any): Promise<void> {
    try {
      const { category } = req.params;

      const services = await this.serviceRepository.findByCategory(category);

      res.status(HttpStatus.OK).json({
        success: true,
        data: services,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
