'use client';

import type { UnifiedParameters } from '@/types/parameters';
import { GitCommit, Calendar, Flame, Code } from 'lucide-react';

interface StatsPanelProps {
  params: UnifiedParameters;
}

export function StatsPanel({ params }: StatsPanelProps) {
  const stats = [
    {
      icon: GitCommit,
      label: 'Commits',
      value: params.stats.totalCommits.toLocaleString(),
    },
    {
      icon: Calendar,
      label: 'Active Days',
      value: params.stats.activeDays.toLocaleString(),
    },
    {
      icon: Flame,
      label: 'Longest Streak',
      value: `${params.stats.longestStreak} days`,
    },
    {
      icon: Code,
      label: 'Top Language',
      value: params.stats.topLanguage,
    },
  ];

  return (
    <div className="absolute bottom-24 left-4 md:left-6 z-20">
      <div className="glass rounded-xl p-4 space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <stat.icon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
