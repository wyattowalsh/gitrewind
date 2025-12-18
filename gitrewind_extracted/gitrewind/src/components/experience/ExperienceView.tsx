'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import type { ActivityModel } from '@/types/activity';
import { NetworkVisualization } from '@/components/network/NetworkVisualization';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { ArtCanvas } from '@/components/art/ArtCanvas';
import { StatsPanel } from './StatsPanel';
import { Controls } from './Controls';
import { ShareDialog, ExportDialog } from '@/components/export';
import { ErrorBoundary } from '@/components/ui';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '@/hooks';
import { useUIStore } from '@/stores/ui';
import { eventBus } from '@/lib/core/events';
import type { ArtStyle } from '@/types/events';

interface ExperienceViewProps {
  params: UnifiedParameters;
  model: ActivityModel;
}

// Art style names for cycling
const ART_STYLES: ArtStyle[] = ['constellation', 'flowField', 'circuit', 'nebula'];

function ExperienceContent({ params, model }: ExperienceViewProps) {
  const [activeView, setActiveView] = useState<'network' | 'art'>('network');
  const [artStyleIndex, setArtStyleIndex] = useState(0);
  const [beatPulse, setBeatPulse] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { openModal, toggleMute, isMuted } = useUIStore();

  // Current art style
  const currentArtStyle = ART_STYLES[artStyleIndex] ?? 'constellation';

  // Listen for beat events
  useEffect(() => {
    const unsubscribe = eventBus.on('music:beat', () => {
      setBeatPulse(1);
      setTimeout(() => setBeatPulse(0), 100);
    });
    return unsubscribe;
  }, []);

  // Listen for play/pause events
  useEffect(() => {
    const unsubPlay = eventBus.on('music:play', () => setIsPlaying(true));
    const unsubPause = eventBus.on('music:pause', () => setIsPlaying(false));
    const unsubStop = eventBus.on('music:stop', () => setIsPlaying(false));
    return () => {
      unsubPlay();
      unsubPause();
      unsubStop();
    };
  }, []);

  // Toggle handlers
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      eventBus.emit('music:pause', undefined);
    } else {
      eventBus.emit('music:play', undefined);
    }
  }, [isPlaying]);

  const handleToggleView = useCallback(() => {
    setActiveView(prev => prev === 'network' ? 'art' : 'network');
  }, []);

  const handleToggleMute = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleShare = useCallback(() => {
    openModal('share');
  }, [openModal]);

  const handleExport = useCallback(() => {
    openModal('export');
  }, [openModal]);

  // Cycle art style
  const handleCycleArtStyle = useCallback(() => {
    setArtStyleIndex(prev => (prev + 1) % ART_STYLES.length);
  }, []);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePlay: handleTogglePlay,
    onToggleView: handleToggleView,
    onToggleMute: handleToggleMute,
    onShare: handleShare,
    onExport: handleExport,
  });

  // Beat-reactive border glow
  const borderGlow = beatPulse > 0
    ? `0 0 ${20 + beatPulse * 30}px hsla(${params.colors.primary.h}, ${params.colors.primary.s}%, ${params.colors.primary.l}%, 0.5)`
    : 'none';

  return (
    <div
      className="relative min-h-screen bg-gray-900 overflow-hidden transition-shadow duration-100"
      style={{ boxShadow: borderGlow }}
    >
      {/* Main visualization area */}
      <div className="absolute inset-0">
        {/* Art canvas (background) */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${activeView === 'art' ? 'opacity-100' : 'opacity-30'}`}>
          <ArtCanvas params={{ ...params, art: { ...params.art, style: currentArtStyle } }} />
        </div>

        {/* Network visualization (foreground when active) */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${activeView === 'network' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <NetworkVisualization params={params} model={model} />
        </div>
      </div>

      {/* Beat-reactive overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-100"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsla(${params.colors.primary.h}, ${params.colors.primary.s}%, ${params.colors.primary.l}%, ${beatPulse * 0.1}) 0%, transparent 70%)`,
          opacity: beatPulse,
        }}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="relative transition-transform duration-100"
              style={{ transform: `scale(${1 + beatPulse * 0.1})` }}
            >
              <img
                src={params.avatarUrl}
                alt={params.username}
                className="w-12 h-12 rounded-full border-2 border-white/20"
              />
              {/* Beat indicator ring */}
              <div
                className="absolute inset-0 rounded-full transition-opacity duration-100"
                style={{
                  boxShadow: `0 0 ${10 + beatPulse * 20}px hsla(${params.colors.primary.h}, ${params.colors.primary.s}%, ${params.colors.primary.l}%, ${beatPulse * 0.8})`,
                  opacity: beatPulse,
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{params.username}</h1>
              <p className="text-sm text-gray-400">{params.year} Rewind</p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('network')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'network'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Network
            </button>
            <button
              onClick={() => setActiveView('art')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'art'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Art
            </button>
            {activeView === 'art' && (
              <button
                onClick={handleCycleArtStyle}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                title="Change art style"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Keyboard shortcuts hint */}
      <div className="absolute top-20 right-4 z-10 hidden lg:block">
        <div className="glass rounded-lg p-3 text-xs text-gray-400 space-y-1 opacity-50 hover:opacity-100 transition-opacity">
          {KEYBOARD_SHORTCUTS.slice(0, 4).map(({ key, description }) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-gray-500">{key}</span>
              <span>{description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current style indicator */}
      {activeView === 'art' && (
        <div className="absolute top-20 left-4 z-10">
          <div className="glass rounded-lg px-3 py-2 text-xs text-gray-300 capitalize">
            {currentArtStyle.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        </div>
      )}

      {/* Stats panel */}
      <StatsPanel params={params} />

      {/* Music player */}
      <MusicPlayer params={params} />

      {/* Controls */}
      <Controls params={params} />

      {/* Dialogs */}
      <ShareDialog params={params} />
      <ExportDialog params={params} />
    </div>
  );
}

export function ExperienceView({ params, model }: ExperienceViewProps) {
  return (
    <ErrorBoundary>
      <ExperienceContent params={params} model={model} />
    </ErrorBoundary>
  );
}
