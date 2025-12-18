// Toast Store
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState & ToastActions>()(
  immer((set, get) => ({
    toasts: [],

    addToast: (toast) => {
      const id = `toast-${++toastCounter}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000,
      };

      set((state) => {
        state.toasts.push(newToast);
      });

      // Auto-remove after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, newToast.duration);
      }

      return id;
    },

    removeToast: (id) => {
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      });
    },

    clearAllToasts: () => {
      set((state) => {
        state.toasts = [];
      });
    },
  }))
);

// Convenience functions
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'success', title, message, ...options }),
  error: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'error', title, message, ...options }),
  warning: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, ...options }),
  info: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'info', title, message, ...options }),
};
