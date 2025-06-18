/**
 * Precinto Validators
 * Input validation for precinto endpoints
 * By Cheva
 */

import { body, param, _query, validationResult } from 'express-validator';
// import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';

// Validation middleware
const validate = (_req: Request, _res: Response, _next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', true);
  }
  next();
};

export const validatePrecinto = [
  body('codigo')
    .trim()
    .notEmpty()
    .withMessage('Codigo is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Codigo must be between 3 and 50 characters'),
  
  body('tipo')
    .isIn(['RFID', 'GPS', 'HIBRIDO'])
    .withMessage('Tipo must be RFID, GPS, or HIBRIDO'),
  
  validate
];

export const validatePrecintoUpdate = [
  param('id')
    .isUUID()
    .withMessage('Invalid precinto ID'),
  
  body('estado')
    .optional()
    .isIn(['creado', 'activado', 'en_transito', 'completado', 'desactivado', 'alarma'])
    .withMessage('Invalid estado'),
  
  body('bateria')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Bateria must be between 0 and 100'),
  
  body('temperatura')
    .optional()
    .isFloat()
    .withMessage('Temperatura must be a number'),
  
  validate
];

export const validateLocation = [
  param('id')
    .isUUID()
    .withMessage('Invalid precinto ID'),
  
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  
  validate
];