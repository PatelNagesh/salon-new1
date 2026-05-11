import { BaseController } from '../../core/base/BaseController';
import { IProductController } from '../interfaces/IProductController';
import { IProductRepository } from '../../repositories/interfaces/IProductRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Product controller implementation
 */
export class ProductController extends BaseController implements IProductController {
  constructor(
    private productRepository: IProductRepository
  ) {
    super();
    this.logger = new Logger('ProductController');
  }

  async getProduct(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const product = await this.productRepository.findById(id);

      if (!product) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND_002',
            message: 'Product not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: product,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllProducts(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10, category, vendorId } = req.query;

      let products = await this.productRepository.findAll();

      // Filter by category if provided
      if (category) {
        products = products.filter(p => p.category === category);
      }

      // Filter by vendor if provided
      if (vendorId) {
        products = products.filter(p => p.vendorId === vendorId);
      }

      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedProducts = products.slice(startIndex, endIndex);

      res.status(HttpStatus.OK).json({
        success: true,
        data: paginatedProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: products.length,
          totalPages: Math.ceil(products.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createProduct(req: any, res: any): Promise<void> {
    try {
      const productData = req.body;

      const product = await this.productRepository.create(productData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: product,
        message: 'Product created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateProduct(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const productData = req.body;

      const product = await this.productRepository.update(id, productData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: product,
        message: 'Product updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteProduct(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.productRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Product deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getProductsByVendor(req: any, res: any): Promise<void> {
    try {
      const { vendorId } = req.params;

      const products = await this.productRepository.findByVendorId(vendorId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: products,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getProductsByCategory(req: any, res: any): Promise<void> {
    try {
      const { category } = req.params;

      const products = await this.productRepository.findByCategory(category);

      res.status(HttpStatus.OK).json({
        success: true,
        data: products,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async searchProducts(req: any, res: any): Promise<void> {
    try {
      const { query } = req.query;

      if (!query) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'Search query is required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const products = await this.productRepository.search(query);

      res.status(HttpStatus.OK).json({
        success: true,
        data: products,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
