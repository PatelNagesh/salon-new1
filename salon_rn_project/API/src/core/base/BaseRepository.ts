import { IRepository, QueryOptions, CreateDto, UpdateDto } from '../interfaces/IRepository';
import { CacheService } from '../utils/cache.util';
import { Logger } from '../utils/logger.util';
import { NotFoundException } from '../exceptions/NotFoundException';

/**
 * Base Repository Implementation
 * Provides common repository functionality with caching and error handling
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected cacheService: CacheService;
  protected logger: Logger;
  protected cachePrefix: string;
  protected cacheTTL: number;

  constructor(cachePrefix: string, cacheTTL: number = 300) {
    this.cacheService = new CacheService();
    this.logger = new Logger(this.constructor.name);
    this.cachePrefix = cachePrefix;
    this.cacheTTL = cacheTTL;
  }

  /**
   * Find a single entity by its ID with caching
   */
  async findById(id: string): Promise<T | null> {
    try {
      const cacheKey = `${this.cachePrefix}:${id}`;
      const cached = await this.cacheService.get<T>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      this.logger.debug(`Cache miss for ${cacheKey}, querying database`);
      const entity = await this.findByIdFromDatabase(id);

      if (entity) {
        await this.cacheService.set(cacheKey, entity, this.cacheTTL);
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
      const cacheKey = this.buildListCacheKey(options);
      const cached = await this.cacheService.get<T[]>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      this.logger.debug(`Cache miss for ${cacheKey}, querying database`);
      const entities = await this.findAllFromDatabase(options);

      await this.cacheService.set(cacheKey, entities, this.cacheTTL);

      return entities;
    } catch (error) {
      this.logger.error('Error finding all entities:', error);
      throw error;
    }
  }

  /**
   * Create a new entity
   */
  async create(data: CreateDto): Promise<T> {
    try {
      this.logger.debug('Creating new entity with data:', data);
      const entity = await this.createInDatabase(data);

      // Invalidate relevant caches
      await this.invalidateListCache();

      return entity;
    } catch (error) {
      this.logger.error('Error creating entity:', error);
      throw error;
    }
  }

  /**
   * Update an existing entity
   */
  async update(id: string, data: UpdateDto): Promise<T> {
    try {
      this.logger.debug(`Updating entity ${id} with data:`, data);

      const exists = await this.exists(id);
      if (!exists) {
        throw new NotFoundException(`Entity with ID ${id} not found`);
      }

      const entity = await this.updateInDatabase(id, data);

      // Invalidate caches
      await this.cacheService.delete(`${this.cachePrefix}:${id}`);
      await this.invalidateListCache();

      return entity;
    } catch (error) {
      this.logger.error(`Error updating entity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an entity by its ID
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.debug(`Deleting entity ${id}`);

      const exists = await this.exists(id);
      if (!exists) {
        throw new NotFoundException(`Entity with ID ${id} not found`);
      }

      await this.deleteFromDatabase(id);

      // Invalidate caches
      await this.cacheService.delete(`${this.cachePrefix}:${id}`);
      await this.invalidateListCache();
    } catch (error) {
      this.logger.error(`Error deleting entity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if an entity exists by its ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const entity = await this.findById(id);
      return entity !== null;
    } catch (error) {
      this.logger.error(`Error checking existence of entity ${id}:`, error);
      return false;
    }
  }

  /**
   * Count entities with optional filtering
   */
  async count(options?: QueryOptions): Promise<number> {
    try {
      return await this.countFromDatabase(options);
    } catch (error) {
      this.logger.error('Error counting entities:', error);
      throw error;
    }
  }

  /**
   * Abstract method to find entity from database
   * Must be implemented by concrete repository classes
   */
  protected abstract findByIdFromDatabase(id: string): Promise<T | null>;

  /**
   * Abstract method to find all entities from database
   * Must be implemented by concrete repository classes
   */
  protected abstract findAllFromDatabase(options?: QueryOptions): Promise<T[]>;

  /**
   * Abstract method to create entity in database
   * Must be implemented by concrete repository classes
   */
  protected abstract createInDatabase(data: CreateDto): Promise<T>;

  /**
   * Abstract method to update entity in database
   * Must be implemented by concrete repository classes
   */
  protected abstract updateInDatabase(id: string, data: UpdateDto): Promise<T>;

  /**
   * Abstract method to delete entity from database
   * Must be implemented by concrete repository classes
   */
  protected abstract deleteFromDatabase(id: string): Promise<void>;

  /**
   * Abstract method to count entities in database
   * Must be implemented by concrete repository classes
   */
  protected abstract countFromDatabase(options?: QueryOptions): Promise<number>;

  /**
   * Build cache key for list queries
   */
  private buildListCacheKey(options?: QueryOptions): string {
    const key = `${this.cachePrefix}:list`;
    if (!options) return key;

    const params = new URLSearchParams();
    if (options.filters) {
      Object.entries(options.filters).forEach(([k, v]) => params.append(k, String(v)));
    }
    if (options.sort) {
      params.append('sort', options.sort.field);
      params.append('order', options.sort.order);
    }
    if (options.pagination) {
      params.append('page', String(options.pagination.page));
      params.append('limit', String(options.pagination.limit));
    }

    return params.toString() ? `${key}:${params.toString()}` : key;
  }

  /**
   * Invalidate all list caches
   */
  private async invalidateListCache(): Promise<void> {
    try {
      await this.cacheService.deletePattern(`${this.cachePrefix}:list*`);
    } catch (error) {
      this.logger.error('Error invalidating list cache:', error);
    }
  }
}
