'use client';

import { Network, Music, Palette, Lock, Sparkles, Share2 } from 'lucide-react';

const features = [
  {
    icon: Network,
    title: '3D Network Constellation',
    description: 'Your collaborators rendered as an explorable constellation using force-directed graphs.',
    color: 'text-blue-400',
  },
  {
    icon: Music,
    title: 'Generative Music',
    description: 'A 90-second original composition generated from your commit patterns and activity.',
    color: 'text-purple-400',
  },
  {
    icon: Palette,
    title: 'Shader Art',
    description: 'GPU-powered generative visuals that pulse and flow with the music.',
    color: 'text-pink-400',
  },
  {
    icon: Lock,
    title: '100% Private',
    description: 'All processing happens in your browser. Zero data stored. Zero tracking.',
    color: 'text-green-400',
  },
  {
    icon: Sparkles,
    title: 'Completely Free',
    description: 'No backend costs, no premium tiers. Everyone gets the full experience.',
    color: 'text-yellow-400',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Export as video, audio, or image. Share your unique URL with friends.',
    color: 'text-cyan-400',
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          Your Year, Reimagined
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Git Rewind transforms your GitHub activity into a deeply personal,
          highly shareable experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
            >
              <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
