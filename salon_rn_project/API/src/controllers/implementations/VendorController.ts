import { BaseController } from '../../core/base/BaseController';
import { IVendorController } from '../interfaces/IVendorController';
import { IVendorRepository } from '../../repositories/interfaces/IVendorRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Vendor controller implementation
 */
export class VendorController extends BaseController implements IVendorController {
  constructor(
    private vendorRepository: IVendorRepository
  ) {
    super();
    this.logger = new Logger('VendorController');
  }

  async getVendor(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const vendor = await this.vendorRepository.findById(id);

      if (!vendor) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND_002',
            message: 'Vendor not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: vendor,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllVendors(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const vendors = await this.vendorRepository.findAll();

      res.status(HttpStatus.OK).json({
        success: true,
        data: vendors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: vendors.length,
          totalPages: Math.ceil(vendors.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createVendor(req: any, res: any): Promise<void> {
    try {
      const vendorData = req.body;

      const vendor = await this.vendorRepository.create(vendorData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: vendor,
        message: 'Vendor created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateVendor(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const vendorData = req.body;

      const vendor = await this.vendorRepository.update(id, vendorData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: vendor,
        message: 'Vendor updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteVendor(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.vendorRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Vendor deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getVendorsBySalon(req: any, res: any): Promise<void> {
    try {
      const { salonId } = req.params;

      const vendors = await this.vendorRepository.findBySalonId(salonId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: vendors,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
