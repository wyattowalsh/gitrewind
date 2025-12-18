// Data Store
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ActivityModel } from '@/types/activity';
import { eventBus } from '@/lib/core/events';

interface DataState {
  status: 'idle' | 'fetching' | 'transforming' | 'ready' | 'error';
  progress: number;
  stage: string;
  model: ActivityModel | null;
  error: Error | null;
}

interface DataActions {
  setFetching: (stage: string) => void;
  setProgress: (progress: number, stage: string) => void;
  setTransforming: () => void;
  setReady: (model: ActivityModel) => void;
  setError: (error: Error) => void;
  reset: () => void;
}

export const useDataStore = create<DataState & DataActions>()(
  immer((set) => ({
    status: 'idle',
    progress: 0,
    stage: '',
    model: null,
    error: null,

    setFetching: (stage: string) => {
      set((state) => {
        state.status = 'fetching';
        state.progress = 0;
        state.stage = stage;
        state.error = null;
      });
      eventBus.emit('data:fetch:start', { source: 'github' });
    },

    setProgress: (progress: number, stage: string) => {
      set((state) => {
        state.progress = progress;
        state.stage = stage;
      });
      eventBus.emit('data:fetch:progress', { source: 'github', progress, stage });
    },

    setTransforming: () => {
      set((state) => {
        state.status = 'transforming';
        state.stage = 'Building your symphony...';
      });
    },

    setReady: (model: ActivityModel) => {
      set((state) => {
        state.status = 'ready';
        state.progress = 100;
        state.model = model;
        state.stage = 'Complete!';
      });
      eventBus.emit('data:transform:complete', { model });
    },

    setError: (error: Error) => {
      set((state) => {
        state.status = 'error';
        state.error = error;
      });
      eventBus.emit('data:fetch:error', { source: 'github', error });
    },

    reset: () => {
      set((state) => {
        state.status = 'idle';
        state.progress = 0;
        state.stage = '';
        state.model = null;
        state.error = null;
      });
    },
  }))
);
