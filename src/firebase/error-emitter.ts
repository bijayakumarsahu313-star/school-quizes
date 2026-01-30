import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

// Type definition for the events that can be emitted.
type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// A typed event emitter for application-wide events.
class TypedEventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private emitter = new EventEmitter();

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>) {
    this.emitter.emit(event as string, ...args);
  }

  on<K extends keyof T>(event: K, listener: T[K]) {
    this.emitter.on(event as string, listener);
  }

  off<K extends keyof T>(event: K, listener: T[K]) {
    this.emitter.off(event as string, listener);
  }
}

// Global error emitter instance.
export const errorEmitter = new TypedEventEmitter<AppEvents>();
