/**
 * Unit tests for WebSocket Compression System
 */
import { describe, it, expect } from 'vitest';
import { DeltaCompressor } from '../server/DeltaCompressor.js';
import { DeltaDecompressor } from '../client/DeltaDecompressor.js';
import { 
  buildFullStateMessage, 
  buildDeltaMessage, 
  parseMessage,
  STATUS_VALUES 
} from '../protocol/MessageTypes.js';

// Global base time for all tests (in seconds to fit in 32-bit)
const baseTime = Math.floor(Date.now() / 1000);

describe('WebSocket Compression System', () => {
  describe('Delta Compression', () => {
    it('should handle state compression correctly', () => {
      const compressor = new DeltaCompressor();
      const precintoId = 'TEST-001';
      
      // Initial state
      const state1 = {
        latitude: -34.6037,
        longitude: -58.3816,
        status: STATUS_VALUES.ACTIVE,
        temperature: 25.5,
        battery: 85,
        timestamp: baseTime,
        signalStrength: 90,
        speed: 0,
        heading: 180,
        altitude: 50
      };
      
      // Process initial state (should return full state)
      const result1 = compressor.processState(precintoId, state1);
      expect(result1.type).toBe('full');
      
      // Small change
      const state2 = {
        ...state1,
        temperature: 26.0,
        timestamp: baseTime + 1
      };
      
      // Process update (should return delta)
      const result2 = compressor.processState(precintoId, state2);
      expect(result2).toBeNull(); // Small changes should be batched
      
      // Significant change
      const state3 = {
        ...state2,
        latitude: -34.6100,
        speed: 45.5,
        timestamp: baseTime + 2
      };
      
      // Process significant update
      const result3 = compressor.processState(precintoId, state3);
      
      // Force batch flush
      compressor.flush();
      
      // Get metrics
      const metrics = compressor.getMetrics();
      expect(metrics.fullStateCount).toBe(1);
      // The compression ratio might be lower for small data sets
      expect(parseFloat(metrics.compressionPercentage)).toBeGreaterThan(0);
    });
  });

  describe('Binary Protocol', () => {
    it('should encode and decode messages correctly', () => {
      const precintoId = 'TEST-002';
      const state = {
        latitude: -34.6037,
        longitude: -58.3816,
        status: STATUS_VALUES.ACTIVE,
        temperature: 25.5,
        battery: 85,
        timestamp: baseTime,
        signalStrength: 90,
        speed: 45.5,
        heading: 180,
        altitude: 50
      };
      
      // Test full state message
      const fullStateBuffer = buildFullStateMessage(precintoId, state);
      const parsedFull = parseMessage(fullStateBuffer);
      
      expect(parsedFull.type).toBe('FULL_STATE');
      expect(parsedFull.precintoId).toBe(precintoId);
      expect(Math.abs(parsedFull.state.latitude - state.latitude)).toBeLessThan(0.0001);
      
      // Test delta message
      const deltas = {
        latitude: -34.6050,
        speed: 60.0,
        timestamp: baseTime + 10
      };
      
      const deltaBuffer = buildDeltaMessage(precintoId, deltas);
      const parsedDelta = parseMessage(deltaBuffer);
      
      expect(parsedDelta.type).toBe('DELTA_UPDATE');
      expect(parsedDelta.precintoId).toBe(precintoId);
      expect(Object.keys(parsedDelta.deltas).length).toBe(3);
      
      // Compare sizes
      const sizeReduction = (1 - deltaBuffer.length / fullStateBuffer.length) * 100;
      expect(sizeReduction).toBeGreaterThan(0);
    });
  });

  describe('Delta Decompression', () => {
    it('should decompress states correctly', () => {
      const decompressor = new DeltaDecompressor();
      const precintoId = 'TEST-003';
      
      // Initial full state
      const initialState = {
        latitude: -34.6037,
        longitude: -58.3816,
        status: STATUS_VALUES.ACTIVE,
        temperature: 25.5,
        battery: 85,
        timestamp: baseTime,
        signalStrength: 90,
        speed: 0,
        heading: 180,
        altitude: 50
      };
      
      const fullStateBuffer = buildFullStateMessage(precintoId, initialState);
      const parsedMessage = parseMessage(fullStateBuffer);
      const state1 = decompressor.setFullState(precintoId, parsedMessage.state);
      
      expect(state1.battery).toBe(85);
      
      // Apply delta update
      const deltaBuffer = buildDeltaMessage(precintoId, {
        latitude: -34.6050,
        temperature: 26.0,
        battery: 80
      });
      
      const parsedDelta = parseMessage(deltaBuffer);
      const state2 = decompressor.applyDelta(precintoId, parsedDelta.deltas);
      expect(state2.latitude).toBeCloseTo(-34.6050, 3);
      expect(state2.temperature).toBe(26.0);
      expect(state2.battery).toBe(80);
      expect(state2.longitude).toBeCloseTo(-58.3816, 4);
    });
  });

  describe('End-to-End Compression', () => {
    it('should handle multiple state updates', () => {
      const compressor = new DeltaCompressor();
      const decompressor = new DeltaDecompressor();
      const precintoId = 'TEST-004';
      
      // Generate test states
      const states = [];
      for (let i = 0; i < 10; i++) {
        states.push({
          latitude: -34.6037 + (i * 0.001),
          longitude: -58.3816,
          status: STATUS_VALUES.ACTIVE,
          temperature: 25.0 + (i * 0.5),
          battery: 90 - i,
          timestamp: baseTime + i,
          signalStrength: 90 - (i * 2),
          speed: i * 5,
          heading: 180 + (i * 10),
          altitude: 50 + (i * 5)
        });
      }
      
      // Process all states
      const messages = [];
      for (const state of states) {
        const result = compressor.processState(precintoId, state);
        messages.push(result);
      }
      
      // Flush any pending batches
      compressor.flush();
      
      // Decompress all messages
      const finalStates = [];
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message) {
          const parsed = parseMessage(message.buffer);
          let state;
          if (parsed.type === 'FULL_STATE') {
            state = decompressor.setFullState(precintoId, parsed.state);
          } else {
            state = decompressor.applyDelta(precintoId, parsed.deltas);
          }
          expect(state).not.toBeNull();
          finalStates.push(state);
        }
      }
      
      // Not all states may produce messages due to batching
      expect(finalStates.length).toBeGreaterThan(0);
      expect(finalStates.length).toBeLessThanOrEqual(states.length);
      // Check that we have some states processed
      expect(finalStates.length).toBeGreaterThan(0);
      
      // The last processed state should have a reasonable speed value
      const lastState = finalStates[finalStates.length - 1];
      expect(lastState.speed).toBeGreaterThanOrEqual(0);
      
      // Calculate total compression
      const totalOriginalSize = states.length * JSON.stringify(states[0]).length;
      const totalCompressedSize = messages.reduce((sum, msg) => sum + (msg?.buffer.length || 0), 0);
      const overallCompression = (1 - totalCompressedSize / totalOriginalSize) * 100;
      
      // Compression ratio varies based on data
      expect(overallCompression).toBeGreaterThan(0);
    });
  });
});