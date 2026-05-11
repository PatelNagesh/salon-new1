/**
 * Base Controller Interface
 * Defines the contract for all controller implementations
 */
export interface IController<T, C, U> {
  /**
   * Handle create request
   * @param req - The request object
   * @param res - The response object
   * @returns Promise resolving when the request is handled
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Handle find by ID request
   * @param req - The request object
   * @param res - The response object
   * @returns Promise resolving when the request is handled
   */
  findById(req: Request, res: Response): Promise<void>;

  /**
   * Handle find all request
   * @param req - The request object
   * @param res - The response object
   * @returns Promise resolving when the request is handled
   */
  findAll(req: Request, res: Response): Promise<void>;

  /**
   * Handle update request
   * @param req - The request object
   * @param res - The response object
   * @returns Promise resolving when the request is handled
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Handle delete request
   * @param req - The request object
   * @param res - The response object
   * @returns Promise resolving when the request is handled
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Handle count request
   * @param req - The request object
   * @param res - The response object
   * @returns Promise resolving when the request is handled
   */
  count(req: Request, res: Response): Promise<void>;
}

/**
 * Request object interface
 */
export interface Request {
  /** Request body */
  body: any;
  /** Request parameters */
  params: Record<string, string>;
  /** Query parameters */
  query: Record<string, any>;
  /** Request headers */
  headers: Record<string, string>;
  /** User context from authentication */
  user?: UserContext;
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Response object interface
 */
export interface Response {
  /** Send a success response */
  success(data: any, message?: string): void;
  /** Send an error response */
  error(error: ErrorResponse): void;
  /** Send a paginated response */
  paginated(data: any[], pagination: PaginationInfo): void;
  /** Set response status code */
  status(code: number): Response;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: any;
}

/**
 * Pagination info interface
 */
export interface PaginationInfo {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * User context interface
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
