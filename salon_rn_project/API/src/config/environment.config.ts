/**
 * Environment configuration
 */

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

export interface EnvironmentConfig {
  name: Environment;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  isTest: boolean;
  nodeEnv: string;
  port: number;
  host: string;
  apiUrl: string;
  frontendUrl: string;
  enableDebug: boolean;
  enableProfiling: boolean;
  enableMonitoring: boolean;
}

/**
 * Get current environment
 */
export function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV || 'development';

  switch (nodeEnv) {
    case 'staging':
      return Environment.STAGING;
    case 'production':
      return Environment.PRODUCTION;
    case 'test':
      return Environment.TEST;
    default:
      return Environment.DEVELOPMENT;
  }
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();

  return {
    name: env,
    isDevelopment: env === Environment.DEVELOPMENT,
    isStaging: env === Environment.STAGING,
    isProduction: env === Environment.PRODUCTION,
    isTest: env === Environment.TEST,
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8081',
    enableDebug: env === Environment.DEVELOPMENT,
    enableProfiling: env === Environment.DEVELOPMENT,
    enableMonitoring: env !== Environment.DEVELOPMENT
  };
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): boolean {
  if (config.port < 1 || config.port > 65535) {
    throw new Error('Port must be between 1 and 65535');
  }

  if (!config.host) {
    throw new Error('Host is required');
  }

  if (!config.apiUrl) {
    throw new Error('API URL is required');
  }

  if (!config.frontendUrl) {
    throw new Error('Frontend URL is required');
  }

  return true;
}

/**
 * Environment-specific configurations
 */
export const environmentConfigs: Record<Environment, EnvironmentConfig> = {
  [Environment.DEVELOPMENT]: {
    name: Environment.DEVELOPMENT,
    isDevelopment: true,
    isStaging: false,
    isProduction: false,
    isTest: false,
    nodeEnv: 'development',
    port: 3000,
    host: '0.0.0.0',
    apiUrl: 'http://localhost:3000',
    frontendUrl: 'http://localhost:8081',
    enableDebug: true,
    enableProfiling: true,
    enableMonitoring: false
  },
  [Environment.STAGING]: {
    name: Environment.STAGING,
    isDevelopment: false,
    isStaging: true,
    isProduction: false,
    isTest: false,
    nodeEnv: 'staging',
    port: 3000,
    host: '0.0.0.0',
    apiUrl: process.env.STAGING_API_URL || 'https://staging-api.example.com',
    frontendUrl: process.env.STAGING_FRONTEND_URL || 'https://staging.example.com',
    enableDebug: true,
    enableProfiling: false,
    enableMonitoring: true
  },
  [Environment.PRODUCTION]: {
    name: Environment.PRODUCTION,
    isDevelopment: false,
    isStaging: false,
    isProduction: true,
    isTest: false,
    nodeEnv: 'production',
    port: parseInt(process.env.PROD_PORT || '3000'),
    host: process.env.PROD_HOST || '0.0.0.0',
    apiUrl: process.env.PROD_API_URL || 'https://api.example.com',
    frontendUrl: process.env.PROD_FRONTEND_URL || 'https://example.com',
    enableDebug: false,
    enableProfiling: false,
    enableMonitoring: true
  },
  [Environment.TEST]: {
    name: Environment.TEST,
    isDevelopment: false,
    isStaging: false,
    isProduction: false,
    isTest: true,
    nodeEnv: 'test',
    port: 3001,
    host: '0.0.0.0',
    apiUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:8082',
    enableDebug: true,
    enableProfiling: false,
    enableMonitoring: false
  }
};

/**
 * Get environment configuration for specific environment
 */
export function getEnvironmentConfigForEnvironment(env: Environment): EnvironmentConfig {
  return environmentConfigs[env];
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return getCurrentEnvironment() === Environment.PRODUCTION;
}

/**
 * Check if current environment is development
 */
export function isDevelopment(): boolean {
  return getCurrentEnvironment() === Environment.DEVELOPMENT;
}

/**
 * Check if current environment is staging
 */
export function isStaging(): boolean {
  return getCurrentEnvironment() === Environment.STAGING;
}

/**
 * Check if current environment is test
 */
export function isTest(): boolean {
  return getCurrentEnvironment() === Environment.TEST;
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string {
  return process.env[key] || fallback || '';
}

/**
 * Get required environment variable
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

/**
 * Get number environment variable
 */
export function getNumberEnvVar(key: string, fallback: number = 0): number {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get array environment variable (comma-separated)
 */
export function getArrayEnvVar(key: string, fallback: string[] = []): string[] {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Validate all required environment variables
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Required environment variables for each environment
 */
export const RequiredEnvVars = {
  [Environment.DEVELOPMENT]: [],
  [Environment.STAGING]: [
    'STAGING_API_URL',
    'STAGING_FRONTEND_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ],
  [Environment.PRODUCTION]: [
    'PROD_API_URL',
    'PROD_FRONTEND_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  [Environment.TEST]: []
};

/**
 * Validate environment variables for current environment
 */
export function validateCurrentEnvironmentVars(): void {
  const env = getCurrentEnvironment();
  const requiredVars = RequiredEnvVars[env];
  validateRequiredEnvVars(requiredVars);
}

/**
 * Environment feature flags
 */
export const FeatureFlags = {
  [Environment.DEVELOPMENT]: {
    enableNewFeatures: true,
    enableExperimentalFeatures: true,
    enableBetaFeatures: true,
    enableDebugEndpoints: true,
    enableSwagger: true,
    enableGraphql: false
  },
  [Environment.STAGING]: {
    enableNewFeatures: true,
    enableExperimentalFeatures: false,
    enableBetaFeatures: true,
    enableDebugEndpoints: true,
    enableSwagger: true,
    enableGraphql: false
  },
  [Environment.PRODUCTION]: {
    enableNewFeatures: false,
    enableExperimentalFeatures: false,
    enableBetaFeatures: false,
    enableDebugEndpoints: false,
    enableSwagger: false,
    enableGraphql: false
  },
  [Environment.TEST]: {
    enableNewFeatures: true,
    enableExperimentalFeatures: true,
    enableBetaFeatures: true,
    enableDebugEndpoints: true,
    enableSwagger: true,
    enableGraphql: false
  }
};

/**
 * Get feature flags for current environment
 */
export function getFeatureFlags(): Record<string, boolean> {
  const env = getCurrentEnvironment();
  return FeatureFlags[env];
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  const flags = getFeatureFlags();
  return flags[feature] || false;
}
