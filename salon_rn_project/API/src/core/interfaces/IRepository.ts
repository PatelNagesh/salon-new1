/**
 * Base Repository Interface
 * Defines the contract for all repository implementations
 */
export interface IRepository<T> {
  /**
   * Find a single entity by its ID
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities with optional filtering and pagination
   * @param options - Query options for filtering, sorting, and pagination
   * @returns Promise resolving to an array of entities
   */
  findAll(options?: QueryOptions): Promise<T[]>;

  /**
   * Create a new entity
   * @param data - The data to create the entity with
   * @returns Promise resolving to the created entity
   */
  create(data: CreateDto): Promise<T>;

  /**
   * Update an existing entity
   * @param id - The unique identifier of the entity to update
   * @param data - The data to update the entity with
   * @returns Promise resolving to the updated entity
   */
  update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Delete an entity by its ID
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving when the entity is deleted
   */
  delete(id: string): Promise<void>;

  /**
   * Check if an entity exists by its ID
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to true if the entity exists, false otherwise
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count entities with optional filtering
   * @param options - Query options for filtering
   * @returns Promise resolving to the count of entities
   */
  count(options?: QueryOptions): Promise<number>;
}

/**
 * Query options for repository operations
 */
export interface QueryOptions {
  /** Filter conditions */
  filters?: Record<string, any>;
  /** Sort options */
  sort?: SortOptions;
  /** Pagination options */
  pagination?: PaginationOptions;
  /** Fields to select (null means all fields) */
  select?: string[];
  /** Relations to include */
  relations?: string[];
}

/**
 * Sort options
 */
export interface SortOptions {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  order: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
}

/**
 * Generic type for create DTO
 */
export type CreateDto = Record<string, any>;

/**
 * Generic type for update DTO
 */
export type UpdateDto = Record<string, any>;
