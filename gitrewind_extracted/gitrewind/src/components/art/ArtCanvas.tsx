'use client';

import { useEffect, useRef } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { ArtEngine } from '@/lib/art/engine';
import { useEventBus } from '@/hooks/useEventBus';

interface ArtCanvasProps {
  params: UnifiedParameters;
}

export function ArtCanvas({ params }: ArtCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ArtEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new ArtEngine(containerRef.current, params);
    engineRef.current = engine;

    // Animation loop
    let running = true;
    const animate = () => {
      if (!running) return;
      engine.render();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      running = false;
      engine.destroy();
    };
  }, [params]);

  // Handle beat events
  useEventBus('music:beat', () => {
    engineRef.current?.pulse(1);
  });

  // Handle style change events
  useEventBus('art:style:change', ({ style }) => {
    engineRef.current?.setStyle(style);
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  );
}
