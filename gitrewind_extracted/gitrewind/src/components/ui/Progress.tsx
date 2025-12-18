'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className, showLabel = false }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-gray-400 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
