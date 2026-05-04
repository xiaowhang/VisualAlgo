import { describe, bench } from 'vitest';
import { computeStableForceLayout } from '../graphLayout';
import type { GraphEdge } from '@/types/algorithm';

function makeChainEdges(nodeIds: string[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodeIds.length - 1; i++) {
    edges.push({ source: nodeIds[i], target: nodeIds[i + 1] });
  }
  return edges;
}

function makeCycleEdges(nodeIds: string[]): GraphEdge[] {
  const edges = makeChainEdges(nodeIds);
  edges.push({ source: nodeIds[nodeIds.length - 1], target: nodeIds[0] });
  return edges;
}

describe('computeStableForceLayout', () => {
  bench('4 nodes 链式', () => {
    const ids = ['A', 'B', 'C', 'D'];
    computeStableForceLayout(ids, makeChainEdges(ids));
  });

  bench('8 nodes 链式', () => {
    const ids = Array.from({ length: 8 }, (_, i) => String.fromCharCode(65 + i));
    computeStableForceLayout(ids, makeChainEdges(ids));
  });

  bench('14 nodes 链式', () => {
    const ids = Array.from({ length: 14 }, (_, i) => `N${i}`);
    computeStableForceLayout(ids, makeChainEdges(ids));
  });

  bench('8 nodes 环形', () => {
    const ids = Array.from({ length: 8 }, (_, i) => String.fromCharCode(65 + i));
    computeStableForceLayout(ids, makeCycleEdges(ids));
  });

  bench('14 nodes 环形', () => {
    const ids = Array.from({ length: 14 }, (_, i) => `N${i}`);
    computeStableForceLayout(ids, makeCycleEdges(ids));
  });
});
