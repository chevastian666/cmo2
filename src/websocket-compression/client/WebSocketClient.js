/**
 * WebSocket Client with Auto-Reconnection and Delta Decompression
 * Optimized for reliability and low latency
 */

import WebSocket from 'ws';
import { promisify } from 'util';
import { brotliDecompress } from 'zlib';
import { EventEmitter } from 'events';
import { DeltaDecompressor } from './DeltaDecompressor.js';
import { MESSAGE_TYPES, parseMessage, BinaryMessage } from '../protocol/MessageTypes.js';

const decompressAsync = promisify(brotliDecompress);

export class CompressedWebSocketClient extends EventEmitter {
  constructor(url, options = {}) {
    super();
    
    this.url = url;
    this.options = {
      reconnect: true,
      reconnectInterval: 1000,
      reconnectDecay: 1.5,
      reconnectAttempts: 10,
      timeout: 30000,
      heartbeatInterval: 25000,
      compression: true,
      batchProcessing: true,
      maxReconnectInterval: 30000,
      ...options
    };
    
    this.ws = null;
    this.clientId = null;
    this.connected = false;
    this.reconnectCount = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.lastActivity = Date.now();
    
    this.deltaDecompressor = new DeltaDecompressor();
    this.subscriptions = new Set();
    this.messageQueue = [];
    this.isReconnecting = false;
    
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      reconnects: 0,
      errors: 0,
      latency: 0
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log(`Connecting to ${this.url}...`);
        
        this.ws = new WebSocket(this.url, {
          perMessageDeflate: false,
          maxPayload: 1048576 // 1MB
        });
        
        this.ws.on('open', () => {
          console.log('WebSocket connected');
          this.connected = true;
          this.reconnectCount = 0;
          this.lastActivity = Date.now();
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Process queued messages
          this.processMessageQueue();
          
          // Re-subscribe to precintos
          if (this.subscriptions.size > 0) {
            this.resubscribe();
          }
          
          this.emit('connected');
          resolve();
        });
        
        this.ws.on('message', (data) => this.handleMessage(data));
        this.ws.on('close', (code, reason) => this.handleClose(code, reason));
        this.ws.on('error', (error) => this.handleError(error));
        this.ws.on('ping', () => this.ws.pong());
        
        // Connection timeout
        setTimeout(() => {
          if (!this.connected) {
            this.ws.terminate();
            reject(new Error('Connection timeout'));
          }
        }, this.options.timeout);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(data) {
    this.lastActivity = Date.now();
    this.metrics.messagesReceived++;
    this.metrics.bytesReceived += data.length;
    
    try {
      // Decompress if needed
      let buffer = data;
      if (this.options.compression && data[0] === 0xFF) {
        buffer = await decompressAsync(data.slice(1));
      }
      
      const message = parseMessage(buffer);
      await this.processMessage(message);
      
    } catch (error) {
      console.error('Error processing message:', error);
      this.metrics.errors++;
      this.emit('error', error);
    }
  }

  /**
   * Process parsed message
   */
  async processMessage(message) {
    switch (message.type) {
      case 'HELLO':
        this.clientId = message.clientId;
        console.log(`Assigned client ID: ${this.clientId}`);
        this.emit('hello', message);
        break;
      
      case 'FULL_STATE':
        this.deltaDecompressor.setFullState(message.precintoId, message.state);
        this.emit('stateUpdate', {
          precintoId: message.precintoId,
          state: message.state,
          isFullState: true
        });
        break;
      
      case 'DELTA_UPDATE':
        const state = this.deltaDecompressor.applyDelta(message.precintoId, message.deltas);
        if (state) {
          this.emit('stateUpdate', {
            precintoId: message.precintoId,
            state,
            deltas: message.deltas,
            isFullState: false
          });
        } else {
          // Request full state if we can't apply delta
          this.requestResync(message.precintoId);
        }
        break;
      
      case 'BATCH_DELTA':
        for (const update of message.updates) {
          await this.processMessage(update);
        }
        break;
      
      case 'ERROR':
        console.error('Server error:', message.message);
        this.emit('serverError', message.message);
        break;
      
      case 'HEARTBEAT':
        // Server heartbeat acknowledged
        break;
      
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Subscribe to precinto updates
   */
  subscribe(precintoIds) {
    if (!Array.isArray(precintoIds)) {
      precintoIds = [precintoIds];
    }
    
    // Add to local subscriptions
    precintoIds.forEach(id => this.subscriptions.add(id));
    
    // Send subscribe message
    const msg = new BinaryMessage();
    msg.writeUInt8(MESSAGE_TYPES.SUBSCRIBE);
    msg.writeUInt16(precintoIds.length);
    precintoIds.forEach(id => msg.writeString(id));
    
    this.send(msg.toBuffer());
  }

  /**
   * Unsubscribe from precinto updates
   */
  unsubscribe(precintoIds) {
    if (!Array.isArray(precintoIds)) {
      precintoIds = [precintoIds];
    }
    
    // Remove from local subscriptions
    precintoIds.forEach(id => this.subscriptions.delete(id));
    
    // Send unsubscribe message
    const msg = new BinaryMessage();
    msg.writeUInt8(MESSAGE_TYPES.UNSUBSCRIBE);
    msg.writeUInt16(precintoIds.length);
    precintoIds.forEach(id => msg.writeString(id));
    
    this.send(msg.toBuffer());
  }

  /**
   * Request full state resync
   */
  requestResync(precintoId) {
    console.log(`Requesting resync for ${precintoId}`);
    
    const msg = new BinaryMessage();
    msg.writeUInt8(MESSAGE_TYPES.RESYNC_REQUEST);
    msg.writeString(precintoId);
    
    this.send(msg.toBuffer());
  }

  /**
   * Send message
   */
  send(buffer) {
    if (this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(buffer);
      this.metrics.messagesSent++;
      this.metrics.bytesSent += buffer.length;
    } else {
      // Queue message for later
      this.messageQueue.push(buffer);
    }
  }

  /**
   * Send heartbeat
   */
  sendHeartbeat() {
    const msg = new BinaryMessage();
    msg.writeUInt8(MESSAGE_TYPES.HEARTBEAT);
    msg.writeUInt32(Date.now());
    
    this.send(msg.toBuffer());
  }

  /**
   * Start heartbeat timer
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.sendHeartbeat();
        
        // Check for timeout
        if (Date.now() - this.lastActivity > this.options.timeout) {
          console.warn('Connection timeout, reconnecting...');
          this.ws.terminate();
        }
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop heartbeat timer
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Handle connection close
   */
  handleClose(code, reason) {
    console.log(`WebSocket closed: ${code} - ${reason}`);
    this.connected = false;
    this.stopHeartbeat();
    
    this.emit('disconnected', { code, reason });
    
    // Attempt reconnection
    if (this.options.reconnect && !this.isReconnecting) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.metrics.errors++;
    this.emit('error', error);
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectCount >= this.options.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnectFailed');
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectCount++;
    
    const interval = Math.min(
      this.options.reconnectInterval * Math.pow(this.options.reconnectDecay, this.reconnectCount - 1),
      this.options.maxReconnectInterval
    );
    
    console.log(`Reconnecting in ${interval}ms (attempt ${this.reconnectCount}/${this.options.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
        this.isReconnecting = false;
        this.metrics.reconnects++;
      } catch (error) {
        this.scheduleReconnect();
      }
    }, interval);
  }

  /**
   * Re-subscribe after reconnection
   */
  resubscribe() {
    if (this.subscriptions.size === 0) return;
    
    const precintoIds = Array.from(this.subscriptions);
    console.log(`Re-subscribing to ${precintoIds.length} precintos`);
    
    // Clear local state to force full state sync
    this.deltaDecompressor.clearAll();
    
    // Re-subscribe
    this.subscribe(precintoIds);
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    console.log(`Processing ${this.messageQueue.length} queued messages`);
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Get current state for a precinto
   */
  getState(precintoId) {
    return this.deltaDecompressor.getState(precintoId);
  }

  /**
   * Get all states
   */
  getAllStates() {
    return this.deltaDecompressor.getAllStates();
  }

  /**
   * Get connection metrics
   */
  getMetrics() {
    const deltaMetrics = this.deltaDecompressor.getMetrics();
    
    return {
      ...this.metrics,
      ...deltaMetrics,
      connected: this.connected,
      uptime: this.connected ? Date.now() - this.lastActivity : 0,
      subscriptions: this.subscriptions.size,
      queuedMessages: this.messageQueue.length
    };
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    console.log('Disconnecting WebSocket client');
    
    this.options.reconnect = false;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.connected = false;
    this.emit('disconnected', { code: 1000, reason: 'Client disconnect' });
  }

  /**
   * Destroy client and cleanup
   */
  destroy() {
    this.disconnect();
    this.removeAllListeners();
    this.deltaDecompressor.clearAll();
    this.subscriptions.clear();
    this.messageQueue = [];
  }
}