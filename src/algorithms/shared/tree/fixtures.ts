import type { GraphEdge, GraphNode } from '@/types/algorithm';

export function getDefaultBST(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { id: '8', x: 0, y: 0 },
    { id: '3', x: 0, y: 0 },
    { id: '10', x: 0, y: 0 },
    { id: '1', x: 0, y: 0 },
    { id: '6', x: 0, y: 0 },
    { id: '14', x: 0, y: 0 },
    { id: '4', x: 0, y: 0 },
    { id: '7', x: 0, y: 0 },
    { id: '13', x: 0, y: 0 },
  ];

  const edges: GraphEdge[] = [
    { source: '8', target: '3' },
    { source: '8', target: '10' },
    { source: '3', target: '1' },
    { source: '3', target: '6' },
    { source: '6', target: '4' },
    { source: '6', target: '7' },
    { source: '10', target: '14' },
    { source: '14', target: '13' },
  ];

  return { nodes, edges };
}
