import { graphEdges, graphNodes } from '@/algorithms/shared/graph/fixtures';
import type { AlgorithmStep } from '@/types/algorithm';

export function createGraphStep(
  current: string | null,
  visited: Set<string>,
  frontier: string[],
  order: string[],
  description: string
): AlgorithmStep {
  return {
    kind: 'graph',
    nodes: graphNodes,
    edges: graphEdges,
    current,
    visited: [...visited],
    frontier: [...frontier],
    order: [...order],
    description,
  };
}
