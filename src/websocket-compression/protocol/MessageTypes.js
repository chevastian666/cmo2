/**
 * Binary Protocol Message Types for WebSocket Compression
 * Optimized for minimal bandwidth usage
 */

// Message type identifiers (1 byte)
export const MESSAGE_TYPES = {
  // Data messages
  FULL_STATE: 0x01,      // Full state snapshot
  DELTA_UPDATE: 0x02,    // Differential update
  BATCH_DELTA: 0x03,     // Multiple deltas in one message
  
  // Control messages
  HEARTBEAT: 0x10,       // Keep-alive
  ACK: 0x11,             // Acknowledgment
  RESYNC_REQUEST: 0x12,  // Client requests full state
  
  // Connection management
  HELLO: 0x20,           // Initial handshake
  SUBSCRIBE: 0x21,       // Subscribe to precinto updates
  UNSUBSCRIBE: 0x22,     // Unsubscribe from updates
  
  // Error messages
  ERROR: 0xF0,           // General error
  COMPRESSION_ERROR: 0xF1 // Compression/decompression error
};

// Field identifiers for delta updates (1 byte each)
export const FIELD_IDS = {
  LATITUDE: 0x01,
  LONGITUDE: 0x02,
  STATUS: 0x03,
  TEMPERATURE: 0x04,
  BATTERY: 0x05,
  TIMESTAMP: 0x06,
  SIGNAL_STRENGTH: 0x07,
  SPEED: 0x08,
  HEADING: 0x09,
  ALTITUDE: 0x0A
};

// Status values (1 byte)
export const STATUS_VALUES = {
  ACTIVE: 0x01,
  INACTIVE: 0x02,
  VIOLATED: 0x03,
  MAINTENANCE: 0x04,
  LOST_SIGNAL: 0x05
};

// Compression flags (1 byte)
export const COMPRESSION_FLAGS = {
  NONE: 0x00,
  BROTLI: 0x01,
  GZIP: 0x02,
  ZSTD: 0x03
};

// Binary message structure
export class BinaryMessage {
  constructor() {
    this.buffer = Buffer.allocUnsafe(1024); // Pre-allocate for performance
    this.position = 0;
  }

  // Write methods
  writeUInt8(value) {
    this.ensureCapacity(1);
    this.buffer.writeUInt8(value, this.position);
    this.position += 1;
    return this;
  }

  writeUInt16(value) {
    this.ensureCapacity(2);
    this.buffer.writeUInt16BE(value, this.position);
    this.position += 2;
    return this;
  }

  writeUInt32(value) {
    this.ensureCapacity(4);
    this.buffer.writeUInt32BE(value, this.position);
    this.position += 4;
    return this;
  }

  writeFloat32(value) {
    this.ensureCapacity(4);
    this.buffer.writeFloatBE(value, this.position);
    this.position += 4;
    return this;
  }

  writeString(value) {
    const byteLength = Buffer.byteLength(value);
    this.writeUInt16(byteLength);
    this.ensureCapacity(byteLength);
    this.buffer.write(value, this.position, byteLength);
    this.position += byteLength;
    return this;
  }

  writeBytes(bytes) {
    this.ensureCapacity(bytes.length);
    bytes.copy(this.buffer, this.position);
    this.position += bytes.length;
    return this;
  }

  // Read methods
  static readUInt8(buffer, offset = 0) {
    return buffer.readUInt8(offset);
  }

  static readUInt16(buffer, offset = 0) {
    return buffer.readUInt16BE(offset);
  }

  static readUInt32(buffer, offset = 0) {
    return buffer.readUInt32BE(offset);
  }

  static readFloat32(buffer, offset = 0) {
    return buffer.readFloatBE(offset);
  }

  static readString(buffer, offset = 0) {
    const length = buffer.readUInt16BE(offset);
    return buffer.toString('utf8', offset + 2, offset + 2 + length);
  }

  // Utility methods
  ensureCapacity(additionalBytes) {
    const requiredCapacity = this.position + additionalBytes;
    if (requiredCapacity > this.buffer.length) {
      const newBuffer = Buffer.allocUnsafe(Math.max(this.buffer.length * 2, requiredCapacity));
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
  }

  toBuffer() {
    return this.buffer.slice(0, this.position);
  }

  reset() {
    this.position = 0;
  }
}

// Message builders
export function buildFullStateMessage(precintoId, state) {
  const msg = new BinaryMessage();
  msg.writeUInt8(MESSAGE_TYPES.FULL_STATE);
  msg.writeString(precintoId);
  msg.writeUInt32(Date.now());
  
  // Write all fields
  msg.writeFloat32(state.latitude);
  msg.writeFloat32(state.longitude);
  msg.writeUInt8(state.status);
  msg.writeFloat32(state.temperature);
  msg.writeUInt8(state.battery);
  msg.writeUInt32(state.timestamp);
  msg.writeUInt8(state.signalStrength || 0);
  msg.writeFloat32(state.speed || 0);
  msg.writeUInt16(state.heading || 0);
  msg.writeUInt16(state.altitude || 0);
  
  return msg.toBuffer();
}

export function buildDeltaMessage(precintoId, deltas) {
  const msg = new BinaryMessage();
  msg.writeUInt8(MESSAGE_TYPES.DELTA_UPDATE);
  msg.writeString(precintoId);
  msg.writeUInt32(Date.now());
  msg.writeUInt8(Object.keys(deltas).length); // Number of changed fields
  
  // Write only changed fields
  for (const [field, value] of Object.entries(deltas)) {
    const fieldId = FIELD_IDS[field.toUpperCase()];
    if (!fieldId) continue;
    
    msg.writeUInt8(fieldId);
    
    switch (fieldId) {
      case FIELD_IDS.LATITUDE:
      case FIELD_IDS.LONGITUDE:
      case FIELD_IDS.TEMPERATURE:
      case FIELD_IDS.SPEED:
        msg.writeFloat32(value);
        break;
      
      case FIELD_IDS.STATUS:
      case FIELD_IDS.BATTERY:
      case FIELD_IDS.SIGNAL_STRENGTH:
        msg.writeUInt8(value);
        break;
      
      case FIELD_IDS.TIMESTAMP:
        msg.writeUInt32(value);
        break;
      
      case FIELD_IDS.HEADING:
      case FIELD_IDS.ALTITUDE:
        msg.writeUInt16(value);
        break;
    }
  }
  
  return msg.toBuffer();
}

export function buildBatchDeltaMessage(updates) {
  const msg = new BinaryMessage();
  msg.writeUInt8(MESSAGE_TYPES.BATCH_DELTA);
  msg.writeUInt32(Date.now());
  msg.writeUInt16(updates.length); // Number of updates
  
  for (const { precintoId, deltas } of updates) {
    const deltaBuffer = buildDeltaMessage(precintoId, deltas);
    // Skip message type and write the rest
    msg.writeUInt16(deltaBuffer.length - 1);
    msg.writeBytes(deltaBuffer.slice(1));
  }
  
  return msg.toBuffer();
}

// Message parsers
export function parseMessage(buffer) {
  const messageType = BinaryMessage.readUInt8(buffer, 0);
  
  switch (messageType) {
    case MESSAGE_TYPES.FULL_STATE:
      return parseFullStateMessage(buffer);
    
    case MESSAGE_TYPES.DELTA_UPDATE:
      return parseDeltaMessage(buffer);
    
    case MESSAGE_TYPES.BATCH_DELTA:
      return parseBatchDeltaMessage(buffer);
    
    case MESSAGE_TYPES.HEARTBEAT:
      return { type: 'HEARTBEAT', timestamp: BinaryMessage.readUInt32(buffer, 1) };
    
    default:
      throw new Error(`Unknown message type: ${messageType}`);
  }
}

function parseFullStateMessage(buffer) {
  let offset = 1; // Skip message type
  
  const precintoId = BinaryMessage.readString(buffer, offset);
  offset += 2 + Buffer.byteLength(precintoId);
  
  const timestamp = BinaryMessage.readUInt32(buffer, offset);
  offset += 4;
  
  return {
    type: 'FULL_STATE',
    precintoId,
    timestamp,
    state: {
      latitude: BinaryMessage.readFloat32(buffer, offset),
      longitude: BinaryMessage.readFloat32(buffer, offset + 4),
      status: BinaryMessage.readUInt8(buffer, offset + 8),
      temperature: BinaryMessage.readFloat32(buffer, offset + 9),
      battery: BinaryMessage.readUInt8(buffer, offset + 13),
      timestamp: BinaryMessage.readUInt32(buffer, offset + 14),
      signalStrength: BinaryMessage.readUInt8(buffer, offset + 18),
      speed: BinaryMessage.readFloat32(buffer, offset + 19),
      heading: BinaryMessage.readUInt16(buffer, offset + 23),
      altitude: BinaryMessage.readUInt16(buffer, offset + 25)
    }
  };
}

function parseDeltaMessage(buffer) {
  let offset = 1; // Skip message type
  
  const precintoId = BinaryMessage.readString(buffer, offset);
  offset += 2 + Buffer.byteLength(precintoId);
  
  const timestamp = BinaryMessage.readUInt32(buffer, offset);
  offset += 4;
  
  const fieldCount = BinaryMessage.readUInt8(buffer, offset);
  offset += 1;
  
  const deltas = {};
  
  for (let i = 0; i < fieldCount; i++) {
    const fieldId = BinaryMessage.readUInt8(buffer, offset);
    offset += 1;
    
    switch (fieldId) {
      case FIELD_IDS.LATITUDE:
        deltas.latitude = BinaryMessage.readFloat32(buffer, offset);
        offset += 4;
        break;
      
      case FIELD_IDS.LONGITUDE:
        deltas.longitude = BinaryMessage.readFloat32(buffer, offset);
        offset += 4;
        break;
      
      case FIELD_IDS.STATUS:
        deltas.status = BinaryMessage.readUInt8(buffer, offset);
        offset += 1;
        break;
      
      case FIELD_IDS.TEMPERATURE:
        deltas.temperature = BinaryMessage.readFloat32(buffer, offset);
        offset += 4;
        break;
      
      case FIELD_IDS.BATTERY:
        deltas.battery = BinaryMessage.readUInt8(buffer, offset);
        offset += 1;
        break;
      
      case FIELD_IDS.TIMESTAMP:
        deltas.timestamp = BinaryMessage.readUInt32(buffer, offset);
        offset += 4;
        break;
      
      case FIELD_IDS.SIGNAL_STRENGTH:
        deltas.signalStrength = BinaryMessage.readUInt8(buffer, offset);
        offset += 1;
        break;
      
      case FIELD_IDS.SPEED:
        deltas.speed = BinaryMessage.readFloat32(buffer, offset);
        offset += 4;
        break;
      
      case FIELD_IDS.HEADING:
        deltas.heading = BinaryMessage.readUInt16(buffer, offset);
        offset += 2;
        break;
      
      case FIELD_IDS.ALTITUDE:
        deltas.altitude = BinaryMessage.readUInt16(buffer, offset);
        offset += 2;
        break;
    }
  }
  
  return {
    type: 'DELTA_UPDATE',
    precintoId,
    timestamp,
    deltas
  };
}

function parseBatchDeltaMessage(buffer) {
  let offset = 1; // Skip message type
  
  const timestamp = BinaryMessage.readUInt32(buffer, offset);
  offset += 4;
  
  const updateCount = BinaryMessage.readUInt16(buffer, offset);
  offset += 2;
  
  const updates = [];
  
  for (let i = 0; i < updateCount; i++) {
    const updateLength = BinaryMessage.readUInt16(buffer, offset);
    offset += 2;
    
    // Create a temporary buffer with DELTA_UPDATE message type
    const tempBuffer = Buffer.concat([
      Buffer.from([MESSAGE_TYPES.DELTA_UPDATE]),
      buffer.slice(offset, offset + updateLength)
    ]);
    
    updates.push(parseDeltaMessage(tempBuffer));
    offset += updateLength;
  }
  
  return {
    type: 'BATCH_DELTA',
    timestamp,
    updates
  };
}