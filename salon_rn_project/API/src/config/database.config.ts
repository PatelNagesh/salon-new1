/**
 * Database configuration
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
  connectionTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
}

/**
 * Get database configuration from environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'salon_db',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
    maxLifetime: parseInt(process.env.DB_MAX_LIFETIME || '1800000')
  };
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(config: DatabaseConfig): boolean {
  if (!config.host) {
    throw new Error('Database host is required');
  }

  if (!config.database) {
    throw new Error('Database name is required');
  }

  if (!config.username) {
    throw new Error('Database username is required');
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error('Database port must be between 1 and 65535');
  }

  if (config.poolSize < 1) {
    throw new Error('Database pool size must be at least 1');
  }

  if (config.connectionTimeout < 0) {
    throw new Error('Database connection timeout must be non-negative');
  }

  if (config.idleTimeout < 0) {
    throw new Error('Database idle timeout must be non-negative');
  }

  if (config.maxLifetime < 0) {
    throw new Error('Database max lifetime must be non-negative');
  }

  return true;
}

/**
 * Get database connection string
 */
export function getDatabaseConnectionString(config?: DatabaseConfig): string {
  const dbConfig = config || getDatabaseConfig();

  return `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
}

/**
 * Database configuration for different environments
 */
export const databaseConfigs = {
  development: {
    host: 'localhost',
    port: 5432,
    database: 'salon_dev',
    username: 'postgres',
    password: 'postgres',
    ssl: false,
    poolSize: 5,
    connectionTimeout: 30000,
    idleTimeout: 10000,
    maxLifetime: 1800000
  },
  staging: {
    host: process.env.STAGING_DB_HOST || 'localhost',
    port: parseInt(process.env.STAGING_DB_PORT || '5432'),
    database: process.env.STAGING_DB_NAME || 'salon_staging',
    username: process.env.STAGING_DB_USERNAME || 'postgres',
    password: process.env.STAGING_DB_PASSWORD || '',
    ssl: true,
    poolSize: 10,
    connectionTimeout: 30000,
    idleTimeout: 10000,
    maxLifetime: 1800000
  },
  production: {
    host: process.env.PROD_DB_HOST || 'localhost',
    port: parseInt(process.env.PROD_DB_PORT || '5432'),
    database: process.env.PROD_DB_NAME || 'salon_prod',
    username: process.env.PROD_DB_USERNAME || 'postgres',
    password: process.env.PROD_DB_PASSWORD || '',
    ssl: true,
    poolSize: 20,
    connectionTimeout: 30000,
    idleTimeout: 10000,
    maxLifetime: 1800000
  }
};

/**
 * Get database configuration for current environment
 */
export function getDatabaseConfigForEnvironment(env?: string): DatabaseConfig {
  const environment = env || process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'staging':
      return databaseConfigs.staging;
    case 'production':
      return databaseConfigs.production;
    default:
      return databaseConfigs.development;
  }
}
