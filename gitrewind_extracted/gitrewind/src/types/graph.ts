// Graph Types for Git Rewind

export interface GraphNode {
  id: string;
  type: 'user' | 'collaborator';
  label: string;
  size: number;
  color: string;
  avatarUrl?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
