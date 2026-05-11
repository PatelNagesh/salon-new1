import { BaseController } from '../../core/base/BaseController';
import { IOrderController } from '../interfaces/IOrderController';
import { IOrderRepository } from '../../repositories/interfaces/IOrderRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Order controller implementation
 */
export class OrderController extends BaseController implements IOrderController {
  constructor(
    private orderRepository: IOrderRepository
  ) {
    super();
    this.logger = new Logger('OrderController');
  }

  async getOrder(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const order = await this.orderRepository.findById(id);

      if (!order) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND_002',
            message: 'Order not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: order,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllOrders(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const orders = await this.orderRepository.findAll();

      res.status(HttpStatus.OK).json({
        success: true,
        data: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: orders.length,
          totalPages: Math.ceil(orders.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createOrder(req: any, res: any): Promise<void> {
    try {
      const orderData = req.body;

      const order = await this.orderRepository.create(orderData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: order,
        message: 'Order created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateOrder(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const orderData = req.body;

      const order = await this.orderRepository.update(id, orderData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: order,
        message: 'Order updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteOrder(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.orderRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Order deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getOrdersBySalon(req: any, res: any): Promise<void> {
    try {
      const { salonId } = req.params;

      const orders = await this.orderRepository.findBySalonId(salonId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: orders,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getOrdersByVendor(req: any, res: any): Promise<void> {
    try {
      const { vendorId } = req.params;

      const orders = await this.orderRepository.findByVendorId(vendorId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: orders,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
