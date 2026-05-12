/**
 * Logger configuration
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  enableTimestamp: boolean;
  enableColors: boolean;
  format: 'json' | 'text';
  enableStackTrace: boolean;
  stackTraceLimit: number;
}

/**
 * Get logger configuration from environment variables
 */
export function getLoggerConfig(): LoggerConfig {
  return {
    level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH,
    maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760'), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '10'),
    enableTimestamp: process.env.LOG_ENABLE_TIMESTAMP !== 'false',
    enableColors: process.env.LOG_ENABLE_COLORS !== 'false',
    format: (process.env.LOG_FORMAT as 'json' | 'text') || 'json',
    enableStackTrace: process.env.LOG_ENABLE_STACK_TRACE === 'true',
    stackTraceLimit: parseInt(process.env.LOG_STACK_TRACE_LIMIT || '10')
  };
}

/**
 * Validate logger configuration
 */
export function validateLoggerConfig(config: LoggerConfig): boolean {
  const validLevels = Object.values(LogLevel);
  if (!validLevels.includes(config.level)) {
    throw new Error(`Invalid log level: ${config.level}`);
  }

  if (config.maxFileSize && config.maxFileSize < 1024) {
    throw new Error('Log max file size must be at least 1KB');
  }

  if (config.maxFiles && config.maxFiles < 1) {
    throw new Error('Log max files must be at least 1');
  }

  if (config.stackTraceLimit < 0) {
    throw new Error('Log stack trace limit must be non-negative');
  }

  return true;
}

/**
 * Logger configuration for different environments
 */
export const loggerConfigs = {
  development: {
    level: LogLevel.DEBUG,
    enableConsole: true,
    enableFile: false,
    enableTimestamp: true,
    enableColors: true,
    format: 'text' as const,
    enableStackTrace: true,
    stackTraceLimit: 10
  },
  staging: {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: true,
    filePath: './logs/staging.log',
    maxFileSize: 10485760, // 10MB
    maxFiles: 10,
    enableTimestamp: true,
    enableColors: false,
    format: 'json' as const,
    enableStackTrace: true,
    stackTraceLimit: 5
  },
  production: {
    level: LogLevel.WARN,
    enableConsole: false,
    enableFile: true,
    filePath: './logs/production.log',
    maxFileSize: 104857600, // 100MB
    maxFiles: 30,
    enableTimestamp: true,
    enableColors: false,
    format: 'json' as const,
    enableStackTrace: false,
    stackTraceLimit: 3
  }
};

/**
 * Get logger configuration for current environment
 */
export function getLoggerConfigForEnvironment(env?: string): LoggerConfig {
  const environment = env || process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'staging':
      return loggerConfigs.staging;
    case 'production':
      return loggerConfigs.production;
    default:
      return loggerConfigs.development;
  }
}

/**
 * Log level hierarchy
 */
export const LogLevelHierarchy: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4
};

/**
 * Check if log level should be logged
 */
export function shouldLog(currentLevel: LogLevel, messageLevel: LogLevel): boolean {
  return LogLevelHierarchy[messageLevel] >= LogLevelHierarchy[currentLevel];
}

/**
 * Log context keys
 */
export const LogContextKeys = {
  REQUEST_ID: 'requestId',
  USER_ID: 'userId',
  SALON_ID: 'salonId',
  ACTION: 'action',
  ENTITY: 'entity',
  ENTITY_ID: 'entityId',
  DURATION: 'duration',
  ERROR_CODE: 'errorCode',
  ERROR_MESSAGE: 'errorMessage',
  STACK_TRACE: 'stackTrace',
  TIMESTAMP: 'timestamp',
  LEVEL: 'level',
  MESSAGE: 'message',
  METHOD: 'method',
  PATH: 'path',
  STATUS_CODE: 'statusCode',
  USER_AGENT: 'userAgent',
  IP_ADDRESS: 'ipAddress'
} as const;

/**
 * Log message templates
 */
export const LogMessageTemplates = {
  REQUEST_RECEIVED: 'Request received: {method} {path}',
  REQUEST_COMPLETED: 'Request completed: {method} {path} - {statusCode} ({duration}ms)',
  REQUEST_FAILED: 'Request failed: {method} {path} - {statusCode} ({duration}ms)',
  DATABASE_QUERY: 'Database query: {query}',
  DATABASE_ERROR: 'Database error: {error}',
  CACHE_HIT: 'Cache hit: {key}',
  CACHE_MISS: 'Cache miss: {key}',
  CACHE_SET: 'Cache set: {key} (TTL: {ttl}s)',
  CACHE_DELETE: 'Cache delete: {key}',
  AUTH_SUCCESS: 'Authentication successful: {userId}',
  AUTH_FAILURE: 'Authentication failed: {reason}',
  AUTHORIZATION_DENIED: 'Authorization denied: {userId} - {action} on {entity}',
  VALIDATION_ERROR: 'Validation error: {errors}',
  BUSINESS_LOGIC_ERROR: 'Business logic error: {error}',
  EXTERNAL_API_CALL: 'External API call: {service} - {endpoint}',
  EXTERNAL_API_SUCCESS: 'External API success: {service} - {endpoint} ({duration}ms)',
  EXTERNAL_API_ERROR: 'External API error: {service} - {endpoint} - {error}',
  SCHEDULED_JOB_STARTED: 'Scheduled job started: {job}',
  SCHEDULED_JOB_COMPLETED: 'Scheduled job completed: {job} ({duration}ms)',
  SCHEDULED_JOB_FAILED: 'Scheduled job failed: {job} - {error}',
  WEBHOOK_RECEIVED: 'Webhook received: {event} - {source}',
  WEBHOOK_PROCESSED: 'Webhook processed: {event} - {source} ({duration}ms)',
  WEBHOOK_FAILED: 'Webhook failed: {event} - {source} - {error}'
} as const;

/**
 * Sensitive data patterns to redact
 */
export const SensitiveDataPatterns = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /credit[_-]?card/i,
  /ssn/i,
  /social[_-]?security/i,
  /pin/i,
  /cvv/i,
  /authorization/i
];

/**
 * Redact sensitive data from log message
 */
export function redactSensitiveData(message: string): string {
  let redacted = message;
  SensitiveDataPatterns.forEach(pattern => {
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return redacted;
}

/**
 * Log file rotation configuration
 */
export const LogRotationConfig = {
  enabled: true,
  interval: '1d', // Rotate daily
  maxSize: '100M',
  maxFiles: '30d', // Keep logs for 30 days
  compress: true,
  datePattern: 'YYYY-MM-DD'
} as const;

/**
 * Log transport configuration
 */
export const LogTransportConfig = {
  console: {
    enabled: true,
    level: LogLevel.INFO,
    format: 'text',
    colorize: true
  },
  file: {
    enabled: true,
    level: LogLevel.DEBUG,
    format: 'json',
    filename: './logs/app.log',
    maxsize: 10485760, // 10MB
    maxFiles: 10
  },
  remote: {
    enabled: false,
    url: process.env.LOG_REMOTE_URL,
    apiKey: process.env.LOG_REMOTE_API_KEY,
    level: LogLevel.ERROR
  }
} as const;
