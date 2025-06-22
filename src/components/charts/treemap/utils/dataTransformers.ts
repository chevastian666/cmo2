/**
 * Treemap Data Transformers
 * Utilities to transform CMO data into treemap format
 * By Cheva
 */

import type { TreemapData, TreemapNode } from '../types';
import type { Precinto, Transito, Alerta } from '@/types';

/**
 * Transform precintos by company and status
 */
export const transformPrecintosByCompany = (
  precintos: Precinto[]
): TreemapData => {
  if (!precintos || precintos.length === 0) {
    return {
      name: 'Precintos',
      children: [{
        name: 'Sin datos',
        value: 1,
        color: '#6b7280'
      }]
    };
  }

  const companiesMap = new Map<string, Map<string, number>>();

  precintos.forEach(precinto => {
    const company = precinto.empresa || 'Sin Empresa';
    const status = precinto.estado;

    if (!companiesMap.has(company)) {
      companiesMap.set(company, new Map());
    }

    const statusMap = companiesMap.get(company)!;
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const children: TreemapNode[] = Array.from(companiesMap.entries()).map(
    ([company, statusMap]) => ({
      name: company,
      children: Array.from(statusMap.entries()).map(([status, count]) => ({
        name: status,
        value: count,
        color: getStatusColor(status)
      }))
    })
  );

  return {
    name: 'Precintos',
    children: children.length > 0 ? children : [{
      name: 'Sin datos',
      value: 1,
      color: '#6b7280'
    }]
  };
};

/**
 * Transform transits by route and status
 */
export const transformTransitsByRoute = (
  transitos: Transito[]
): TreemapData => {
  if (!transitos || transitos.length === 0) {
    return {
      name: 'Tránsitos',
      children: [{
        name: 'Sin datos',
        value: 1,
        color: '#6b7280'
      }]
    };
  }

  const routesMap = new Map<string, Map<string, number>>();

  transitos.forEach(transito => {
    const route = `${transito.origen} → ${transito.destino}`;
    const status = transito.estado;

    if (!routesMap.has(route)) {
      routesMap.set(route, new Map());
    }

    const statusMap = routesMap.get(route)!;
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const children: TreemapNode[] = Array.from(routesMap.entries()).map(
    ([route, statusMap]) => ({
      name: route,
      children: Array.from(statusMap.entries()).map(([status, count]) => ({
        name: status,
        value: count,
        color: getTransitStatusColor(status)
      }))
    })
  );

  return {
    name: 'Tránsitos',
    children: children.length > 0 ? children : [{
      name: 'Sin datos',
      value: 1,
      color: '#6b7280'
    }]
  };
};

/**
 * Transform alerts by type and severity
 */
export const transformAlertsBySeverity = (
  alertas: Alerta[]
): TreemapData => {
  if (!alertas || alertas.length === 0) {
    return {
      name: 'Alertas',
      children: [{
        name: 'Sin alertas',
        value: 1,
        color: '#10b981'
      }]
    };
  }

  const severityMap = new Map<string, Map<string, number>>();

  alertas.forEach(alerta => {
    const severity = alerta.tipo;
    const status = alerta.estado || 'activa';

    if (!severityMap.has(severity)) {
      severityMap.set(severity, new Map());
    }

    const statusMap = severityMap.get(severity)!;
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const children: TreemapNode[] = Array.from(severityMap.entries()).map(
    ([severity, statusMap]) => ({
      name: severity,
      children: Array.from(statusMap.entries()).map(([status, count]) => ({
        name: status,
        value: count,
        color: getAlertStatusColor(status)
      })),
      color: getSeverityColor(severity)
    })
  );

  return {
    name: 'Alertas',
    children: children.length > 0 ? children : [{
      name: 'Sin alertas',
      value: 1,
      color: '#10b981'
    }]
  };
};

/**
 * Transform data by time periods (daily, weekly, monthly)
 */
export const transformByTimePeriod = (
  data: unknown[],
  dateField: string,
  groupBy: 'day' | 'week' | 'month' = 'day'
): TreemapData => {
  const timeMap = new Map<string, Map<string, number>>();

  data.forEach(item => {
    const date = new Date(item[dateField]);
    let period = '';

    switch (groupBy) {
      case 'day':
        period = date.toLocaleDateString();
        break;
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        period = `Semana del ${weekStart.toLocaleDateString()}`;
        break;
      }
      case 'month':
        period = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        break;
    }

    const type = item.tipo || item.estado || 'otros';

    if (!timeMap.has(period)) {
      timeMap.set(period, new Map());
    }

    const typeMap = timeMap.get(period)!;
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });

  const children: TreemapNode[] = Array.from(timeMap.entries()).map(
    ([period, typeMap]) => ({
      name: period,
      children: Array.from(typeMap.entries()).map(([type, count]) => ({
        name: type,
        value: count
      }))
    })
  );

  return {
    name: 'Datos por Período',
    children
  };
};

/**
 * Create hierarchical data from flat structure
 */
export const createHierarchy = (
  data: unknown[],
  levels: string[]
): TreemapData => {
  const root: TreemapNode = {
    name: 'Root',
    children: []
  };

  data.forEach(item => {
    let currentLevel = root;

    levels.forEach((level, index) => {
      const value = item[level] || 'Sin Definir';
      
      let child = currentLevel.children?.find(c => c.name === value);
      
      if (!child) {
        child = {
          name: value,
          children: index < levels.length - 1 ? [] : undefined,
          value: index === levels.length - 1 ? 1 : undefined
        };
        
        if (!currentLevel.children) {
          currentLevel.children = [];
        }
        currentLevel.children.push(child);
      } else if (index === levels.length - 1 && child.value) {
        child.value += 1;
      }

      currentLevel = child;
    });
  });

  // Calculate values for parent nodes
  const calculateValues = (node: TreemapNode): number => {
    if (node.value) return node.value;
    
    if (node.children) {
      node.value = node.children.reduce((sum, child) => 
        sum + calculateValues(child), 0
      );
    }
    
    return node.value || 0;
  };

  calculateValues(root);

  return root as TreemapData;
};

// Helper functions for colors
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'creado': '#6b7280',
    'activado': '#3b82f6',
    'en_transito': '#f59e0b',
    'completado': '#10b981',
    'desactivado': '#ef4444',
    'alarma': '#dc2626'
  };
  return colors[status] || '#6b7280';
};

const getTransitStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pendiente': '#6b7280',
    'en_curso': '#3b82f6',
    'completado': '#10b981',
    'cancelado': '#ef4444',
    'retrasado': '#f59e0b'
  };
  return colors[status] || '#6b7280';
};

const getAlertStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'activa': '#ef4444',
    'reconocida': '#f59e0b',
    'resuelta': '#10b981',
    'descartada': '#6b7280'
  };
  return colors[status] || '#6b7280';
};

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    'critica': '#dc2626',
    'alta': '#ef4444',
    'media': '#f59e0b',
    'baja': '#3b82f6'
  };
  return colors[severity] || '#6b7280';
};