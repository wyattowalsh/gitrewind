// Force-directed graph simulation
import type { SimulationNode, GraphEdge, GraphData, GraphNode } from '@/types/graph';
import type { ActivityModel } from '@/types/activity';
import type { UnifiedParameters } from '@/types/parameters';
import { createSeededRandom } from '@/lib/utils/random';
import { hslToHex } from '@/lib/utils/color';

interface SimulationConfig {
  centerForce: number;
  repulsionForce: number;
  linkForce: number;
  damping: number;
  minDistance: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
  centerForce: 0.01,
  repulsionForce: 500,
  linkForce: 0.1,
  damping: 0.9,
  minDistance: 30,
};

export class ForceSimulation {
  private nodes: SimulationNode[] = [];
  private edges: GraphEdge[] = [];
  private config: SimulationConfig;
  private rng: () => number;

  constructor(seed: number, config: Partial<SimulationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rng = createSeededRandom(seed);
  }

  setData(data: GraphData): void {
    // Initialize nodes with random positions
    this.nodes = data.nodes.map((node) => ({
      ...node,
      x: node.x ?? (this.rng() - 0.5) * 200,
      y: node.y ?? (this.rng() - 0.5) * 200,
      z: node.z ?? (this.rng() - 0.5) * 200,
      vx: 0,
      vy: 0,
      vz: 0,
    }));

    // Center the user node
    const userNode = this.nodes.find((n) => n.type === 'user');
    if (userNode) {
      userNode.x = 0;
      userNode.y = 0;
      userNode.z = 0;
    }

    this.edges = data.edges;
  }

  tick(): SimulationNode[] {
    // Apply forces
    this.applyRepulsion();
    this.applyLinks();
    this.applyCenter();

    // Update positions
    for (const node of this.nodes) {
      // Apply damping
      node.vx *= this.config.damping;
      node.vy *= this.config.damping;
      node.vz *= this.config.damping;

      // Update position
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
    }

    return this.nodes;
  }

  private applyRepulsion(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i]!;
        const nodeB = this.nodes[j]!;

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dz = nodeB.z - nodeA.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

        if (dist < this.config.minDistance) {
          const force = this.config.repulsionForce / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          const fz = (dz / dist) * force;

          nodeA.vx -= fx;
          nodeA.vy -= fy;
          nodeA.vz -= fz;
          nodeB.vx += fx;
          nodeB.vy += fy;
          nodeB.vz += fz;
        }
      }
    }
  }

  private applyLinks(): void {
    const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));

    for (const edge of this.edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);

      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dz = target.z - source.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      const force = (dist - 50) * this.config.linkForce * edge.weight;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;

      source.vx += fx;
      source.vy += fy;
      source.vz += fz;
      target.vx -= fx;
      target.vy -= fy;
      target.vz -= fz;
    }
  }

  private applyCenter(): void {
    for (const node of this.nodes) {
      // User node stays at center
      if (node.type === 'user') continue;

      node.vx -= node.x * this.config.centerForce;
      node.vy -= node.y * this.config.centerForce;
      node.vz -= node.z * this.config.centerForce;
    }
  }

  getNodes(): SimulationNode[] {
    return this.nodes;
  }

  getEdges(): GraphEdge[] {
    return this.edges;
  }
}

export function createGraphData(model: ActivityModel, params: UnifiedParameters): GraphData {
  const primaryColor = hslToHex(params.colors.primary);

  // Create user node
  const nodes: GraphNode[] = [
    {
      id: model.user.login,
      type: 'user',
      label: model.user.login,
      size: 2,
      color: primaryColor,
      avatarUrl: model.user.avatarUrl,
    },
  ];

  // Create collaborator nodes
  const collaborators = model.collaborators.slice(0, 50);
  for (const collab of collaborators) {
    nodes.push({
      id: collab.login,
      type: 'collaborator',
      label: collab.login,
      size: 0.5 + Math.min(collab.interactions / 10, 1.5),
      color: hslToHex(params.colors.secondary),
      avatarUrl: collab.avatarUrl,
    });
  }

  // If no collaborators, create dummy nodes based on activity
  if (collaborators.length === 0) {
    const dummyRng = createSeededRandom(params.seed);
    const nodeCount = Math.min(Math.ceil(params.intensity * 20) + 5, 25);

    for (let i = 0; i < nodeCount; i++) {
      const hue = (params.colors.primary.h + dummyRng() * 60 - 30 + 360) % 360;
      nodes.push({
        id: `node-${i}`,
        type: 'collaborator',
        label: `Activity ${i + 1}`,
        size: 0.3 + dummyRng() * 0.7,
        color: hslToHex({ h: hue, s: 60, l: 50 }),
      });
    }
  }

  // Create edges
  const edges: GraphEdge[] = [];
  const userNode = nodes[0]!;

  for (let i = 1; i < nodes.length; i++) {
    const node = nodes[i]!;
    edges.push({
      source: userNode.id,
      target: node.id,
      weight: node.size,
    });
  }

  // Add some cross-connections for visual interest
  const rng = createSeededRandom(params.seed + 1);
  for (let i = 1; i < nodes.length; i++) {
    if (rng() > 0.7) {
      const targetIdx = 1 + Math.floor(rng() * (nodes.length - 1));
      if (targetIdx !== i) {
        edges.push({
          source: nodes[i]!.id,
          target: nodes[targetIdx]!.id,
          weight: 0.3,
        });
      }
    }
  }

  return { nodes, edges };
}
