// Parameters Store
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UnifiedParameters } from '@/types/parameters';
import { eventBus } from '@/lib/core/events';

interface ParamsState {
  status: 'idle' | 'computing' | 'ready';
  values: UnifiedParameters | null;
  overrides: Partial<UnifiedParameters>;
}

interface ParamsActions {
  setComputing: () => void;
  setReady: (params: UnifiedParameters) => void;
  setOverrides: (overrides: Partial<UnifiedParameters>) => void;
  reset: () => void;
}

export const useParamsStore = create<ParamsState & ParamsActions>()(
  immer((set, get) => ({
    status: 'idle',
    values: null,
    overrides: {},

    setComputing: () => {
      set((state) => {
        state.status = 'computing';
      });
      eventBus.emit('params:computing', undefined);
    },

    setReady: (params: UnifiedParameters) => {
      set((state) => {
        state.status = 'ready';
        state.values = params;
      });
      eventBus.emit('params:ready', { params });
    },

    setOverrides: (overrides: Partial<UnifiedParameters>) => {
      set((state) => {
        state.overrides = { ...state.overrides, ...overrides };
      });
      const current = get().values;
      if (current) {
        eventBus.emit('params:updated', { params: overrides, source: 'user' });
      }
    },

    reset: () => {
      set((state) => {
        state.status = 'idle';
        state.values = null;
        state.overrides = {};
      });
    },
  }))
);

// Selector to get merged params (base + overrides)
export function getMergedParams(state: ParamsState): UnifiedParameters | null {
  if (!state.values) return null;
  return { ...state.values, ...state.overrides };
}
