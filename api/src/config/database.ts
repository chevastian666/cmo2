/**
 * Database Configuration
 * PostgreSQL connection setup with Sequelize
 * By Cheva
 */

import { Sequelize } from 'sequelize-typescript';
import { config } from './config';
import { logger } from '../utils/logger';
import path from 'path';

// Main database instance
export const mainDB = new Sequelize({
  host: config.database.main.host,
  port: config.database.main.port,
  database: config.database.main.name,
  username: config.database.main.user,
  password: config.database.main.password,
  dialect: config.database.main.dialect,
  logging: config.database.main.logging ? (msg) => logger.debug(msg) : false,
  pool: config.database.main.pool,
  models: [path.join(__dirname, '../models/main')],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
  }
});

// Auxiliary database instance
export const auxDB = new Sequelize({
  host: config.database.auxiliary.host,
  port: config.database.auxiliary.port,
  database: config.database.auxiliary.name,
  username: config.database.auxiliary.user,
  password: config.database.auxiliary.password,
  dialect: config.database.auxiliary.dialect,
  logging: config.database.auxiliary.logging ? (msg) => logger.debug(msg) : false,
  models: [path.join(__dirname, '../models/auxiliary')],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
  }
});

// Test database connections
export const connectDatabase = async (): Promise<void> => {
  try {
    // Test main database connection
    await mainDB.authenticate();
    logger.info('✅ Main database connection established successfully');
    
    // Sync models in development
    if (config.env === 'development') {
      await mainDB.sync({ alter: true });
      logger.info('📊 Main database models synchronized');
    }
    
    // Test auxiliary database connection
    await auxDB.authenticate();
    logger.info('✅ Auxiliary database connection established successfully');
    
    // Sync auxiliary models in development
    if (config.env === 'development') {
      await auxDB.sync({ alter: true });
      logger.info('📊 Auxiliary database models synchronized');
    }
  } catch (_error) {
    logger.error('❌ Database connection failed:', _error);
    throw error;
  }
};

// Close database connections
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    await mainDB.close();
    await auxDB.close();
    logger.info('Database connections closed');
  } catch (_error) {
    logger.error('Error closing database connections:', _error);
  }
};