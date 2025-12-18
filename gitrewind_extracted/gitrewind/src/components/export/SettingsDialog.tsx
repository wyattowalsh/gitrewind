'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui';
import { X, Volume2, Monitor, Keyboard, Info, Moon, Sun, Zap } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '@/hooks';

export function SettingsDialog() {
  const { modals, closeModal, volume, setVolume, isMuted, setMuted, theme, setTheme } =
    useUIStore();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'shortcuts'>('general');

  // Check for system reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!modals.settings) return null;

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Monitor },
    { id: 'audio' as const, label: 'Audio', icon: Volume2 },
    { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => closeModal('settings')}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={() => closeModal('settings')}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-500 -mb-px'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                        theme === t
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {t === 'dark' && <Moon className="w-4 h-4 inline mr-1" />}
                      {t === 'light' && <Sun className="w-4 h-4 inline mr-1" />}
                      {t === 'system' && <Monitor className="w-4 h-4 inline mr-1" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced motion info */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Reduced Motion
                </label>
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    reducedMotion
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    {reducedMotion
                      ? 'Reduced motion is enabled on your system. Some animations will be simplified.'
                      : 'Reduced motion is controlled by your system preferences. Enable it in your OS accessibility settings to reduce animations.'}
                  </p>
                </div>
              </div>

              {/* Version info */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Git Rewind</span>
                  <span>v1.0.0</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Master volume */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Master Volume
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                  <span className="text-sm text-gray-400 w-12 text-right tabular-nums">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>

              {/* Mute toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Mute Audio</span>
                <button
                  onClick={() => setMuted(!isMuted)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isMuted ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isMuted ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Audio tips */}
              <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>
                      <strong className="text-gray-300">Tip:</strong> Press{' '}
                      <kbd className="px-1 py-0.5 bg-gray-600 rounded text-gray-300">M</kbd> to
                      quickly mute/unmute the audio.
                    </p>
                    <p>The generated music is unique to your GitHub activity and creates a 90-second composition.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Use these keyboard shortcuts to quickly control the experience.
              </p>

              <div className="space-y-2">
                {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 px-3 bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-sm text-gray-300">{description}</span>
                    <kbd className="px-2 py-1 bg-gray-600 rounded text-sm font-mono text-gray-200 min-w-[2.5rem] text-center">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    Keyboard shortcuts work when the main experience view is focused. Click anywhere
                    on the visualization to activate them.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => closeModal('settings')}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
