/**
 * Middlewares personalizados para Zustand
 * Exporta todos los middlewares y helpers
 * By Cheva
 */

export { logger, type LoggerConfig } from './logger';

// Re-exportar middlewares de zustand para conveniencia
export { devtools } from 'zustand/middleware';
export { persist, createJSONStorage } from 'zustand/middleware';
export { subscribeWithSelector } from 'zustand/middleware';
export { immer } from 'zustand/middleware/immer';

// Re-exportar tipos útiles
export type { StateCreator, StoreMutatorIdentifier } from 'zustand';