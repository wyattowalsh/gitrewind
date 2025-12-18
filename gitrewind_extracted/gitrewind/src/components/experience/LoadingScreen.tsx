'use client';

import { useEffect } from 'react';
import { Progress } from '@/components/ui';
import { useDataStore } from '@/stores/data';

export function LoadingScreen() {
  const { progress, stage, status } = useDataStore();

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo */}
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Git Rewind
        </h1>

        {/* Progress bar */}
        <Progress value={progress} className="mb-4" />

        {/* Stage text */}
        <p className="text-center text-gray-400 text-lg mb-2">
          {stage || 'Initializing...'}
        </p>

        {/* Progress percentage */}
        <p className="text-center text-gray-500 text-sm">
          {Math.round(progress)}% complete
        </p>

        {/* Animated dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-gray-500 text-sm">
          {status === 'fetching' && 'Fetching your GitHub data...'}
          {status === 'transforming' && 'Analyzing your coding patterns...'}
        </p>
      </div>
    </div>
  );
}
