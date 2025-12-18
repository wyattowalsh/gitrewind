'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui';
import { useDataStore } from '@/stores/data';

// Fun loading messages for each stage
const LOADING_TIPS = [
  "Scanning your commit history...",
  "Discovering your coding patterns...",
  "Mapping your repository network...",
  "Analyzing your contributions...",
  "Generating your unique soundtrack...",
  "Building your constellation...",
  "Crafting your visual experience...",
];

// Animated code characters
const CODE_CHARS = ['{ }', '< />', '[ ]', '( )', '=> ', '...', '+++', '---', '###'];

export function LoadingScreen() {
  const { progress, stage, status } = useDataStore();
  const [tipIndex, setTipIndex] = useState(0);
  const [codeChars, setCodeChars] = useState<{ char: string; x: number; y: number; delay: number }[]>([]);

  // Rotate tips every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Generate floating code characters
  useEffect(() => {
    const chars = Array.from({ length: 15 }, (_, i) => ({
      char: CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)] ?? '{ }',
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setCodeChars(chars);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 60%)
            `,
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Floating code characters */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {codeChars.map((item, i) => (
          <div
            key={i}
            className="absolute text-gray-700/30 font-mono text-sm animate-float"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            {item.char}
          </div>
        ))}
      </div>

      {/* Central loading container */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo with animated gradient */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-2 animate-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-[length:200%_auto]"
          >
            Git Rewind
          </h1>
          <p className="text-gray-500 text-sm tracking-wider">
            YOUR CODE. YOUR STORY. YOUR SYMPHONY.
          </p>
        </div>

        {/* Progress ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* Background ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              {/* Progress ring */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${progress * 3.51} 351`}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white tabular-nums">
                {Math.round(progress)}
              </span>
              <span className="text-gray-400 text-sm ml-1">%</span>
            </div>
          </div>
        </div>

        {/* Stage text with fade animation */}
        <div className="text-center mb-6 h-12">
          <p className="text-gray-300 text-lg font-medium animate-fadeIn">
            {stage || 'Initializing...'}
          </p>
        </div>

        {/* Linear progress bar (secondary) */}
        <Progress value={progress} className="mb-8" />

        {/* Animated loading indicator */}
        <div className="flex justify-center space-x-3 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
              style={{
                animation: `loadingDot 1.4s ease-in-out ${i * 0.12}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Rotating tip */}
        <div className="text-center h-6">
          <p
            key={tipIndex}
            className="text-gray-500 text-sm animate-fadeSlide"
          >
            {LOADING_TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-gray-400 text-sm">
            {status === 'idle' && 'Ready to begin'}
            {status === 'fetching' && 'Connected to GitHub'}
            {status === 'transforming' && 'Processing data'}
            {status === 'ready' && 'Experience ready'}
            {status === 'error' && 'Connection error'}
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes loadingDot {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.6;
          }
        }
        @keyframes gradient {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        @keyframes fadeSlide {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .animate-fadeSlide {
          animation: fadeSlide 3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
