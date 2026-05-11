/**
 * Base Service Interface
 * Defines the contract for all service implementations
 */
export interface IService<T, C, U> {
  /**
   * Create a new entity with business logic validation
   * @param data - The data to create the entity with
   * @returns Promise resolving to the created entity
   */
  create(data: C): Promise<T>;

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
   * Update an existing entity with business logic validation
   * @param id - The unique identifier of the entity to update
   * @param data - The data to update the entity with
   * @returns Promise resolving to the updated entity
   */
  update(id: string, data: U): Promise<T>;

  /**
   * Delete an entity by its ID with business logic validation
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving when the entity is deleted
   */
  delete(id: string): Promise<void>;

  /**
   * Validate business rules before creating an entity
   * @param data - The data to validate
   * @throws ValidationException if validation fails
   */
  validateCreate(data: C): Promise<void>;

  /**
   * Validate business rules before updating an entity
   * @param id - The unique identifier of the entity
   * @param data - The data to validate
   * @throws ValidationException if validation fails
   */
  validateUpdate(id: string, data: U): Promise<void>;

  /**
   * Validate business rules before deleting an entity
   * @param id - The unique identifier of the entity
   * @throws ValidationException if validation fails
   */
  validateDelete(id: string): Promise<void>;
}

/**
 * Query options for service operations
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
  /** User context for permission checks */
  userContext?: UserContext;
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
 * User context for permission checks
 */
export interface UserContext {
  /** User ID */
  userId: string;
  /** User role */
  role: string;
  /** Salon ID (if applicable) */
  salonId?: string;
  /** Additional permissions */
  permissions?: string[];
}
