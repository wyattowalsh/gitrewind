'use client';

import { useEffect, useRef } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import type { ActivityModel } from '@/types/activity';
import { NetworkRenderer } from '@/lib/network/renderer';
import { ForceSimulation, createGraphData } from '@/lib/network/simulation';
import { useEventBus } from '@/hooks/useEventBus';

interface NetworkVisualizationProps {
  params: UnifiedParameters;
  model: ActivityModel;
}

export function NetworkVisualization({ params, model }: NetworkVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<NetworkRenderer | null>(null);
  const simulationRef = useRef<ForceSimulation | null>(null);

  // Initialize
  useEffect(() => {
    if (!containerRef.current) return;

    // Create renderer
    const renderer = new NetworkRenderer(containerRef.current);
    rendererRef.current = renderer;

    // Create simulation
    const simulation = new ForceSimulation(params.seed);
    simulationRef.current = simulation;

    // Set up graph data
    const graphData = createGraphData(model, params);
    simulation.setData(graphData);

    // Run simulation for initial layout
    for (let i = 0; i < 100; i++) {
      simulation.tick();
    }

    // Set initial positions
    const nodes = simulation.getNodes();
    const edges = simulation.getEdges();
    renderer.setNodes(nodes, params);
    renderer.setEdges(edges, nodes);

    // Animation loop
    let running = true;
    let frame = 0;

    const animate = () => {
      if (!running) return;

      frame++;

      // Run simulation occasionally
      if (frame % 3 === 0) {
        simulation.tick();
        renderer.updateNodePositions(simulation.getNodes());
      }

      renderer.render();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      renderer.destroy();
    };
  }, [params, model]);

  // Handle beat events
  useEventBus('music:beat', (beat) => {
    rendererRef.current?.pulse(1);
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
