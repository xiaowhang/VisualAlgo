import type { GraphEdge, GraphNode } from '@/types/algorithm';

const MAX_TREE_DEPTH = 7;

interface CreateRandomBSTDataOptions {
  nodeCount: number;
  minValue: number;
  maxValue: number;
}

export function createRandomBSTData(options: CreateRandomBSTDataOptions): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const { nodeCount, minValue, maxValue } = options;
  const range = maxValue - minValue + 1;

  const valueSet = new Set<number>();
  while (valueSet.size < nodeCount) {
    valueSet.add(Math.floor(Math.random() * range) + minValue);
  }

  const sorted = [...valueSet].sort((a, b) => a - b);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  function buildBalanced(values: number[], depthRemaining: number): number | null {
    if (values.length === 0 || depthRemaining <= 0) {
      return null;
    }

    const maxNodesInSubtree = (1 << depthRemaining) - 1;
    const available = values.length;

    if (available > maxNodesInSubtree) {
      return null;
    }

    const leftCapacity = (1 << (depthRemaining - 1)) - 1;
    const maxLeft = Math.min(available - 1, leftCapacity);
    const minLeft = Math.max(0, available - 1 - leftCapacity);

    const pivotIndex = minLeft + Math.floor(Math.random() * (maxLeft - minLeft + 1));
    const pivotValue = values[pivotIndex]!;

    nodes.push({ id: String(pivotValue), x: 0, y: 0 });

    const leftRoot = buildBalanced(values.slice(0, pivotIndex), depthRemaining - 1);
    if (leftRoot !== null) {
      edges.push({ source: String(pivotValue), target: String(leftRoot) });
    }

    const rightRoot = buildBalanced(values.slice(pivotIndex + 1), depthRemaining - 1);
    if (rightRoot !== null) {
      edges.push({ source: String(pivotValue), target: String(rightRoot) });
    }

    return pivotValue;
  }

  buildBalanced(sorted, MAX_TREE_DEPTH);

  return { nodes, edges };
}

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
