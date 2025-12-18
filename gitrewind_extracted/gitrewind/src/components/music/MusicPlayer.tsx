'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { getMusicPlayer } from '@/lib/music/player';
import { useUIStore } from '@/stores/ui';
import { useEventBus } from '@/hooks/useEventBus';
import { eventBus } from '@/lib/core/events';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Music2 } from 'lucide-react';

interface MusicPlayerProps {
  params: UnifiedParameters;
}

// Section colors for visual indicators
const SECTION_COLORS: Record<string, string> = {
  intro: '#3b82f6',
  verse: '#10b981',
  chorus: '#f59e0b',
  bridge: '#8b5cf6',
  outro: '#ec4899',
};

const SECTION_LABELS: Record<string, string> = {
  intro: 'Intro',
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  outro: 'Outro',
};

export function MusicPlayer({ params }: MusicPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sections, setSections] = useState<Array<{ name: string; startTime: number; duration: number }>>([]);
  const [beatPulse, setBeatPulse] = useState(0);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const playerRef = useRef(getMusicPlayer());

  const { isPlaying, setIsPlaying, volume, isMuted, setMuted, setVolume } = useUIStore();

  // Initialize player
  useEffect(() => {
    const player = playerRef.current;

    player.initialize(params).then(() => {
      setIsReady(true);
      setSections(player.getSections());
    });

    return () => {
      player.dispose();
    };
  }, [params]);

  // Listen for beat events
  useEffect(() => {
    const unsubscribe = eventBus.on('music:beat', () => {
      setBeatPulse(1);
      setTimeout(() => setBeatPulse(0), 100);
    });
    return unsubscribe;
  }, []);

  // Update current time and section
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
      setCurrentSection(playerRef.current.getCurrentSection());
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    playerRef.current.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Listen for music events
  useEventBus('music:complete', () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSection(null);
  });

  const handlePlayPause = async () => {
    const player = playerRef.current;

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      await player.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    playerRef.current.seek(time);
    setCurrentTime(time);
    setCurrentSection(playerRef.current.getCurrentSection());
  };

  const handleSkipToSection = (sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= sections.length) return;
    const section = sections[sectionIndex];
    if (section) {
      playerRef.current.seek(section.startTime);
      setCurrentTime(section.startTime);
      setCurrentSection(section.name);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const duration = playerRef.current.getDuration();

  // Find current section index
  const currentSectionIndex = useMemo(() => {
    return sections.findIndex(s => s.name === currentSection);
  }, [sections, currentSection]);

  // Primary color from params
  const primaryColor = `hsl(${params.colors.primary.h}, ${params.colors.primary.s}%, ${params.colors.primary.l}%)`;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 p-2 sm:p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Section indicator bar - hidden on small screens */}
        <div className="mb-2 hidden sm:flex items-center gap-1 px-2">
          {sections.map((section, index) => {
            const widthPercent = (section.duration / duration) * 100;
            const isActive = section.name === currentSection;
            const isPast = currentTime > section.startTime + section.duration;

            return (
              <button
                key={section.name}
                onClick={() => handleSkipToSection(index)}
                className="h-1.5 rounded-full transition-all duration-300 hover:h-2.5 cursor-pointer relative group"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: isActive
                    ? SECTION_COLORS[section.name] || '#fff'
                    : isPast
                      ? `${SECTION_COLORS[section.name] || '#fff'}80`
                      : `${SECTION_COLORS[section.name] || '#fff'}30`,
                  boxShadow: isActive ? `0 0 10px ${SECTION_COLORS[section.name] || '#fff'}` : 'none',
                }}
              >
                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {SECTION_LABELS[section.name] || section.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="glass rounded-xl p-3 sm:p-4 relative overflow-hidden">
          {/* Beat-reactive background glow */}
          <div
            className="absolute inset-0 transition-opacity duration-100 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center bottom, ${primaryColor}20 0%, transparent 70%)`,
              opacity: beatPulse,
            }}
          />

          <div className="relative flex items-center gap-2 sm:gap-4">
            {/* Play/Pause button with beat pulse */}
            <button
              onClick={handlePlayPause}
              disabled={!isReady}
              className="relative w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
              style={{
                transform: `scale(${1 + beatPulse * 0.05})`,
                boxShadow: isPlaying && beatPulse > 0
                  ? `0 0 ${20 + beatPulse * 20}px ${primaryColor}50`
                  : 'none',
              }}
            >
              {/* Animated ring */}
              {isPlaying && (
                <div
                  className="absolute inset-0 rounded-full border-2 transition-opacity duration-100"
                  style={{
                    borderColor: primaryColor,
                    opacity: beatPulse * 0.6,
                    transform: `scale(${1 + beatPulse * 0.2})`,
                  }}
                />
              )}
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
              )}
            </button>

            {/* Middle section - Progress and info */}
            <div className="flex-1 min-w-0">
              {/* Current section label - hidden on small screens */}
              <div className="hidden sm:flex items-center gap-2 mb-2">
                <Music2 className="w-4 h-4 text-gray-400" />
                <span
                  className="text-sm font-medium transition-colors duration-300"
                  style={{ color: currentSection ? SECTION_COLORS[currentSection] : '#9ca3af' }}
                >
                  {currentSection ? SECTION_LABELS[currentSection] : 'Ready to play'}
                </span>
                {isPlaying && (
                  <div className="flex gap-1 ml-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full transition-all duration-100"
                        style={{
                          height: `${8 + beatPulse * 8 * ((i + 1) / 3)}px`,
                          opacity: 0.5 + beatPulse * 0.5,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Progress bar with sections overlay */}
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                {/* Section backgrounds */}
                <div className="absolute inset-0 flex">
                  {sections.map((section) => {
                    const widthPercent = (section.duration / duration) * 100;
                    return (
                      <div
                        key={section.name}
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: `${SECTION_COLORS[section.name] || '#fff'}10`,
                          borderRight: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Progress fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                  style={{
                    width: `${(currentTime / duration) * 100}%`,
                    background: currentSection
                      ? `linear-gradient(90deg, ${SECTION_COLORS[currentSection]}80, ${SECTION_COLORS[currentSection]})`
                      : primaryColor,
                    boxShadow: beatPulse > 0
                      ? `0 0 10px ${currentSection ? SECTION_COLORS[currentSection] : primaryColor}`
                      : 'none',
                  }}
                />

                {/* Seek input overlay */}
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Time display */}
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span className="tabular-nums">{formatTime(currentTime)}</span>
                <span className="tabular-nums">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Skip buttons - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => handleSkipToSection(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex <= 0}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
              >
                <SkipBack className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => handleSkipToSection(currentSectionIndex + 1)}
                disabled={currentSectionIndex >= sections.length - 1}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
              >
                <SkipForward className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setMuted(!isMuted)}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </button>

              {/* Volume slider - hidden on mobile */}
              <div className="hidden sm:block relative w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(isMuted ? 0 : volume) * 100}%`,
                    backgroundColor: primaryColor,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
