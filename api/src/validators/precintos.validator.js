/**
 * Precintos Validators
 * By Cheva
 */

import Joi from 'joi';

const precintoSchema = Joi.object({
  codigo: Joi.string().required().min(5).max(50),
  tipo: Joi.string().valid('electronico', 'mecanico').required(),
  metadata: Joi.object().optional()
});

const updatePrecintoSchema = Joi.object({
  estado: Joi.string().valid('activo', 'inactivo', 'en_transito', 'finalizado').optional(),
  ubicacion: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    timestamp: Joi.date().optional()
  }).optional(),
  bateria: Joi.number().min(0).max(100).optional(),
  temperatura: Joi.number().min(-50).max(100).optional(),
  humedad: Joi.number().min(0).max(100).optional()
});

export const validatePrecinto = (req, res, next) => {
  const { error } = precintoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }
  next();
};

export const validateUpdatePrecinto = (req, res, next) => {
  const { error } = updatePrecintoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }
  next();
};