// Typed Event Bus for Git Rewind
import mitt from 'mitt';
import type { EventMap } from '@/types/events';

// Create emitter with explicit type
const emitter = mitt<EventMap>();

export const eventBus = {
  on: <K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
  ): (() => void) => {
    emitter.on(event, handler as (data: EventMap[K]) => void);
    return () => emitter.off(event, handler as (data: EventMap[K]) => void);
  },

  emit: <K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): void => {
    emitter.emit(event, data);
  },

  off: <K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
  ): void => {
    emitter.off(event, handler as (data: EventMap[K]) => void);
  },

  clear: (): void => {
    emitter.all.clear();
  },
};

export type { EventMap };
