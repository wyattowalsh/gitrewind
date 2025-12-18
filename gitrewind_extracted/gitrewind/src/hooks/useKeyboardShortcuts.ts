'use client';

import { useEffect, useCallback } from 'react';
import { eventBus } from '@/lib/core/events';

interface KeyboardShortcutsOptions {
  onTogglePlay?: () => void;
  onToggleView?: () => void;
  onToggleMute?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onToggleView,
  onToggleMute,
  onShare,
  onExport,
  enabled = true,
}: KeyboardShortcutsOptions = {}) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (event.key) {
      case ' ':
        event.preventDefault();
        onTogglePlay?.();
        break;
      case 'Tab':
        event.preventDefault();
        onToggleView?.();
        break;
      case 'm':
      case 'M':
        onToggleMute?.();
        break;
      case 's':
      case 'S':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          onShare?.();
        }
        break;
      case 'e':
      case 'E':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          onExport?.();
        }
        break;
      case 'ArrowLeft':
        eventBus.emit('music:seek', { position: -5 });
        break;
      case 'ArrowRight':
        eventBus.emit('music:seek', { position: 5 });
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Volume up handled by UI store
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Volume down handled by UI store
        break;
      case 'Escape':
        // Close any open dialogs
        break;
    }
  }, [onTogglePlay, onToggleView, onToggleMute, onShare, onExport]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

// Keyboard shortcut help display
export const KEYBOARD_SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause' },
  { key: 'Tab', description: 'Toggle View' },
  { key: 'M', description: 'Mute / Unmute' },
  { key: '←/→', description: 'Seek backward/forward' },
  { key: '⌘S', description: 'Share' },
  { key: '⌘E', description: 'Export' },
];
