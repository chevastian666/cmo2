/**
 * High-Performance WebSocket Server with Differential Compression
 * Optimized for thousands of concurrent connections
 */

import { WebSocketServer as WSServer } from 'ws';
import { promisify } from 'util';
import { brotliCompress, brotliDecompress, constants } from 'zlib';
import { DeltaCompressor } from './DeltaCompressor.js';
import { StateManager } from './StateManager.js';
import { MESSAGE_TYPES, parseMessage, BinaryMessage } from '../protocol/MessageTypes.js';

const compressAsync = promisify(brotliCompress);
const decompressAsync = promisify(brotliDecompress);

export class CompressedWebSocketServer {
  constructor(options = {}) {
    this.options = {
      port: 8080,
      host: '0.0.0.0',
      compression: true,
      compressionLevel: 4, // Balance between speed and ratio
      heartbeatInterval: 30000,
      connectionTimeout: 60000,
      maxConnections: 10000,
      maxMessageSize: 1048576, // 1MB
      batchInterval: 100,
      ...options
    };
    
    this.wss = null;
    this.clients = new Map(); // ws -> client info
    this.subscriptions = new Map(); // precintoId -> Set of clients
    this.deltaCompressor = new DeltaCompressor({
      batchInterval: this.options.batchInterval
    });
    this.stateManager = new StateManager();
    
    this.metrics = {
      connectionsTotal: 0,
      connectionsActive: 0,
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      compressionRatio: 0,
      errors: 0
    };
    
    this.compressionBuffer = [];
    this.compressionTimer = null;
  }

  /**
   * Start the WebSocket server
   */
  async start() {
    this.wss = new WSServer({
      port: this.options.port,
      host: this.options.host,
      maxPayload: this.options.maxMessageSize,
      perMessageDeflate: false // We'll use Brotli instead
    });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleServerError.bind(this));
    
    // Start heartbeat checker
    this.startHeartbeat();
    
    // Start metrics reporter
    this.startMetricsReporter();
    
    console.log(`WebSocket server started on ${this.options.host}:${this.options.port}`);
    console.log(`Compression: ${this.options.compression ? 'Brotli' : 'Disabled'}`);
  }

  /**
   * Handle new client connection
   */
  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    const clientInfo = {
      id: clientId,
      ws,
      ip: req.socket.remoteAddress,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      subscriptions: new Set(),
      metrics: {
        messagesReceived: 0,
        messagesSent: 0,
        bytesReceived: 0,
        bytesSent: 0
      }
    };
    
    this.clients.set(ws, clientInfo);
    this.metrics.connectionsTotal++;
    this.metrics.connectionsActive++;
    
    console.log(`Client connected: ${clientId} from ${clientInfo.ip}`);
    
    // Set up event handlers
    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('close', () => this.handleDisconnect(ws));
    ws.on('error', (err) => this.handleClientError(ws, err));
    ws.on('pong', () => this.handlePong(ws));
    
    // Send welcome message
    this.sendMessage(ws, {
      type: MESSAGE_TYPES.HELLO,
      clientId,
      serverTime: Date.now(),
      compression: this.options.compression ? 'brotli' : 'none'
    });
  }

  /**
   * Handle incoming message from client
   */
  async handleMessage(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    client.lastActivity = Date.now();
    client.metrics.messagesReceived++;
    client.metrics.bytesReceived += data.length;
    this.metrics.messagesReceived++;
    this.metrics.bytesReceived += data.length;
    
    try {
      // Decompress if needed
      let buffer = data;
      if (this.options.compression && data[0] === 0xFF) { // Compression marker
        buffer = await decompressAsync(data.slice(1));
      }
      
      const message = parseMessage(buffer);
      await this.processMessage(ws, message);
      
    } catch (error) {
      console.error('Error processing message:', error);
      this.metrics.errors++;
      this.sendError(ws, 'Invalid message format');
    }
  }

  /**
   * Process parsed message
   */
  async processMessage(ws, message) {
    const client = this.clients.get(ws);
    
    switch (message.type) {
      case 'SUBSCRIBE':
        this.handleSubscribe(ws, message.precintoIds);
        break;
      
      case 'UNSUBSCRIBE':
        this.handleUnsubscribe(ws, message.precintoIds);
        break;
      
      case 'RESYNC_REQUEST':
        await this.handleResyncRequest(ws, message.precintoId);
        break;
      
      case 'HEARTBEAT':
        // Client is alive, update activity
        client.lastActivity = Date.now();
        break;
      
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle subscription request
   */
  handleSubscribe(ws, precintoIds) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    for (const precintoId of precintoIds) {
      // Add to client's subscriptions
      client.subscriptions.add(precintoId);
      
      // Add to global subscriptions map
      if (!this.subscriptions.has(precintoId)) {
        this.subscriptions.set(precintoId, new Set());
      }
      this.subscriptions.get(precintoId).add(ws);
      
      // Send current state
      const currentState = this.stateManager.getState(precintoId);
      if (currentState) {
        const message = this.deltaCompressor.createFullState(precintoId, currentState);
        this.sendCompressed(ws, message.buffer);
      }
    }
    
    console.log(`Client ${client.id} subscribed to ${precintoIds.length} precintos`);
  }

  /**
   * Handle unsubscribe request
   */
  handleUnsubscribe(ws, precintoIds) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    for (const precintoId of precintoIds) {
      client.subscriptions.delete(precintoId);
      
      const subscribers = this.subscriptions.get(precintoId);
      if (subscribers) {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          this.subscriptions.delete(precintoId);
        }
      }
    }
  }

  /**
   * Handle resync request
   */
  async handleResyncRequest(ws, precintoId) {
    const client = this.clients.get(ws);
    if (!client || !client.subscriptions.has(precintoId)) return;
    
    const currentState = this.stateManager.getState(precintoId);
    if (currentState) {
      const message = this.deltaCompressor.createFullState(precintoId, currentState);
      await this.sendCompressed(ws, message.buffer);
    }
  }

  /**
   * Broadcast state update to subscribers
   */
  async broadcastUpdate(precintoId, newState) {
    // Update state manager
    this.stateManager.setState(precintoId, newState);
    
    // Get subscribers
    const subscribers = this.subscriptions.get(precintoId);
    if (!subscribers || subscribers.size === 0) return;
    
    // Process through delta compressor
    const message = this.deltaCompressor.processState(precintoId, newState);
    
    if (message) {
      // Send individual message
      for (const ws of subscribers) {
        if (ws.readyState === ws.OPEN) {
          await this.sendCompressed(ws, message.buffer);
        }
      }
    }
    
    // Check if we should send batch
    const batch = this.deltaCompressor.sendBatch();
    if (batch) {
      await this.broadcastBatch(batch.buffer);
    }
  }

  /**
   * Broadcast batch update to all clients
   */
  async broadcastBatch(buffer) {
    const compressed = await this.compressMessage(buffer);
    
    for (const [ws, client] of this.clients) {
      if (ws.readyState === ws.OPEN) {
        this.sendRaw(ws, compressed);
      }
    }
  }

  /**
   * Send compressed message
   */
  async sendCompressed(ws, buffer) {
    if (!this.options.compression) {
      this.sendRaw(ws, buffer);
      return;
    }
    
    const compressed = await this.compressMessage(buffer);
    this.sendRaw(ws, compressed);
  }

  /**
   * Compress message with Brotli
   */
  async compressMessage(buffer) {
    const compressed = await compressAsync(buffer, {
      params: {
        [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC,
        [constants.BROTLI_PARAM_QUALITY]: this.options.compressionLevel,
        [constants.BROTLI_PARAM_SIZE_HINT]: buffer.length
      }
    });
    
    // Add compression marker
    return Buffer.concat([Buffer.from([0xFF]), compressed]);
  }

  /**
   * Send raw message
   */
  sendRaw(ws, buffer) {
    const client = this.clients.get(ws);
    if (!client || ws.readyState !== ws.OPEN) return;
    
    ws.send(buffer);
    
    client.metrics.messagesSent++;
    client.metrics.bytesSent += buffer.length;
    this.metrics.messagesSent++;
    this.metrics.bytesSent += buffer.length;
  }

  /**
   * Send structured message
   */
  async sendMessage(ws, data) {
    const msg = new BinaryMessage();
    msg.writeUInt8(data.type);
    
    // Encode based on type
    switch (data.type) {
      case MESSAGE_TYPES.HELLO:
        msg.writeString(data.clientId);
        msg.writeUInt32(data.serverTime);
        msg.writeString(data.compression);
        break;
      
      case MESSAGE_TYPES.ERROR:
        msg.writeString(data.message);
        break;
    }
    
    await this.sendCompressed(ws, msg.toBuffer());
  }

  /**
   * Send error message
   */
  sendError(ws, message) {
    this.sendMessage(ws, {
      type: MESSAGE_TYPES.ERROR,
      message
    });
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(ws) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove from all subscriptions
    for (const precintoId of client.subscriptions) {
      const subscribers = this.subscriptions.get(precintoId);
      if (subscribers) {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          this.subscriptions.delete(precintoId);
        }
      }
    }
    
    this.clients.delete(ws);
    this.metrics.connectionsActive--;
  }

  /**
   * Handle client error
   */
  handleClientError(ws, error) {
    console.error('Client error:', error);
    this.metrics.errors++;
    ws.terminate();
  }

  /**
   * Handle server error
   */
  handleServerError(error) {
    console.error('Server error:', error);
    this.metrics.errors++;
  }

  /**
   * Handle pong from client
   */
  handlePong(ws) {
    const client = this.clients.get(ws);
    if (client) {
      client.lastActivity = Date.now();
    }
  }

  /**
   * Start heartbeat interval
   */
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      
      for (const [ws, client] of this.clients) {
        // Check for timeout
        if (now - client.lastActivity > this.options.connectionTimeout) {
          console.log(`Client ${client.id} timed out`);
          ws.terminate();
          continue;
        }
        
        // Send ping
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        }
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Start metrics reporter
   */
  startMetricsReporter() {
    setInterval(() => {
      const compressionMetrics = this.deltaCompressor.getMetrics();
      const memoryUsage = process.memoryUsage();
      
      console.log('\n=== WebSocket Server Metrics ===');
      console.log(`Active Connections: ${this.metrics.connectionsActive}/${this.options.maxConnections}`);
      console.log(`Messages: ${this.metrics.messagesSent} sent, ${this.metrics.messagesReceived} received`);
      console.log(`Bandwidth: ${this.formatBytes(this.metrics.bytesSent)} sent, ${this.formatBytes(this.metrics.bytesReceived)} received`);
      console.log(`Compression Ratio: ${compressionMetrics.compressionPercentage}`);
      console.log(`Bandwidth Saved: ${compressionMetrics.bandwidthSaved}`);
      console.log(`Memory Usage: ${(memoryUsage.heapUsed / 1048576).toFixed(2)} MB`);
      console.log(`Errors: ${this.metrics.errors}`);
      console.log('================================\n');
    }, 30000); // Every 30 seconds
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('Shutting down WebSocket server...');
    
    // Close all client connections
    for (const [ws, client] of this.clients) {
      ws.close(1000, 'Server shutting down');
    }
    
    // Close server
    if (this.wss) {
      await new Promise((resolve) => {
        this.wss.close(resolve);
      });
    }
    
    console.log('WebSocket server shut down');
  }
}