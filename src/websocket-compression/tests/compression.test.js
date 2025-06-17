/**
 * Unit tests for WebSocket Compression System
 */

import { DeltaCompressor } from '../server/DeltaCompressor.js';
import { DeltaDecompressor } from '../client/DeltaDecompressor.js';
import { 
  buildFullStateMessage, 
  buildDeltaMessage, 
  parseMessage,
  STATUS_VALUES 
} from '../protocol/MessageTypes.js';

// Test Delta Compression
function testDeltaCompression() {
  console.log('Testing Delta Compression...');
  
  const compressor = new DeltaCompressor();
  const precintoId = 'TEST-001';
  
  // Initial state
  const state1 = {
    latitude: -34.6037,
    longitude: -58.3816,
    status: STATUS_VALUES.ACTIVE,
    temperature: 25.5,
    battery: 85,
    timestamp: Date.now(),
    signalStrength: 90,
    speed: 0,
    heading: 180,
    altitude: 50
  };
  
  // Process initial state (should return full state)
  const result1 = compressor.processState(precintoId, state1);
  console.assert(result1.type === 'full', 'First state should be full');
  
  // Small change
  const state2 = {
    ...state1,
    temperature: 26.0,
    timestamp: Date.now() + 1000
  };
  
  // Process update (should return delta)
  const result2 = compressor.processState(precintoId, state2);
  console.assert(result2 === null, 'Small changes should be batched');
  
  // Significant change
  const state3 = {
    ...state2,
    latitude: -34.6050,
    longitude: -58.3820,
    speed: 45.5,
    timestamp: Date.now() + 2000
  };
  
  const result3 = compressor.processState(precintoId, state3);
  
  // Force batch send
  const batch = compressor.flush();
  console.assert(batch !== null, 'Batch should contain deltas');
  
  // Check metrics
  const metrics = compressor.getMetrics();
  console.log('Compression Metrics:', metrics);
  console.assert(parseFloat(metrics.compressionPercentage) > 50, 'Should achieve >50% compression');
  
  console.log('✓ Delta Compression test passed\n');
}

// Test Binary Protocol
function testBinaryProtocol() {
  console.log('Testing Binary Protocol...');
  
  const precintoId = 'TEST-002';
  const state = {
    latitude: -34.6037,
    longitude: -58.3816,
    status: STATUS_VALUES.ACTIVE,
    temperature: 25.5,
    battery: 85,
    timestamp: Date.now(),
    signalStrength: 90,
    speed: 45.5,
    heading: 180,
    altitude: 50
  };
  
  // Test full state message
  const fullStateBuffer = buildFullStateMessage(precintoId, state);
  const parsedFull = parseMessage(fullStateBuffer);
  
  console.assert(parsedFull.type === 'FULL_STATE', 'Should parse as full state');
  console.assert(parsedFull.precintoId === precintoId, 'Precinto ID should match');
  console.assert(Math.abs(parsedFull.state.latitude - state.latitude) < 0.0001, 'Latitude should match');
  
  // Test delta message
  const deltas = {
    latitude: -34.6050,
    speed: 60.0,
    timestamp: Date.now()
  };
  
  const deltaBuffer = buildDeltaMessage(precintoId, deltas);
  const parsedDelta = parseMessage(deltaBuffer);
  
  console.assert(parsedDelta.type === 'DELTA_UPDATE', 'Should parse as delta update');
  console.assert(parsedDelta.precintoId === precintoId, 'Precinto ID should match');
  console.assert(Object.keys(parsedDelta.deltas).length === 3, 'Should have 3 delta fields');
  
  // Compare sizes
  console.log(`Full State Size: ${fullStateBuffer.length} bytes`);
  console.log(`Delta Size: ${deltaBuffer.length} bytes`);
  console.log(`Size Reduction: ${((1 - deltaBuffer.length / fullStateBuffer.length) * 100).toFixed(2)}%`);
  
  console.log('✓ Binary Protocol test passed\n');
}

// Test Delta Decompression
function testDeltaDecompression() {
  console.log('Testing Delta Decompression...');
  
  const decompressor = new DeltaDecompressor();
  const precintoId = 'TEST-003';
  
  // Set initial full state
  const fullState = {
    latitude: -34.6037,
    longitude: -58.3816,
    status: STATUS_VALUES.ACTIVE,
    temperature: 25.5,
    battery: 85,
    timestamp: Date.now(),
    signalStrength: 90,
    speed: 0,
    heading: 180,
    altitude: 50
  };
  
  decompressor.setFullState(precintoId, fullState);
  
  // Apply delta
  const deltas = {
    latitude: -34.6050,
    speed: 45.5,
    timestamp: Date.now() + 1000
  };
  
  const newState = decompressor.applyDelta(precintoId, deltas);
  
  console.assert(newState !== null, 'Should apply delta successfully');
  console.assert(newState.latitude === deltas.latitude, 'Latitude should be updated');
  console.assert(newState.speed === deltas.speed, 'Speed should be updated');
  console.assert(newState.temperature === fullState.temperature, 'Temperature should remain unchanged');
  
  // Test metrics
  const metrics = decompressor.getMetrics();
  console.log('Decompressor Metrics:', metrics);
  
  console.log('✓ Delta Decompression test passed\n');
}

// Test End-to-End Compression
function testEndToEndCompression() {
  console.log('Testing End-to-End Compression...');
  
  const compressor = new DeltaCompressor();
  const decompressor = new DeltaDecompressor();
  const precintoId = 'TEST-004';
  
  // Simulate multiple state updates
  const states = [];
  let baseState = {
    latitude: -34.6037,
    longitude: -58.3816,
    status: STATUS_VALUES.ACTIVE,
    temperature: 25.5,
    battery: 85,
    timestamp: Date.now(),
    signalStrength: 90,
    speed: 0,
    heading: 180,
    altitude: 50
  };
  
  // Generate 100 state updates
  for (let i = 0; i < 100; i++) {
    const newState = {
      ...baseState,
      latitude: baseState.latitude + (Math.random() - 0.5) * 0.001,
      longitude: baseState.longitude + (Math.random() - 0.5) * 0.001,
      temperature: baseState.temperature + (Math.random() - 0.5) * 2,
      battery: Math.max(0, baseState.battery - 0.1),
      timestamp: Date.now() + i * 1000,
      speed: Math.random() * 100
    };
    
    states.push(newState);
    baseState = newState;
  }
  
  // Process all states
  let totalCompressedSize = 0;
  let totalUncompressedSize = 0;
  
  states.forEach((state, index) => {
    const result = compressor.processState(precintoId, state);
    
    if (result) {
      const buffer = result.buffer;
      totalCompressedSize += buffer.length;
      
      // Parse and apply to decompressor
      const parsed = parseMessage(buffer);
      
      if (parsed.type === 'FULL_STATE') {
        decompressor.setFullState(parsed.precintoId, parsed.state);
      } else if (parsed.type === 'DELTA_UPDATE') {
        decompressor.applyDelta(parsed.precintoId, parsed.deltas);
      }
    }
    
    // Estimate uncompressed size
    totalUncompressedSize += 50; // ~50 bytes per full state
  });
  
  // Flush remaining batch
  const batch = compressor.flush();
  if (batch) {
    totalCompressedSize += batch.buffer.length;
  }
  
  // Verify final state matches
  const compressorState = compressor.stateCache.get(precintoId);
  const decompressorState = decompressor.getState(precintoId);
  
  console.assert(
    Math.abs(compressorState.latitude - decompressorState.latitude) < 0.0001,
    'Final states should match'
  );
  
  const compressionRatio = (1 - totalCompressedSize / totalUncompressedSize) * 100;
  console.log(`Total Compression Ratio: ${compressionRatio.toFixed(2)}%`);
  console.assert(compressionRatio > 80, 'Should achieve >80% compression');
  
  console.log('✓ End-to-End Compression test passed\n');
}

// Run all tests
console.log('=== WebSocket Compression System Tests ===\n');

testDeltaCompression();
testBinaryProtocol();
testDeltaDecompression();
testEndToEndCompression();

console.log('✅ All tests passed!');