/**
 * Validation configuration
 */

export interface ValidationConfig {
  enableStrictValidation: boolean;
  enableSanitization: boolean;
  enableCustomValidators: boolean;
  enableAsyncValidation: boolean;
  validationTimeout: number;
  maxValidationErrors: number;
  enableDetailedErrors: boolean;
  enableLocalization: boolean;
  defaultLocale: string;
}

/**
 * Get validation configuration from environment variables
 */
export function getValidationConfig(): ValidationConfig {
  return {
    enableStrictValidation: process.env.VALIDATION_STRICT !== 'false',
    enableSanitization: process.env.VALIDATION_SANITIZE !== 'false',
    enableCustomValidators: process.env.VALIDATION_CUSTOM !== 'false',
    enableAsyncValidation: process.env.VALIDATION_ASYNC !== 'false',
    validationTimeout: parseInt(process.env.VALIDATION_TIMEOUT || '5000'),
    maxValidationErrors: parseInt(process.env.VALIDATION_MAX_ERRORS || '10'),
    enableDetailedErrors: process.env.VALIDATION_DETAILED_ERRORS !== 'false',
    enableLocalization: process.env.VALIDATION_LOCALIZATION === 'true',
    defaultLocale: process.env.VALIDATION_LOCALE || 'en'
  };
}

/**
 * Validate validation configuration
 */
export function validateValidationConfig(config: ValidationConfig): boolean {
  if (config.validationTimeout < 0) {
    throw new Error('Validation timeout must be non-negative');
  }

  if (config.maxValidationErrors < 1) {
    throw new Error('Max validation errors must be at least 1');
  }

  return true;
}

/**
 * Validation configuration for different environments
 */
export const validationConfigs = {
  development: {
    enableStrictValidation: false,
    enableSanitization: true,
    enableCustomValidators: true,
    enableAsyncValidation: true,
    validationTimeout: 10000,
    maxValidationErrors: 20,
    enableDetailedErrors: true,
    enableLocalization: false,
    defaultLocale: 'en'
  },
  staging: {
    enableStrictValidation: true,
    enableSanitization: true,
    enableCustomValidators: true,
    enableAsyncValidation: true,
    validationTimeout: 5000,
    maxValidationErrors: 10,
    enableDetailedErrors: true,
    enableLocalization: false,
    defaultLocale: 'en'
  },
  production: {
    enableStrictValidation: true,
    enableSanitization: true,
    enableCustomValidators: true,
    enableAsyncValidation: true,
    validationTimeout: 5000,
    maxValidationErrors: 5,
    enableDetailedErrors: false,
    enableLocalization: false,
    defaultLocale: 'en'
  }
};

/**
 * Get validation configuration for current environment
 */
export function getValidationConfigForEnvironment(env?: string): ValidationConfig {
  const environment = env || process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'staging':
      return validationConfigs.staging;
    case 'production':
      return validationConfigs.production;
    default:
      return validationConfigs.development;
  }
}

/**
 * Validation rules configuration
 */
export const ValidationRules = {
  // String validation rules
  STRING: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10000,
    TRIM_WHITESPACE: true,
    REMOVE_HTML: true,
    REMOVE_SCRIPTS: true
  },

  // Number validation rules
  NUMBER: {
    MIN_VALUE: -Number.MAX_VALUE,
    MAX_VALUE: Number.MAX_VALUE,
    PRECISION: 10,
    SCALE: 2
  },

  // Date validation rules
  DATE: {
    MIN_DATE: '1900-01-01',
    MAX_DATE: '2100-12-31',
    ALLOW_FUTURE: true,
    ALLOW_PAST: true
  },

  // Email validation rules
  EMAIL: {
    MAX_LENGTH: 255,
    ALLOW_PLUS: true,
    REQUIRE_TLD: true,
    BLOCKED_DOMAINS: ['tempmail.com', 'throwaway.com']
  },

  // Phone validation rules
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 20,
    ALLOW_FORMATS: ['US', 'International'],
    REQUIRE_COUNTRY_CODE: false
  },

  // URL validation rules
  URL: {
    MAX_LENGTH: 2048,
    ALLOW_HTTP: true,
    ALLOW_HTTPS: true,
    REQUIRE_PROTOCOL: true,
    BLOCKED_DOMAINS: []
  },

  // UUID validation rules
  UUID: {
    ALLOW_NIL: false,
    VERSIONS: [4, 7]
  },

  // Password validation rules
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
    BLOCKED_PASSWORDS: ['password', '12345678', 'qwerty']
  },

  // File validation rules
  FILE: {
    MAX_SIZE: 10485760, // 10MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    BLOCKED_EXTENSIONS: ['.exe', '.bat', '.sh', '.cmd']
  }
} as const;

/**
 * Validation error messages
 */
export const ValidationMessages = {
  REQUIRED: 'This field is required',
  INVALID_TYPE: 'Invalid type for this field',
  INVALID_FORMAT: 'Invalid format for this field',
  TOO_SHORT: 'Must be at least {min} characters',
  TOO_LONG: 'Must be at most {max} characters',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_URL: 'Invalid URL',
  INVALID_DATE: 'Invalid date format',
  INVALID_UUID: 'Invalid UUID format',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_RANGE: 'Value must be between {min} and {max}',
  INVALID_VALUE: 'Invalid value for this field',
  DUPLICATE: 'This value already exists',
  NOT_FOUND: 'This value does not exist',
  INVALID_STATUS: 'Invalid status value',
  INVALID_ROLE: 'Invalid role value',
  INVALID_ENUM: 'Invalid enum value',
  PATTERN_MISMATCH: 'Value does not match required pattern',
  CUSTOM_ERROR: 'Validation failed: {message}'
} as const;

/**
 * Validation context types
 */
export const ValidationContextTypes = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  QUERY: 'query',
  IMPORT: 'import',
  EXPORT: 'export'
} as const;

/**
 * Validation severity levels
 */
export const ValidationSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

/**
 * Sanitization rules
 */
export const SanitizationRules = {
  TRIM: true,
  NORMALIZE_WHITESPACE: true,
  REMOVE_HTML: true,
  REMOVE_SCRIPTS: true,
  ESCAPE_HTML: true,
  LOWERCASE_EMAIL: true,
  NORMALIZE_PHONE: true,
  REMOVE_NULL_BYTES: true,
  REMOVE_CONTROL_CHARS: true
} as const;

/**
 * Custom validators configuration
 */
export const CustomValidatorsConfig = {
  enabled: true,
  validators: {
    // Business logic validators
    bookingTimeSlot: {
      enabled: true,
      minDuration: 15,
      maxDuration: 480,
      bufferTime: 5
    },
    staffAvailability: {
      enabled: true,
      checkSchedule: true,
      checkExistingBookings: true
    },
    inventoryStock: {
      enabled: true,
      checkLowStock: true,
      checkOutOfStock: true
    },
    customerBlacklist: {
      enabled: true,
      checkStatus: true
    },
    salonStatus: {
      enabled: true,
      checkActive: true
    }
  }
} as const;

/**
 * Async validation configuration
 */
export const AsyncValidationConfig = {
  enabled: true,
  timeout: 5000,
  maxConcurrent: 10,
  retryOnFailure: false,
  cacheResults: true,
  cacheTTL: 300
} as const;

/**
 * Validation performance configuration
 */
export const ValidationPerformanceConfig = {
  enableCaching: true,
  cacheTTL: 300,
  enableMemoization: true,
  enableLazyValidation: false,
  maxValidationDepth: 10
} as const;
