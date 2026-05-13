import { IController, Request, Response, ErrorResponse, PaginationInfo } from '../interfaces/IController';
import { Logger } from '../utils/logger.util';
import { ResponseFormatter } from '../utils/response.util';
import { BaseException } from '../exceptions/BaseException';

/**
 * Base Controller Implementation
 * Provides common controller functionality with request/response handling
 */
export abstract class BaseController<T = any, C = any, U = any> implements IController<T, C, U> {
  protected logger: Logger;
  protected responseFormatter: ResponseFormatter;

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.responseFormatter = new ResponseFormatter();
  }

  /**
   * Handle create request
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info(`Create request - Request ID: ${req.requestId}`);

      // Validate request body
      this.validateRequestBody(req.body);

      // Create entity
      const entity = await this.createEntity(req.body, req.user);

      // Send success response
      res.success(entity, 'Entity created successfully');
    } catch (error) {
      this.handleError(error, res, req.requestId);
    }
  }

  /**
   * Handle find by ID request
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      this.logger.info(`Find by ID request - ID: ${id}, Request ID: ${req.requestId}`);

      // Validate ID
      this.validateId(id);

      // Find entity
      const entity = await this.findEntityById(id, req.user);

      if (!entity) {
        res.error({
          code: 'NOT_FOUND',
          message: `Entity with ID ${id} not found`
        });
        return;
      }

      // Send success response
      res.success(entity);
    } catch (error) {
      this.handleError(error, res, req.requestId);
    }
  }

  /**
   * Handle find all request
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info(`Find all request - Request ID: ${req.requestId}`);

      // Parse query options
      const options = this.parseQueryOptions(req.query, req.user);

      // Find entities
      const entities = await this.findAllEntities(options);

      // Send success response
      res.success(entities);
    } catch (error) {
      this.handleError(error, res, req.requestId);
    }
  }

  /**
   * Handle update request
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      this.logger.info(`Update request - ID: ${id}, Request ID: ${req.requestId}`);

      // Validate ID and request body
      this.validateId(id);
      this.validateRequestBody(req.body);

      // Update entity
      const entity = await this.updateEntity(id, req.body, req.user);

      // Send success response
      res.success(entity, 'Entity updated successfully');
    } catch (error) {
      this.handleError(error, res, req.requestId);
    }
  }

  /**
   * Handle delete request
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      this.logger.info(`Delete request - ID: ${id}, Request ID: ${req.requestId}`);

      // Validate ID
      this.validateId(id);

      // Delete entity
      await this.deleteEntity(id, req.user);

      // Send success response
      res.success(null, 'Entity deleted successfully');
    } catch (error) {
      this.handleError(error, res, req.requestId);
    }
  }

  /**
   * Handle count request
   */
  async count(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info(`Count request - Request ID: ${req.requestId}`);

      // Parse query options
      const options = this.parseQueryOptions(req.query, req.user);

      // Count entities
      const count = await this.countEntities(options);

      // Send success response
      res.success({ count });
    } catch (error) {
      this.handleError(error, res, req.requestId);
    }
  }

  /**
   * Abstract method to create entity
   * Must be implemented by concrete controller classes
   */
  protected abstract createEntity(data: C, user?: any): Promise<T>;

  /**
   * Abstract method to find entity by ID
   * Must be implemented by concrete controller classes
   */
  protected abstract findEntityById(id: string, user?: any): Promise<T | null>;

  /**
   * Abstract method to find all entities
   * Must be implemented by concrete controller classes
   */
  protected abstract findAllEntities(options: any, user?: any): Promise<T[]>;

  /**
   * Abstract method to update entity
   * Must be implemented by concrete controller classes
   */
  protected abstract updateEntity(id: string, data: U, user?: any): Promise<T>;

  /**
   * Abstract method to delete entity
   * Must be implemented by concrete controller classes
   */
  protected abstract deleteEntity(id: string, user?: any): Promise<void>;

  /**
   * Abstract method to count entities
   * Must be implemented by concrete controller classes
   */
  protected abstract countEntities(options: any, user?: any): Promise<number>;

  /**
   * Parse query options from request query
   */
  protected parseQueryOptions(query: any, user?: any): any {
    const options: any = {};

    // Parse filters
    if (query.filters) {
      try {
        options.filters = typeof query.filters === 'string'
          ? JSON.parse(query.filters)
          : query.filters;
      } catch (error) {
        this.logger.warn('Invalid filters format, using empty filters');
        options.filters = {};
      }
    }

    // Parse sort
    if (query.sort) {
      options.sort = {
        field: query.sort,
        order: query.order || 'asc'
      };
    }

    // Parse pagination
    if (query.page || query.limit) {
      options.pagination = {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 10
      };
    }

    // Parse select fields
    if (query.select) {
      options.select = typeof query.select === 'string'
        ? query.select.split(',')
        : query.select;
    }

    // Parse relations
    if (query.relations) {
      options.relations = typeof query.relations === 'string'
        ? query.relations.split(',')
        : query.relations;
    }

    // Add user context
    if (user) {
      options.userContext = user;
    }

    return options;
  }

  /**
   * Validate request body
   * @throws ValidationException if validation fails
   */
  protected validateRequestBody(body: any): void {
    if (!body || Object.keys(body).length === 0) {
      throw new Error('Request body is required');
    }
  }

  /**
   * Validate ID parameter
   * @throws ValidationException if validation fails
   */
  protected validateId(id: string): void {
    if (!id) {
      throw new Error('ID parameter is required');
    }

    // Validate UUID format if needed
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid ID format');
    }
  }

  /**
   * Handle errors and send appropriate response
   */
  protected handleError(error: any, res: Response, requestId?: string): void {
    this.logger.error(`Error handling request - Request ID: ${requestId}`, error);

    if (error instanceof BaseException) {
      res.error({
        code: error.code,
        message: error.message,
        details: error.details
      });
    } else {
      res.error({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Extract user from request
   */
  protected getUser(req: Request): any {
    return req.user;
  }

  /**
   * Check if user has required permission
   */
  protected hasPermission(user: any, permission: string): boolean {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has required role
   */
  protected hasRole(user: any, role: string): boolean {
    if (!user || !user.role) {
      return false;
    }
    return user.role === role;
  }
}
