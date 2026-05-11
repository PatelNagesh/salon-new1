import { BaseController } from '../../core/base/BaseController';
import { IInventoryController } from '../interfaces/IInventoryController';
import { IInventoryManagementService } from '../../services/interfaces/IInventoryManagementService';
import { IInventoryRepository } from '../../repositories/interfaces/IInventoryRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Inventory controller implementation
 */
export class InventoryController extends BaseController implements IInventoryController {
  constructor(
    private inventoryManagementService: IInventoryManagementService,
    private inventoryRepository: IInventoryRepository
  ) {
    super();
    this.logger = new Logger('InventoryController');
  }

  async getInventory(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const inventory = await this.inventoryManagementService.getInventoryItem(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: inventory,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllInventory(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const inventory = await this.inventoryRepository.findAll();

      res.status(HttpStatus.OK).json({
        success: true,
        data: inventory,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: inventory.length,
          totalPages: Math.ceil(inventory.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createInventory(req: any, res: any): Promise<void> {
    try {
      const inventoryData = req.body;

      const inventory = await this.inventoryManagementService.createInventoryItem(inventoryData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: inventory,
        message: 'Inventory created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateInventory(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const inventoryData = req.body;

      const inventory = await this.inventoryManagementService.updateInventoryItem(id, inventoryData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: inventory,
        message: 'Inventory updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteInventory(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.inventoryManagementService.deleteInventoryItem(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Inventory deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getInventoryBySalon(req: any, res: any): Promise<void> {
    try {
      const { salonId } = req.params;
      const { status, category } = req.query;

      const inventory = await this.inventoryManagementService.getInventoryItems(salonId, {
        status,
        category
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: inventory,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getLowStockItems(req: any, res: any): Promise<void> {
    try {
      const { salonId } = req.params;

      const items = await this.inventoryManagementService.getLowStockItems(salonId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: items,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async restockInventory(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity, notes } = req.body;

      const inventory = await this.inventoryManagementService.restockInventory(id, quantity, notes);

      res.status(HttpStatus.OK).json({
        success: true,
        data: inventory,
        message: 'Inventory restocked successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
