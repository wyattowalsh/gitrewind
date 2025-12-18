'use client';

import { useState, useEffect } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { useEventBus } from '@/hooks/useEventBus';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface WebGLFallbackProps {
  params: UnifiedParameters;
  error?: string;
}

/**
 * Fallback component displayed when WebGL is not available
 * Provides a static CSS-based visualization as an alternative
 */
export function WebGLFallback({ params, error }: WebGLFallbackProps) {
  const [beatPulse, setBeatPulse] = useState(0);

  // Listen for beat events to add some animation
  useEventBus('music:beat', () => {
    setBeatPulse(1);
    setTimeout(() => setBeatPulse(0), 200);
  });

  const primaryColor = `hsl(${params.colors.primary.h}, ${params.colors.primary.s}%, ${params.colors.primary.l}%)`;
  const secondaryColor = `hsl(${params.colors.secondary.h}, ${params.colors.secondary.s}%, ${params.colors.secondary.l}%)`;

  // Generate deterministic "stars" based on seed
  const stars = Array.from({ length: 50 }, (_, i) => {
    const seededRandom = (n: number) => {
      const x = Math.sin(params.seed * 12.9898 + n * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    return {
      x: seededRandom(i * 2) * 100,
      y: seededRandom(i * 2 + 1) * 100,
      size: 2 + seededRandom(i * 3) * 4,
      opacity: 0.3 + seededRandom(i * 4) * 0.7,
    };
  });

  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-900">
      {/* Gradient background */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, ${primaryColor}20 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, ${secondaryColor}20 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, ${primaryColor}10 0%, transparent 70%)
          `,
          opacity: 0.8 + beatPulse * 0.2,
        }}
      />

      {/* CSS stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full transition-all duration-200"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size * (1 + beatPulse * 0.2)}px`,
            height: `${star.size * (1 + beatPulse * 0.2)}px`,
            backgroundColor: i % 3 === 0 ? primaryColor : secondaryColor,
            opacity: star.opacity * (0.8 + beatPulse * 0.2),
            boxShadow: `0 0 ${star.size * 2}px ${i % 3 === 0 ? primaryColor : secondaryColor}`,
          }}
        />
      ))}

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
        <div
          className="w-24 h-24 rounded-full mb-6 flex items-center justify-center transition-transform duration-200"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            transform: `scale(${1 + beatPulse * 0.1})`,
            boxShadow: `0 0 ${40 + beatPulse * 20}px ${primaryColor}50`,
          }}
        >
          <span className="text-4xl font-bold text-white">{params.username.charAt(0).toUpperCase()}</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{params.username}</h2>
        <p className="text-gray-400 mb-6">{params.year} Git Rewind</p>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div
            className="glass rounded-lg p-4 transition-all duration-200"
            style={{
              transform: `scale(${1 + beatPulse * 0.02})`,
            }}
          >
            <p className="text-2xl font-bold text-white">{params.stats.totalCommits.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Commits</p>
          </div>
          <div
            className="glass rounded-lg p-4 transition-all duration-200"
            style={{
              transform: `scale(${1 + beatPulse * 0.02})`,
            }}
          >
            <p className="text-2xl font-bold text-white">{params.stats.activeDays}</p>
            <p className="text-xs text-gray-400">Active Days</p>
          </div>
          <div
            className="glass rounded-lg p-4 transition-all duration-200"
            style={{
              transform: `scale(${1 + beatPulse * 0.02})`,
            }}
          >
            <p className="text-2xl font-bold text-white">{params.stats.longestStreak}</p>
            <p className="text-xs text-gray-400">Day Streak</p>
          </div>
          <div
            className="glass rounded-lg p-4 transition-all duration-200"
            style={{
              transform: `scale(${1 + beatPulse * 0.02})`,
            }}
          >
            <p className="text-lg font-bold text-white truncate" style={{ color: secondaryColor }}>
              {params.stats.topLanguage}
            </p>
            <p className="text-xs text-gray-400">Top Language</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-8 max-w-md">
            <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-amber-300 font-medium">WebGL Not Available</p>
                <p className="text-xs text-amber-400/80 mt-1">
                  {error || 'Your browser or device does not support WebGL. Showing a simplified view.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  );
}
