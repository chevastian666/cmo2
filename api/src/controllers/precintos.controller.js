/**
 * Precintos Controller
 * By Cheva
 */

import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { mainDb } from '../utils/database.js';
import { webhookManager } from '../webhooks/webhookManager.js';
import { Op } from 'sequelize';

class PrecintosController {
  async getAll(req, res) {
    const {
      page = 1,
      limit = 20,
      estado,
      tipo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (search) {
      where.codigo = { [Op.iLike]: `%${search}%` };
    }

    // Get data from database
    const { count, rows } = await mainDb.models.Precinto.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder]]
    });

    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  }

  async getById(req, res) {
    const { id } = req.params;

    const precinto = await mainDb.models.Precinto.findByPk(id, {
      include: [
        { model: mainDb.models.PrecintoLocation, as: 'locations', limit: 10 },
        { model: mainDb.models.Transito, as: 'transitos' }
      ]
    });

    if (!precinto) {
      throw ApiError.notFound('Precinto not found');
    }

    res.json(precinto);
  }

  async create(req, res) {
    const { codigo, tipo, metadata } = req.body;

    // Check if codigo already exists
    const existing = await mainDb.models.Precinto.findOne({ where: { codigo } });
    if (existing) {
      throw ApiError.conflict('Precinto code already exists');
    }

    const precinto = await mainDb.models.Precinto.create({
      codigo,
      tipo,
      estado: 'inactivo',
      metadata,
      createdBy: req.user.id
    });

    logger.info(`Precinto created: ${precinto.id} by ${req.user.email}`);

    res.status(201).json(precinto);
  }

  async update(req, res) {
    const { id } = req.params;
    const updates = req.body;

    const precinto = await mainDb.models.Precinto.findByPk(id);
    if (!precinto) {
      throw ApiError.notFound('Precinto not found');
    }

    await precinto.update(updates);

    logger.info(`Precinto updated: ${id} by ${req.user.email}`);

    res.json(precinto);
  }

  async delete(req, res) {
    const { id } = req.params;

    const precinto = await mainDb.models.Precinto.findByPk(id);
    if (!precinto) {
      throw ApiError.notFound('Precinto not found');
    }

    // Check if precinto is in use
    const activeTransito = await mainDb.models.Transito.findOne({
      where: { 
        precintoId: id,
        estado: { [Op.notIn]: ['finalizado', 'cancelado'] }
      }
    });

    if (activeTransito) {
      throw ApiError.conflict('Cannot delete precinto with active transit');
    }

    await precinto.destroy();

    logger.info(`Precinto deleted: ${id} by ${req.user.email}`);

    res.status(204).send();
  }

  async updateLocation(req, res) {
    const { id } = req.params;
    const { lat, lng, speed, heading, altitude, accuracy } = req.body;

    const precinto = await mainDb.models.Precinto.findByPk(id);
    if (!precinto) {
      throw ApiError.notFound('Precinto not found');
    }

    // Create location record
    const location = await mainDb.models.PrecintoLocation.create({
      precintoId: id,
      lat,
      lng,
      speed,
      heading,
      altitude,
      accuracy,
      timestamp: new Date()
    });

    // Update precinto with latest location
    await precinto.update({
      ubicacion: { lat, lng, timestamp: new Date() },
      ultimaActualizacion: new Date()
    });

    // Check for geofence violations or route deviations
    await this.checkLocationAlerts(precinto, location);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`precinto:${id}`).emit('location:update', {
      precintoId: id,
      location: { lat, lng, speed, heading, timestamp: new Date() }
    });

    res.json({ message: 'Location updated', location });
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { bateria, temperatura, humedad, señal, eventos } = req.body;

    const precinto = await mainDb.models.Precinto.findByPk(id);
    if (!precinto) {
      throw ApiError.notFound('Precinto not found');
    }

    // Update status
    await precinto.update({
      bateria,
      temperatura,
      humedad,
      señal,
      ultimaActualizacion: new Date()
    });

    // Check for alerts
    if (bateria < 20) {
      await this.createAlert(precinto, 'bateria_baja', `Battery level critical: ${bateria}%`);
    }

    if (temperatura && (temperatura < -20 || temperatura > 60)) {
      await this.createAlert(precinto, 'temperatura_anomala', `Abnormal temperature: ${temperatura}°C`);
    }

    // Process events
    if (eventos && eventos.length > 0) {
      for (const evento of eventos) {
        await this.processEvent(precinto, evento);
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`precinto:${id}`).emit('status:update', {
      precintoId: id,
      status: { bateria, temperatura, humedad, señal }
    });

    res.json({ message: 'Status updated' });
  }

  async activate(req, res) {
    const { id } = req.params;

    const precinto = await mainDb.models.Precinto.findByPk(id);
    if (!precinto) {
      throw ApiError.notFound('Precinto not found');
    }

    if (precinto.estado !== 'inactivo') {
      throw ApiError.conflict('Precinto is already active');
    }

    await precinto.update({
      estado: 'activo',
      activatedAt: new Date(),
      activatedBy: req.user.id
    });

    logger.info(`Precinto activated: ${id} by ${req.user.email}`);

    res.json({ message: 'Precinto activated', precinto });
  }

  async deactivate(req, res) {
    const { id } = req.params;
    const { reason } = req.body;

    const precinto = await mainDb.models.Precinto.findByPk(id);
    if (!precinto) {
      throw ApiError.notFound('Precinto not found');
    }

    if (precinto.estado === 'en_transito') {
      throw ApiError.conflict('Cannot deactivate precinto in transit');
    }

    await precinto.update({
      estado: 'inactivo',
      deactivatedAt: new Date(),
      deactivatedBy: req.user.id,
      deactivationReason: reason
    });

    logger.info(`Precinto deactivated: ${id} by ${req.user.email}`);

    res.json({ message: 'Precinto deactivated', precinto });
  }

  async getHistory(req, res) {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const where = { precintoId: id };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const [locations, events, alerts] = await Promise.all([
      mainDb.models.PrecintoLocation.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit: 100
      }),
      mainDb.models.PrecintoEvent.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit: 100
      }),
      mainDb.models.Alerta.findAll({
        where: { precintoId: id, createdAt: where.createdAt || {} },
        order: [['createdAt', 'DESC']],
        limit: 50
      })
    ]);

    res.json({
      locations,
      events,
      alerts
    });
  }

  // Helper methods
  async checkLocationAlerts(precinto, location) {
    // Check if precinto is in transit
    const transito = await mainDb.models.Transito.findOne({
      where: {
        precintoId: precinto.id,
        estado: 'en_ruta'
      },
      include: [{ model: mainDb.models.Ruta, as: 'ruta' }]
    });

    if (!transito || !transito.ruta) return;

    // Check route deviation (simplified)
    const routePoints = transito.ruta.puntos || [];
    const maxDeviation = 5000; // 5km

    let isOnRoute = false;
    for (const point of routePoints) {
      const distance = this.calculateDistance(location.lat, location.lng, point.lat, point.lng);
      if (distance <= maxDeviation) {
        isOnRoute = true;
        break;
      }
    }

    if (!isOnRoute) {
      await this.createAlert(precinto, 'desvio_ruta', 'Vehicle deviated from planned route', {
        transitoId: transito.id,
        location: { lat: location.lat, lng: location.lng }
      });
    }
  }

  async createAlert(precinto, tipo, mensaje, metadata = {}) {
    const alerta = await mainDb.models.Alerta.create({
      tipo,
      severidad: this.getAlertSeverity(tipo),
      precintoId: precinto.id,
      mensaje,
      ubicacion: precinto.ubicacion,
      estado: 'activa',
      metadata
    });

    // Trigger webhook
    await webhookManager.trigger('alerta.created', {
      alerta: alerta.toJSON(),
      precinto: {
        id: precinto.id,
        codigo: precinto.codigo
      }
    });

    // Emit real-time notification
    const io = req.app.get('io');
    io.emit('alerta:new', alerta);

    logger.warn(`Alert created: ${tipo} for precinto ${precinto.codigo}`);
  }

  async processEvent(precinto, evento) {
    // Save event
    await mainDb.models.PrecintoEvent.create({
      precintoId: precinto.id,
      tipo: evento.tipo,
      data: evento.data,
      timestamp: evento.timestamp || new Date()
    });

    // Check for tamper events
    if (evento.tipo === 'tamper' || evento.tipo === 'apertura_no_autorizada') {
      await this.createAlert(precinto, 'apertura_no_autorizada', 'Unauthorized opening detected', evento.data);
      
      // Trigger critical webhook
      await webhookManager.trigger('precinto.tampered', {
        precinto: precinto.toJSON(),
        evento
      });
    }
  }

  getAlertSeverity(tipo) {
    const severityMap = {
      'apertura_no_autorizada': 'critica',
      'desvio_ruta': 'alta',
      'demora_excesiva': 'media',
      'bateria_baja': 'baja',
      'temperatura_anomala': 'media',
      'sin_señal': 'alta'
    };
    return severityMap[tipo] || 'media';
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

export const precintosController = new PrecintosController();