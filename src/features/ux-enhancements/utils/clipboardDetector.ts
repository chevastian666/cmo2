import type { ClipboardContentType } from '../types';

interface DetectionResult {
  type: ClipboardContentType;
  confidence: number;
  extractedData?: Record<string, any>;
}

// Regex patterns for different content types
const PATTERNS = {
  precinto: {
    id: /(?:PE|PRECINTO|ID)[:\s-]*([A-Z0-9]{8,12})/i,
    status: /(?:ESTADO|STATUS)[:\s-]*(ACTIVO|INACTIVO|VIOLADO|EN_TRANSITO)/i,
    location: /(?:LAT|LATITUDE)[:\s-]*([-+]?\d+\.?\d*)[,\s]*(?:LON|LONGITUDE)[:\s-]*([-+]?\d+\.?\d*)/i,
    timestamp: /(?:FECHA|DATE|TIMESTAMP)[:\s-]*(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})/i
  },
  alerta: {
    id: /(?:ALERTA|ALERT)[:\s-]*#?(\d+)/i,
    severity: /(?:SEVERIDAD|SEVERITY)[:\s-]*(CRITICA|ALTA|MEDIA|BAJA)/i,
    type: /(?:TIPO|TYPE)[:\s-]*(VIOLACION|DESCONEXION|BATERIA_BAJA|TEMPERATURA)/i
  },
  reporte: {
    number: /(?:REPORTE|REPORT)[:\s-]*#?(\d+)/i,
    date: /(?:FECHA|DATE)[:\s-]*(\d{4}-\d{2}-\d{2})/i,
    operator: /(?:OPERADOR|OPERATOR)[:\s-]*([A-Za-z\s]+)/i
  }
};

export function detectClipboardContent(content: string): DetectionResult {
  // Normalize content
  const normalizedContent = content.trim().toUpperCase();
  
  // Check for precinto data
  if (
    PATTERNS.precinto.id.test(content) ||
    (normalizedContent.includes('PRECINTO') && normalizedContent.includes('PE'))
  ) {
    const idMatch = content.match(PATTERNS.precinto.id);
    const statusMatch = content.match(PATTERNS.precinto.status);
    const locationMatch = content.match(PATTERNS.precinto.location);
    const timestampMatch = content.match(PATTERNS.precinto.timestamp);
    
    return {
      type: 'precinto',
      confidence: 0.9,
      extractedData: {
        id: idMatch?.[1],
        status: statusMatch?.[1],
        latitude: locationMatch?.[1],
        longitude: locationMatch?.[2],
        timestamp: timestampMatch?.[1]
      }
    };
  }
  
  // Check for alert data
  if (
    PATTERNS.alerta.id.test(content) ||
    normalizedContent.includes('ALERTA') ||
    normalizedContent.includes('ALERT')
  ) {
    const idMatch = content.match(PATTERNS.alerta.id);
    const severityMatch = content.match(PATTERNS.alerta.severity);
    const typeMatch = content.match(PATTERNS.alerta.type);
    
    return {
      type: 'alerta',
      confidence: 0.85,
      extractedData: {
        id: idMatch?.[1],
        severity: severityMatch?.[1],
        type: typeMatch?.[1]
      }
    };
  }
  
  // Check for report data
  if (
    PATTERNS.reporte.number.test(content) ||
    normalizedContent.includes('REPORTE') ||
    normalizedContent.includes('REPORT')
  ) {
    const numberMatch = content.match(PATTERNS.reporte.number);
    const dateMatch = content.match(PATTERNS.reporte.date);
    const operatorMatch = content.match(PATTERNS.reporte.operator);
    
    return {
      type: 'reporte',
      confidence: 0.8,
      extractedData: {
        number: numberMatch?>[1],
        date: dateMatch?.[1],
        operator: operatorMatch?.[1]
      }
    };
  }
  
  // Check for structured data (JSON, CSV, etc.)
  if (content.includes('{') || content.includes('[') || content.includes(',')) {
    try {
      JSON.parse(content);
      return { type: 'datos', confidence: 0.95 };
    } catch {
      // Check if it's CSV-like
      const lines = content.split('\n');
      if (lines.length > 1 && lines[0].includes(',')) {
        return { type: 'datos', confidence: 0.7 };
      }
    }
  }
  
  // Default to custom
  return {
    type: 'custom',
    confidence: 0.5
  };
}

export function extractPrecintoData(content: string): Record<string, any> {
  const result = detectClipboardContent(content);
  
  if (result.type === 'precinto' && result.extractedData) {
    return {
      id: result.extractedData.id || 'Unknown',
      status: result.extractedData.status || 'Unknown',
      location: result.extractedData.latitude && result.extractedData.longitude
        ? {
            lat: parseFloat(result.extractedData.latitude),
            lng: parseFloat(result.extractedData.longitude)
          }
        : null,
      timestamp: result.extractedData.timestamp || new Date().toISOString()
    };
  }
  
  return {};
}

export function generateSmartPaste(
  content: string,
  targetContext: 'form' | 'search' | 'report' | 'message'
): string {
  const detection = detectClipboardContent(content);
  const data = detection.extractedData || {};
  
  switch (targetContext) {
    case 'form':
      // Format for form fields
      if (detection.type === 'precinto') {
        return data.id || content;
      }
      return content;
      
    case 'search':
      // Extract searchable identifiers
      if (detection.type === 'precinto' && data.id) {
        return data.id;
      }
      if (detection.type === 'alerta' && data.id) {
        return `ALERT-${data.id}`;
      }
      return content;
      
    case 'report':
      // Format for reports
      if (detection.type === 'precinto') {
        return `Precinto ${data.id || 'N/A'} - Estado: ${data.status || 'Unknown'}${
          data.latitude ? ` - Ubicación: ${data.latitude}, ${data.longitude}` : ''
        }`;
      }
      if (detection.type === 'alerta') {
        return `Alerta #${data.id || 'N/A'} - Severidad: ${data.severity || 'Unknown'} - Tipo: ${data.type || 'Unknown'}`;
      }
      return content;
      
    case 'message':
      // Format for messages/chat
      if (detection.type === 'precinto') {
        return `Información del precinto ${data.id || 'N/A'}:\n` +
          `Estado: ${data.status || 'Unknown'}\n` +
          (data.latitude ? `Ubicación: ${data.latitude}, ${data.longitude}\n` : '') +
          (data.timestamp ? `Última actualización: ${data.timestamp}` : '');
      }
      return content;
      
    default:
      return content;
  }
}