'use client';

import { useState } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import type { ActivityModel } from '@/types/activity';
import { NetworkVisualization } from '@/components/network/NetworkVisualization';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { ArtCanvas } from '@/components/art/ArtCanvas';
import { StatsPanel } from './StatsPanel';
import { Controls } from './Controls';
import { ShareDialog, ExportDialog } from '@/components/export';

interface ExperienceViewProps {
  params: UnifiedParameters;
  model: ActivityModel;
}

export function ExperienceView({ params, model }: ExperienceViewProps) {
  const [activeView, setActiveView] = useState<'network' | 'art'>('network');

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* Main visualization area */}
      <div className="absolute inset-0">
        {/* Art canvas (background) */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${activeView === 'art' ? 'opacity-100' : 'opacity-30'}`}>
          <ArtCanvas params={params} />
        </div>

        {/* Network visualization (foreground when active) */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${activeView === 'network' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <NetworkVisualization params={params} model={model} />
        </div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={params.avatarUrl}
              alt={params.username}
              className="w-12 h-12 rounded-full border-2 border-white/20"
            />
            <div>
              <h1 className="text-xl font-bold text-white">{params.username}</h1>
              <p className="text-sm text-gray-400">{params.year} Rewind</p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('network')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'network'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Network
            </button>
            <button
              onClick={() => setActiveView('art')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'art'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Art
            </button>
          </div>
        </div>
      </header>

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
