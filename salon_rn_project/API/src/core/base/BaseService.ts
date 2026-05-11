import { IService, QueryOptions, UserContext } from '../interfaces/IService';
import { Logger } from '../utils/logger.util';
import { ValidationException } from '../exceptions/ValidationException';
import { NotFoundException } from '../exceptions/NotFoundException';

/**
 * Base Service Implementation
 * Provides common service functionality with business logic validation
 */
export abstract class BaseService<T, C, U> implements IService<T, C, U> {
  protected logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Create a new entity with business logic validation
   */
  async create(data: C): Promise<T> {
    try {
      this.logger.debug('Creating entity with data:', data);

      // Validate business rules
      await this.validateCreate(data);

      // Create the entity
      const entity = await this.createEntity(data);

      this.logger.info('Entity created successfully');
      return entity;
    } catch (error) {
      this.logger.error('Error creating entity:', error);
      throw error;
    }
  }

  /**
   * Find a single entity by its ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      this.logger.debug(`Finding entity by ID: ${id}`);
      const entity = await this.findEntityById(id);

      if (!entity) {
        this.logger.warn(`Entity not found: ${id}`);
        return null;
      }

      return entity;
    } catch (error) {
      this.logger.error(`Error finding entity by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find all entities with optional filtering and pagination
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    try {
      this.logger.debug('Finding all entities with options:', options);

      // Apply user context filtering if provided
      const filteredOptions = this.applyUserContext(options);

      const entities = await this.findAllEntities(filteredOptions);

      this.logger.debug(`Found ${entities.length} entities`);
      return entities;
    } catch (error) {
      this.logger.error('Error finding all entities:', error);
      throw error;
    }
  }

  /**
   * Update an existing entity with business logic validation
   */
  async update(id: string, data: U): Promise<T> {
    try {
      this.logger.debug(`Updating entity ${id} with data:`, data);

      // Check if entity exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundException(`Entity with ID ${id} not found`);
      }

      // Validate business rules
      await this.validateUpdate(id, data);

      // Update the entity
      const entity = await this.updateEntity(id, data);

      this.logger.info(`Entity ${id} updated successfully`);
      return entity;
    } catch (error) {
      this.logger.error(`Error updating entity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an entity by its ID with business logic validation
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.debug(`Deleting entity ${id}`);

      // Check if entity exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundException(`Entity with ID ${id} not found`);
      }

      // Validate business rules
      await this.validateDelete(id);

      // Delete the entity
      await this.deleteEntity(id);

      this.logger.info(`Entity ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting entity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validate business rules before creating an entity
   * Default implementation does nothing, override in concrete classes
   */
  async validateCreate(data: C): Promise<void> {
    // Override in concrete classes to add business validation
  }

  /**
   * Validate business rules before updating an entity
   * Default implementation does nothing, override in concrete classes
   */
  async validateUpdate(id: string, data: U): Promise<void> {
    // Override in concrete classes to add business validation
  }

  /**
   * Validate business rules before deleting an entity
   * Default implementation does nothing, override in concrete classes
   */
  async validateDelete(id: string): Promise<void> {
    // Override in concrete classes to add business validation
  }

  /**
   * Abstract method to create entity
   * Must be implemented by concrete service classes
   */
  protected abstract createEntity(data: C): Promise<T>;

  /**
   * Abstract method to find entity by ID
   * Must be implemented by concrete service classes
   */
  protected abstract findEntityById(id: string): Promise<T | null>;

  /**
   * Abstract method to find all entities
   * Must be implemented by concrete service classes
   */
  protected abstract findAllEntities(options?: QueryOptions): Promise<T[]>;

  /**
   * Abstract method to update entity
   * Must be implemented by concrete service classes
   */
  protected abstract updateEntity(id: string, data: U): Promise<T>;

  /**
   * Abstract method to delete entity
   * Must be implemented by concrete service classes
   */
  protected abstract deleteEntity(id: string): Promise<void>;

  /**
   * Apply user context filtering to query options
   * Default implementation returns options as-is
   * Override in concrete classes to add user-specific filtering
   */
  protected applyUserContext(options?: QueryOptions): QueryOptions | undefined {
    // Override in concrete classes to add user context filtering
    return options;
  }

  /**
   * Validate required fields
   * @throws ValidationException if any required field is missing
   */
  protected validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new ValidationException(
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }
  }

  /**
   * Validate field format
   * @throws ValidationException if field format is invalid
   */
  protected validateFieldFormat(data: any, field: string, regex: RegExp, errorMessage: string): void {
    const value = data[field];
    if (value && !regex.test(value)) {
      throw new ValidationException(errorMessage, { field, value });
    }
  }

  /**
   * Validate field length
   * @throws ValidationException if field length is invalid
   */
  protected validateFieldLength(data: any, field: string, min: number, max: number): void {
    const value = data[field];
    if (value && (value.length < min || value.length > max)) {
      throw new ValidationException(
        `Field ${field} must be between ${min} and ${max} characters`,
        { field, length: value.length, min, max }
      );
    }
  }

  /**
   * Validate field value is in allowed values
   * @throws ValidationException if field value is not allowed
   */
  protected validateAllowedValues(data: any, field: string, allowedValues: any[]): void {
    const value = data[field];
    if (value && !allowedValues.includes(value)) {
      throw new ValidationException(
        `Field ${field} must be one of: ${allowedValues.join(', ')}`,
        { field, value, allowedValues }
      );
    }
  }
}
