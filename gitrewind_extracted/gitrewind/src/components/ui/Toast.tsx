'use client';

import { useEffect, useState } from 'react';
import { useToastStore, type Toast as ToastType, type ToastType as ToastVariant } from '@/stores/toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Icon mapping for toast types
const TOAST_ICONS: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

// Color mapping for toast types
const TOAST_COLORS: Record<ToastVariant, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    text: 'text-emerald-300',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    text: 'text-red-300',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    text: 'text-amber-300',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    text: 'text-blue-300',
  },
};

interface ToastItemProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = TOAST_ICONS[toast.type];
  const colors = TOAST_COLORS[toast.type];

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle removal with exit animation
  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  // Auto-exit animation before auto-remove
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300);
      return () => clearTimeout(exitTimer);
    }
    return undefined;
  }, [toast.duration]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl
        transition-all duration-300 ease-out
        ${colors.bg} ${colors.border}
        ${isVisible && !isExiting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-white/20">
          <div
            className="h-full bg-white/40 transition-all ease-linear"
            style={{
              width: isExiting ? '0%' : '100%',
              transitionDuration: `${toast.duration}ms`,
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${colors.text}`}>{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-gray-400 mt-0.5">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`text-sm font-medium mt-2 hover:underline ${colors.text}`}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

// Export for backwards compatibility
export { ToastItem };
