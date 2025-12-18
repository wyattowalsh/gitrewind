'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { GitCommit, Calendar, Flame, Code, Star, Users, TrendingUp } from 'lucide-react';
import { eventBus } from '@/lib/core/events';

interface StatsPanelProps {
  params: UnifiedParameters;
}

// Animated counter hook
function useAnimatedCounter(targetValue: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * targetValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return count;
}

// Individual stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  maxValue,
  color,
  delay,
  beatPulse,
}: {
  icon: typeof GitCommit;
  label: string;
  value: string;
  numericValue?: number;
  maxValue?: number;
  color: string;
  delay: number;
  beatPulse: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const animatedValue = useAnimatedCounter(numericValue ?? 0, 2000);

  // Delay the visibility for staggered animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const progress = maxValue && numericValue ? (numericValue / maxValue) * 100 : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/5 p-3 border border-white/10 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transform: `scale(${1 + beatPulse * 0.02})`,
        boxShadow: beatPulse > 0 ? `0 0 ${20 * beatPulse}px ${color}40` : 'none',
      }}
    >
      {/* Beat-reactive glow */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-100"
        style={{
          background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
          opacity: beatPulse * 0.5,
        }}
      />

      <div className="relative flex items-center gap-3">
        {/* Icon with beat pulse */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-100"
          style={{
            backgroundColor: `${color}20`,
            transform: `scale(${1 + beatPulse * 0.1})`,
          }}
        >
          <Icon
            className="w-5 h-5 transition-colors duration-300"
            style={{ color }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">{label}</p>
          <p className="text-lg font-bold text-white tabular-nums">
            {numericValue !== undefined ? animatedValue.toLocaleString() : value}
            {label.includes('Streak') && numericValue !== undefined && ' days'}
          </p>
        </div>
      </div>

      {/* Progress bar for applicable stats */}
      {progress > 0 && (
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: isVisible ? `${progress}%` : '0%',
              backgroundColor: color,
              boxShadow: beatPulse > 0 ? `0 0 10px ${color}` : 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}

export function StatsPanel({ params }: StatsPanelProps) {
  const [beatPulse, setBeatPulse] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Listen for beat events
  useEffect(() => {
    const unsubscribe = eventBus.on('music:beat', () => {
      setBeatPulse(1);
      setTimeout(() => setBeatPulse(0), 150);
    });
    return unsubscribe;
  }, []);

  const primaryColor = `hsl(${params.colors.primary.h}, ${params.colors.primary.s}%, ${params.colors.primary.l}%)`;
  const secondaryColor = `hsl(${params.colors.secondary.h}, ${params.colors.secondary.s}%, ${params.colors.secondary.l}%)`;

  const stats = [
    {
      icon: GitCommit,
      label: 'Total Commits',
      value: params.stats.totalCommits.toLocaleString(),
      numericValue: params.stats.totalCommits,
      maxValue: 1000,
      color: primaryColor,
    },
    {
      icon: Calendar,
      label: 'Active Days',
      value: params.stats.activeDays.toLocaleString(),
      numericValue: params.stats.activeDays,
      maxValue: 365,
      color: '#10b981',
    },
    {
      icon: Flame,
      label: 'Longest Streak',
      value: `${params.stats.longestStreak} days`,
      numericValue: params.stats.longestStreak,
      maxValue: 100,
      color: '#f59e0b',
    },
    {
      icon: Code,
      label: 'Top Language',
      value: params.stats.topLanguage,
      color: secondaryColor,
    },
  ];

  const extraStats = [
    {
      icon: TrendingUp,
      label: 'Productivity Score',
      value: Math.round((params.stats.activeDays / 365) * 100) + '%',
      numericValue: Math.round((params.stats.activeDays / 365) * 100),
      maxValue: 100,
      color: '#8b5cf6',
    },
    {
      icon: Star,
      label: 'Average Commits/Day',
      value: (params.stats.totalCommits / Math.max(params.stats.activeDays, 1)).toFixed(1),
      numericValue: Math.round(params.stats.totalCommits / Math.max(params.stats.activeDays, 1)),
      maxValue: 20,
      color: '#ec4899',
    },
  ];

  const displayStats = isExpanded ? [...stats, ...extraStats] : stats;

  // On mobile, only show first 2 stats when not expanded
  const mobileStats = isExpanded ? stats.slice(0, 4) : stats.slice(0, 2);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="sm:hidden absolute bottom-28 left-2 z-20 glass rounded-full p-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Stats panel */}
      <div
        className={`absolute bottom-28 sm:bottom-24 left-2 sm:left-4 md:left-6 z-20 w-44 sm:w-56 md:w-64 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none sm:opacity-100 sm:translate-x-0 sm:pointer-events-auto'
        }`}
      >
        {/* Main container with glassmorphism */}
        <div className="glass rounded-xl overflow-hidden">
          {/* Header */}
          <div
            className="px-3 sm:px-4 py-2 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="text-xs sm:text-sm font-semibold text-white">Your Stats</h3>
            <button
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Stats grid - show fewer on mobile */}
          <div className="p-2 sm:p-3 space-y-2">
            {/* Mobile view */}
            <div className="sm:hidden">
              {mobileStats.map((stat, index) => (
                <div key={stat.label} className="mb-2 last:mb-0">
                  <StatCard
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    numericValue={stat.numericValue}
                    maxValue={stat.maxValue}
                    color={stat.color}
                    delay={index * 100}
                    beatPulse={beatPulse}
                  />
                </div>
              ))}
            </div>
            {/* Desktop view */}
            <div className="hidden sm:block space-y-2">
              {displayStats.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  numericValue={stat.numericValue}
                  maxValue={stat.maxValue}
                  color={stat.color}
                  delay={index * 100}
                  beatPulse={beatPulse}
                />
              ))}
            </div>
          </div>

          {/* Year badge */}
          <div className="px-3 sm:px-4 py-2 border-t border-white/10 flex items-center justify-center">
            <span
              className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
              }}
            >
              {params.year} Wrapped
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
