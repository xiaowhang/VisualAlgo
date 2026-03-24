import type { GraphEdge, GraphNode } from '@/types/algorithm';

export const graphNodes: GraphNode[] = [
  { id: 'A', x: 120, y: 80 },
  { id: 'B', x: 250, y: 60 },
  { id: 'C', x: 360, y: 140 },
  { id: 'D', x: 220, y: 170 },
  { id: 'E', x: 340, y: 250 },
  { id: 'F', x: 140, y: 270 },
];

export const graphEdges: GraphEdge[] = [
  { source: 'A', target: 'B' },
  { source: 'A', target: 'D' },
  { source: 'B', target: 'C' },
  { source: 'B', target: 'D' },
  { source: 'C', target: 'E' },
  { source: 'D', target: 'E' },
  { source: 'D', target: 'F' },
  { source: 'E', target: 'F' },
];

export const adjacencyList = new Map<string, string[]>([
  ['A', ['B', 'D']],
  ['B', ['A', 'C', 'D']],
  ['C', ['B', 'E']],
  ['D', ['A', 'B', 'E', 'F']],
  ['E', ['C', 'D', 'F']],
  ['F', ['D', 'E']],
]);
