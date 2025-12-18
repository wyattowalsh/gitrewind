'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import type { ActivityModel } from '@/types/activity';
import type { GraphNode } from '@/types/graph';
import { NetworkRenderer } from '@/lib/network/renderer';
import { ForceSimulation, createGraphData } from '@/lib/network/simulation';
import { useEventBus } from '@/hooks/useEventBus';
import { eventBus } from '@/lib/core/events';

interface NetworkVisualizationProps {
  params: UnifiedParameters;
  model: ActivityModel;
}

interface TooltipState {
  node: GraphNode | null;
  position: { x: number; y: number } | null;
}

export function NetworkVisualization({ params, model }: NetworkVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<NetworkRenderer | null>(null);
  const simulationRef = useRef<ForceSimulation | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ node: null, position: null });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Handle node hover
  const handleNodeHover = useCallback((node: GraphNode | null, position: { x: number; y: number } | null) => {
    setTooltip({ node, position });
    eventBus.emit('network:node:hover', { node });
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
    eventBus.emit('network:node:click', { node });
  }, []);

  // Initialize
  useEffect(() => {
    if (!containerRef.current) return;

    // Create renderer
    const renderer = new NetworkRenderer(containerRef.current);
    rendererRef.current = renderer;

    // Set up node interaction callbacks
    renderer.setNodeCallbacks(handleNodeHover, handleNodeClick);

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
  }, [params, model, handleNodeHover, handleNodeClick]);

  // Handle beat events
  useEventBus('music:beat', (beat) => {
    rendererRef.current?.pulse(1);
  });

  return (
    <>
      <div
        ref={containerRef}
        className="w-full h-full cursor-pointer"
        style={{ touchAction: 'none' }}
      />

      {/* Hover Tooltip */}
      {tooltip.node && tooltip.position && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.position.x + 12,
            top: tooltip.position.y - 10,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              {tooltip.node.avatarUrl && (
                <img
                  src={tooltip.node.avatarUrl}
                  alt={tooltip.node.label}
                  className="w-8 h-8 rounded-full border border-white/20"
                />
              )}
              <div>
                <p className="text-white font-medium text-sm">{tooltip.node.label}</p>
                <p className="text-gray-400 text-xs capitalize">{tooltip.node.type}</p>
              </div>
            </div>
            {tooltip.node.type === 'user' && (
              <p className="text-xs text-gray-500 mt-1">Click for details</p>
            )}
          </div>
        </div>
      )}

      {/* Selected Node Panel */}
      {selectedNode && (
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-64 animate-slideIn"
        >
          <div className="glass rounded-xl p-4 border border-white/10">
            {/* Close button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Node info */}
            <div className="flex items-center gap-3 mb-4">
              {selectedNode.avatarUrl ? (
                <img
                  src={selectedNode.avatarUrl}
                  alt={selectedNode.label}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: selectedNode.color }}
                >
                  {selectedNode.label.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold">{selectedNode.label}</h3>
                <p className="text-gray-400 text-sm capitalize">{selectedNode.type}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Influence</span>
                <span className="text-white">{(selectedNode.size * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${selectedNode.size * 100}%`,
                    backgroundColor: selectedNode.color,
                  }}
                />
              </div>
            </div>

            {/* Color indicator */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className="text-gray-400 text-xs">Node color</span>
              </div>
            </div>
          </div>

          {/* Animation keyframes */}
          <style jsx>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-20px) translateY(-50%);
              }
              to {
                opacity: 1;
                transform: translateX(0) translateY(-50%);
              }
            }
            .animate-slideIn {
              animation: slideIn 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
