// Auth Store - Tokens in MEMORY ONLY
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UserProfile } from '@/types/events';
import { eventBus } from '@/lib/core/events';

interface AuthState {
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  token: string | null;  // MEMORY ONLY - never persist!
  user: UserProfile | null;
  error: Error | null;
}

interface AuthActions {
  setLoading: () => void;
  setAuthenticated: (token: string, user: UserProfile) => void;
  setError: (error: Error) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set) => ({
    status: 'idle',
    token: null,
    user: null,
    error: null,

    setLoading: () => {
      set((state) => {
        state.status = 'loading';
        state.error = null;
      });
    },

    setAuthenticated: (token: string, user: UserProfile) => {
      set((state) => {
        state.status = 'authenticated';
        state.token = token;
        state.user = user;
        state.error = null;
      });
      eventBus.emit('auth:success', { token, user });
    },

    setError: (error: Error) => {
      set((state) => {
        state.status = 'error';
        state.error = error;
        state.token = null;
        state.user = null;
      });
      eventBus.emit('auth:error', { error });
    },

    logout: () => {
      set((state) => {
        state.status = 'idle';
        state.token = null;
        state.user = null;
        state.error = null;
      });
      eventBus.emit('auth:logout', undefined);
    },
  }))
);
