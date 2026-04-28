import type { GraphEdge, GraphNode } from '@/types/algorithm';

export interface HeapTree {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeLabels: Partial<Record<string, string>>;
}

export function heapArrayToTree(values: number[]): HeapTree {
  const n = values.length;
  if (n === 0) {
    return { nodes: [], edges: [], nodeLabels: {} };
  }

  const nodes: GraphNode[] = values.map((_, i) => ({
    id: String(i),
    x: 0,
    y: 0,
  }));

  const nodeLabels: Partial<Record<string, string>> = {};
  for (let i = 0; i < n; i += 1) {
    nodeLabels[String(i)] = String(values[i]);
  }

  const edges: GraphEdge[] = [];
  for (let i = 0; i < n; i += 1) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      edges.push({ source: String(i), target: String(left) });
    }

    if (right < n) {
      edges.push({ source: String(i), target: String(right) });
    }
  }

  return { nodes, edges, nodeLabels };
}
