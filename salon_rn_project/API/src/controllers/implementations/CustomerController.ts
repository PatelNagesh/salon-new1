import { BaseController } from '../../core/base/BaseController';
import { ICustomerController } from '../interfaces/ICustomerController';
import { ICustomerManagementService } from '../../services/interfaces/ICustomerManagementService';
import { ICustomerRepository } from '../../repositories/interfaces/ICustomerRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Customer controller implementation
 */
export class CustomerController extends BaseController implements ICustomerController {
  constructor(
    private customerManagementService: ICustomerManagementService,
    private customerRepository: ICustomerRepository
  ) {
    super();
    this.logger = new Logger('CustomerController');
  }

  async getCustomer(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const customer = await this.customerManagementService.getCustomerProfile(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllCustomers(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const customers = await this.customerRepository.findAll();

      res.status(HttpStatus.OK).json({
        success: true,
        data: customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: customers.length,
          totalPages: Math.ceil(customers.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createCustomer(req: any, res: any): Promise<void> {
    try {
      const customerData = req.body;

      const customer = await this.customerRepository.create(customerData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: customer,
        message: 'Customer created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateCustomer(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const customerData = req.body;

      const customer = await this.customerManagementService.updateCustomerProfile(id, customerData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: customer,
        message: 'Customer updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteCustomer(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.customerRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Customer deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getCustomerHistory(req: any, res: any): Promise<void> {
    try {
      const { customerId } = req.params;
      const { status, startDate, endDate } = req.query;

      const history = await this.customerManagementService.getCustomerBookingHistory(customerId, {
        status,
        startDate,
        endDate
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: history,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getCustomerStatistics(req: any, res: any): Promise<void> {
    try {
      const { customerId } = req.params;

      const statistics = await this.customerManagementService.getCustomerStatistics(customerId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: statistics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
