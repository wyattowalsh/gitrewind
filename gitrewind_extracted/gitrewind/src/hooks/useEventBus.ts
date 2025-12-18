// Event Bus Hook with auto-cleanup
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { eventBus, type EventMap } from '@/lib/core/events';

export function useEventBus<K extends keyof EventMap>(
  event: K,
  handler: (data: EventMap[K]) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = eventBus.on(event, (data) => {
      handlerRef.current(data);
    });

    return unsubscribe;
  }, [event]);
}

export function useEventEmitter() {
  return useCallback(<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ) => {
    eventBus.emit(event, data);
  }, []);
}
