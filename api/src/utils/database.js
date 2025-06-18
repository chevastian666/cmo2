/**
 * Database Connection Manager
 * By Cheva
 */

import { Sequelize } from 'sequelize';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Main database (trokor) connection
export const mainDb = new Sequelize({
  host: process.env.DB_MAIN_HOST || 'localhost',
  port: parseInt(process.env.DB_MAIN_PORT || '5432'),
  database: process.env.DB_MAIN_NAME || 'trokor',
  username: process.env.DB_MAIN_USER || 'postgres',
  password: process.env.DB_MAIN_PASSWORD || '',
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Auxiliary database (satoshi) connection
export const auxDb = new Sequelize({
  host: process.env.DB_AUX_HOST || 'localhost',
  port: parseInt(process.env.DB_AUX_PORT || '5432'),
  database: process.env.DB_AUX_NAME || 'satoshi',
  username: process.env.DB_AUX_USER || 'postgres',
  password: process.env.DB_AUX_PASSWORD || '',
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Test database connections
export async function connectDatabases() {
  try {
    // Test main database
    await mainDb.authenticate();
    logger.info('✅ Main database (trokor) connected successfully');

    // Test auxiliary database
    await auxDb.authenticate();
    logger.info('✅ Auxiliary database (satoshi) connected successfully');

    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Sync models (only in development)
export async function syncDatabases(force = false) {
  if (process.env.NODE_ENV === 'production' && force) {
    logger.warn('⚠️  Force sync not allowed in production');
    return;
  }

  try {
    await mainDb.sync({ force });
    logger.info('✅ Main database synced');

    await auxDb.sync({ force });
    logger.info('✅ Auxiliary database synced');
  } catch (error) {
    logger.error('❌ Database sync failed:', error);
    throw error;
  }
}

// Close database connections
export async function closeDatabases() {
  try {
    await mainDb.close();
    await auxDb.close();
    logger.info('✅ Database connections closed');
  } catch (error) {
    logger.error('❌ Error closing database connections:', error);
    throw error;
  }
}