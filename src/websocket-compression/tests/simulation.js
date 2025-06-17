/**
 * WebSocket Compression System Simulation
 * Simulates 1000 precintos sending updates
 */

import { CompressedWebSocketServer } from '../server/WebSocketServer.js';
import { CompressedWebSocketClient } from '../client/WebSocketClient.js';
import { STATUS_VALUES } from '../protocol/MessageTypes.js';

class PrecintoSimulator {
  constructor(id, updateInterval = 5000) {
    this.id = id;
    this.updateInterval = updateInterval;
    this.state = this.generateInitialState();
    this.timer = null;
  }

  generateInitialState() {
    return {
      latitude: -34.6037 + (Math.random() - 0.5) * 0.5,
      longitude: -58.3816 + (Math.random() - 0.5) * 0.5,
      status: STATUS_VALUES.ACTIVE,
      temperature: 20 + Math.random() * 10,
      battery: 80 + Math.random() * 20,
      timestamp: Date.now(),
      signalStrength: 70 + Math.random() * 30,
      speed: 0,
      heading: Math.floor(Math.random() * 360),
      altitude: 10 + Math.random() * 100
    };
  }

  start(callback) {
    // Send initial state
    callback(this.id, this.state);
    
    // Start update timer with some randomness
    this.timer = setInterval(() => {
      this.updateState();
      callback(this.id, this.state);
    }, this.updateInterval + Math.random() * 2000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateState() {
    // Simulate realistic changes
    const moving = Math.random() > 0.7;
    
    if (moving) {
      // Vehicle is moving
      this.state.speed = 20 + Math.random() * 80;
      const distance = (this.state.speed / 3600) * (this.updateInterval / 1000);
      const bearing = (this.state.heading + (Math.random() - 0.5) * 30) % 360;
      
      // Update position based on speed and heading
      this.state.latitude += (distance / 111) * Math.cos(bearing * Math.PI / 180);
      this.state.longitude += (distance / 111) * Math.sin(bearing * Math.PI / 180);
      this.state.heading = bearing;
    } else {
      // Vehicle stopped
      this.state.speed = 0;
    }
    
    // Update other fields with small variations
    this.state.temperature += (Math.random() - 0.5) * 2;
    this.state.battery = Math.max(0, this.state.battery - Math.random() * 0.1);
    this.state.timestamp = Date.now();
    this.state.signalStrength = Math.max(0, Math.min(100, 
      this.state.signalStrength + (Math.random() - 0.5) * 10
    ));
    
    // Occasional status changes
    if (Math.random() > 0.98) {
      const statuses = Object.values(STATUS_VALUES);
      this.state.status = statuses[Math.floor(Math.random() * statuses.length)];
    }
  }
}

class CompressionTest {
  constructor() {
    this.server = null;
    this.clients = [];
    this.simulators = [];
    this.metrics = {
      startTime: Date.now(),
      updates: 0,
      errors: 0
    };
  }

  async start(numPrecintos = 1000, numClients = 5) {
    console.log('=== WebSocket Compression System Test ===');
    console.log(`Simulating ${numPrecintos} precintos with ${numClients} clients`);
    console.log('========================================\n');
    
    // Start server
    this.server = new CompressedWebSocketServer({
      port: 8080,
      compression: true,
      compressionLevel: 4,
      batchInterval: 100
    });
    
    await this.server.start();
    
    // Wait a bit for server to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create clients
    for (let i = 0; i < numClients; i++) {
      await this.createClient(i, numPrecintos);
    }
    
    // Start simulators
    this.startSimulators(numPrecintos);
    
    // Start metrics reporter
    this.startMetricsReporter();
  }

  async createClient(clientIndex, numPrecintos) {
    const client = new CompressedWebSocketClient('ws://localhost:8080', {
      compression: true,
      reconnect: true
    });
    
    // Set up event handlers
    client.on('connected', () => {
      console.log(`Client ${clientIndex} connected`);
      
      // Subscribe to a subset of precintos
      const startIdx = Math.floor((clientIndex * numPrecintos) / this.clients.length);
      const endIdx = Math.floor(((clientIndex + 1) * numPrecintos) / this.clients.length);
      const precintoIds = [];
      
      for (let i = startIdx; i < endIdx; i++) {
        precintoIds.push(`PRECINTO-${i}`);
      }
      
      client.subscribe(precintoIds);
      console.log(`Client ${clientIndex} subscribed to ${precintoIds.length} precintos`);
    });
    
    client.on('stateUpdate', (data) => {
      this.metrics.updates++;
      
      // Verify data integrity
      if (!data.state || !data.precintoId) {
        this.metrics.errors++;
        console.error('Invalid state update received');
      }
    });
    
    client.on('error', (error) => {
      console.error(`Client ${clientIndex} error:`, error);
      this.metrics.errors++;
    });
    
    await client.connect();
    this.clients.push(client);
  }

  startSimulators(numPrecintos) {
    console.log(`\nStarting ${numPrecintos} precinto simulators...`);
    
    for (let i = 0; i < numPrecintos; i++) {
      const simulator = new PrecintoSimulator(
        `PRECINTO-${i}`,
        5000 + Math.random() * 25000 // 5-30 seconds
      );
      
      simulator.start((id, state) => {
        // Send update to server
        this.server.broadcastUpdate(id, state);
      });
      
      this.simulators.push(simulator);
    }
    
    console.log('All simulators started\n');
  }

  startMetricsReporter() {
    // Report every 10 seconds
    setInterval(() => {
      const runtime = Math.floor((Date.now() - this.metrics.startTime) / 1000);
      const serverMetrics = this.server.deltaCompressor.getMetrics();
      const memoryUsage = process.memoryUsage();
      
      console.log('\n=== Performance Metrics ===');
      console.log(`Runtime: ${runtime}s`);
      console.log(`Active Connections: ${this.server.metrics.connectionsActive}`);
      console.log(`Updates Received: ${this.metrics.updates}`);
      console.log(`Updates/sec: ${(this.metrics.updates / runtime).toFixed(2)}`);
      console.log(`Errors: ${this.metrics.errors}`);
      console.log('\n--- Compression Stats ---');
      console.log(`Compression Ratio: ${serverMetrics.compressionPercentage}`);
      console.log(`Bandwidth Saved: ${serverMetrics.bandwidthSaved}`);
      console.log(`Avg Delta Size: ${serverMetrics.avgDeltaSize.toFixed(2)} bytes`);
      console.log(`Full States: ${serverMetrics.fullStateCount}`);
      console.log(`Delta Updates: ${serverMetrics.deltaCount}`);
      console.log('\n--- Resource Usage ---');
      console.log(`Memory: ${(memoryUsage.heapUsed / 1048576).toFixed(2)} MB`);
      console.log(`CPU: ${process.cpuUsage().system / 1000000}s`);
      console.log('==========================\n');
      
      // Check if we've achieved target
      if (parseFloat(serverMetrics.compressionPercentage) >= 90) {
        console.log('✅ TARGET ACHIEVED: 90%+ bandwidth reduction!');
      }
    }, 10000);
    
    // Detailed report every minute
    setInterval(() => {
      this.generateDetailedReport();
    }, 60000);
  }

  generateDetailedReport() {
    console.log('\n=== DETAILED PERFORMANCE REPORT ===');
    
    // Server stats
    const serverMetrics = this.server.deltaCompressor.getMetrics();
    const serverMemory = this.server.deltaCompressor.getMemoryUsage();
    
    console.log('\nServer Performance:');
    console.log(`- Total Bytes Sent: ${this.server.formatBytes(this.server.metrics.bytesSent)}`);
    console.log(`- Total Bytes Received: ${this.server.formatBytes(this.server.metrics.bytesReceived)}`);
    console.log(`- Messages Sent: ${this.server.metrics.messagesSent}`);
    console.log(`- Cache Memory: ${serverMemory.total}`);
    
    // Client stats
    console.log('\nClient Performance:');
    this.clients.forEach((client, i) => {
      const metrics = client.getMetrics();
      console.log(`\nClient ${i}:`);
      console.log(`  - Messages Received: ${metrics.messagesReceived}`);
      console.log(`  - Compression Ratio: ${metrics.compressionRatio}`);
      console.log(`  - Cached States: ${metrics.cachedStates}`);
      console.log(`  - Memory Usage: ${metrics.memoryUsage}`);
    });
    
    // Network stats
    const totalBandwidth = this.server.metrics.bytesSent + this.server.metrics.bytesReceived;
    const runtime = (Date.now() - this.metrics.startTime) / 1000;
    const bandwidthRate = totalBandwidth / runtime;
    
    console.log('\nNetwork Performance:');
    console.log(`- Total Bandwidth: ${this.server.formatBytes(totalBandwidth)}`);
    console.log(`- Bandwidth Rate: ${this.server.formatBytes(bandwidthRate)}/s`);
    console.log(`- Latency: < ${this.server.options.batchInterval}ms (batch interval)`);
    
    console.log('\n=====================================\n');
  }

  async stop() {
    console.log('\nStopping test...');
    
    // Stop simulators
    this.simulators.forEach(sim => sim.stop());
    
    // Disconnect clients
    for (const client of this.clients) {
      client.disconnect();
    }
    
    // Shutdown server
    await this.server.shutdown();
    
    console.log('Test stopped');
  }
}

// Run test
const test = new CompressionTest();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await test.stop();
  process.exit(0);
});

// Start test with 1000 precintos and 5 clients
test.start(1000, 5).catch(console.error);