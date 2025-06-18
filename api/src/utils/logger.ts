/**
 * Logger Configuration
 * Winston logger setup for the API
 * By Cheva
 */

import winston from 'winston';
import path from 'path';
import { config } from '../config/config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Custom format for file output
const fileFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (stack) {
    msg += `\n${stack}`;
  }
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  return msg;
});

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      )
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), config.logging.file),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    }),
    // File transport for errors only
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs/error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    })
  ]
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}