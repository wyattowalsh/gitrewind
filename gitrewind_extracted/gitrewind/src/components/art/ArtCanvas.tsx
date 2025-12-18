'use client';

import { useEffect, useRef, useState } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { ArtEngine } from '@/lib/art/engine';
import { useEventBus } from '@/hooks/useEventBus';
import { useExportStore } from '@/stores';
import { isWebGLSupported } from '@/lib/utils/webgl';
import { WebGLFallback } from './WebGLFallback';

interface ArtCanvasProps {
  params: UnifiedParameters;
}

export function ArtCanvas({ params }: ArtCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ArtEngine | null>(null);
  const setArtCanvas = useExportStore((state) => state.setArtCanvas);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  // Check WebGL support on mount
  useEffect(() => {
    setWebglSupported(isWebGLSupported());
  }, []);

  // Initialize engine
  useEffect(() => {
    if (!containerRef.current || webglSupported === null || !webglSupported) return;

    try {
      const engine = new ArtEngine(containerRef.current, params);
      engineRef.current = engine;

      // Register canvas with export store
      setArtCanvas(engine.getCanvas());

      // Animation loop
      let running = true;
      const animate = () => {
        if (!running) return;
        engine.render();
        requestAnimationFrame(animate);
      };
      animate();

      // Clear any previous errors
      setWebglError(null);

      return () => {
        running = false;
        setArtCanvas(null);
        engine.destroy();
      };
    } catch (err) {
      console.error('Failed to initialize WebGL:', err);
      setWebglError(
        err instanceof Error
          ? err.message
          : 'Failed to initialize WebGL renderer. Your browser may not support WebGL.'
      );
      setWebglSupported(false);
    }
  }, [params, setArtCanvas, webglSupported]);

  // Handle beat events
  useEventBus('music:beat', () => {
    engineRef.current?.pulse(1);
  });

  // Handle style change events
  useEventBus('art:style:change', ({ style }) => {
    engineRef.current?.setStyle(style);
  });

  // Show loading state while checking WebGL support
  if (webglSupported === null) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-gray-400">Loading visualization...</div>
      </div>
    );
  }

  // Show fallback if WebGL is not supported or failed to initialize
  if (!webglSupported || webglError) {
    return <WebGLFallback params={params} error={webglError ?? undefined} />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  );
}
