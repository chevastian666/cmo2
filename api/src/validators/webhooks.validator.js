/**
 * Webhooks Validators
 * By Cheva
 */

import Joi from 'joi';

const webhookSchema = Joi.object({
  url: Joi.string().uri().required(),
  events: Joi.array().items(
    Joi.string().valid(
      'alerta.created',
      'alerta.updated',
      'transito.started',
      'transito.completed',
      'transito.delayed',
      'precinto.tampered'
    )
  ).min(1).required(),
  headers: Joi.object().optional(),
  active: Joi.boolean().optional(),
  retryConfig: Joi.object({
    maxAttempts: Joi.number().min(1).max(10).optional(),
    backoffMultiplier: Joi.number().min(1).max(5).optional(),
    initialDelay: Joi.number().min(100).max(10000).optional()
  }).optional()
});

export const validateWebhook = (req, res, next) => {
  const { error } = webhookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }
  next();
};