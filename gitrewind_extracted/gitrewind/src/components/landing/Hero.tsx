'use client';

import { Button } from '@/components/ui';
import { Github } from 'lucide-react';

export function Hero() {
  const handleConnect = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black" />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Logo/Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Git Rewind
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-2">
          Your code. Your story. Your symphony.
        </p>

        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Transform your year of GitHub activity into an immersive, multi-sensory experience
          with 3D visualizations, generative music, and shader-powered art.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-gray-400">
          <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <span className="text-blue-400">3D</span> Network Constellation
          </span>
          <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <span className="text-purple-400">90s</span> Original Composition
          </span>
          <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <span className="text-pink-400">GPU</span> Shader Art
          </span>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={handleConnect}
          className="text-lg px-8 py-4"
        >
          <Github className="w-5 h-5 mr-2" />
          Connect GitHub
        </Button>

        {/* Privacy note */}
        <p className="mt-6 text-sm text-gray-500 max-w-md mx-auto">
          100% client-side processing. Your data never leaves your browser.
          No backend database. No tracking. Open source.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-gray-600 rounded-full" />
        </div>
      </div>
    </section>
  );
}
