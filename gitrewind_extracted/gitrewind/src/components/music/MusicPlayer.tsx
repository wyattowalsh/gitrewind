'use client';

import { useEffect, useRef, useState } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { getMusicPlayer } from '@/lib/music/player';
import { useUIStore } from '@/stores/ui';
import { useEventBus } from '@/hooks/useEventBus';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  params: UnifiedParameters;
}

export function MusicPlayer({ params }: MusicPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef(getMusicPlayer());

  const { isPlaying, setIsPlaying, volume, isMuted, setMuted, setVolume } = useUIStore();

  // Initialize player
  useEffect(() => {
    const player = playerRef.current;

    player.initialize(params).then(() => {
      setIsReady(true);
    });

    return () => {
      player.dispose();
    };
  }, [params]);

  // Update current time
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(playerRef.current.getCurrentTime());
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
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const duration = playerRef.current.getDuration();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6">
      <div className="max-w-2xl mx-auto glass rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-1" />
            )}
          </button>

          {/* Progress bar */}
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume control */}
          <button
            onClick={() => setMuted(!isMuted)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
