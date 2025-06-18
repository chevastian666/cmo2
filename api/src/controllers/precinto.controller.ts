/**
 * Precinto Controller
 * Business logic for electronic seal management
 * By Cheva
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { precintoService } from '../services/precinto.service';
import { webhookService } from '../services/webhook.service';
import { logger } from '../utils/logger';

export const getAllPrecintos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      estado: req.query.estado as string,
      tipo: req.query.tipo as string,
      companyId: req.user?.companyId
    };

    const result = await precintoService.getAll(page, limit, filters);
    
    res.json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPrecintoById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const precinto = await precintoService.getById(id);
    
    if (!precinto) {
      throw new ApiError(404, 'Precinto not found');
    }
    
    // Check access permissions
    if (req.user?.companyId && precinto.companyId !== req.user.companyId) {
      throw new ApiError(403, 'Access denied');
    }
    
    res.json(precinto);
  } catch (error) {
    next(error);
  }
};

export const createPrecinto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const precintoData = {
      ...req.body,
      companyId: req.user?.companyId,
      createdBy: req.user?.id
    };
    
    const precinto = await precintoService.create(precintoData);
    
    // Send webhook notification
    await webhookService.trigger('precinto.created', {
      precinto,
      user: req.user,
      timestamp: new Date()
    });
    
    logger.info(`Precinto created: ${precinto.id} by user ${req.user?.id}`);
    
    res.status(201).json(precinto);
  } catch (error) {
    next(error);
  }
};

export const updatePrecinto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const precinto = await precintoService.getById(id);
    
    if (!precinto) {
      throw new ApiError(404, 'Precinto not found');
    }
    
    // Check access permissions
    if (req.user?.companyId && precinto.companyId !== req.user.companyId) {
      throw new ApiError(403, 'Access denied');
    }
    
    const updatedPrecinto = await precintoService.update(id, req.body);
    
    // Send webhook notification
    await webhookService.trigger('precinto.updated', {
      precinto: updatedPrecinto,
      changes: req.body,
      user: req.user,
      timestamp: new Date()
    });
    
    res.json(updatedPrecinto);
  } catch (error) {
    next(error);
  }
};

export const deletePrecinto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const precinto = await precintoService.getById(id);
    
    if (!precinto) {
      throw new ApiError(404, 'Precinto not found');
    }
    
    // Check if precinto is in use
    if (precinto.estado !== 'creado') {
      throw new ApiError(400, 'Cannot delete precinto in use');
    }
    
    await precintoService.delete(id);
    
    logger.info(`Precinto deleted: ${id} by user ${req.user?.id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const activatePrecinto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { transitId } = req.body;
    
    const precinto = await precintoService.activate(id, transitId, req.user?.id);
    
    // Send webhook notification
    await webhookService.trigger('precinto.activated', {
      precinto,
      transitId,
      user: req.user,
      timestamp: new Date()
    });
    
    res.json({
      message: 'Precinto activated successfully',
      precinto
    });
  } catch (error) {
    next(error);
  }
};

export const deactivatePrecinto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const precinto = await precintoService.deactivate(id, reason, req.user?.id);
    
    // Send webhook notification
    await webhookService.trigger('precinto.deactivated', {
      precinto,
      reason,
      user: req.user,
      timestamp: new Date()
    });
    
    res.json({
      message: 'Precinto deactivated successfully',
      precinto
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { lat, lng, address } = req.body;
    
    const location = await precintoService.updateLocation(id, {
      lat,
      lng,
      address,
      timestamp: new Date()
    });
    
    res.json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    next(error);
  }
};