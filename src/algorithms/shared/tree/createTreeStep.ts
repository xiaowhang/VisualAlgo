import type { GraphEdge, GraphNode, TreeHighlightKind, TreeStep } from '@/types/algorithm';

interface TreeStepOptions {
  nodes: GraphNode[];
  edges: GraphEdge[];
  description: string;
  currentIndices?: string[];
  compareIndices?: string[];
  swapIndices?: string[];
  visitedIndices?: string[];
  doneIndices?: string[];
  nodeLabels?: Partial<Record<string, string>>;
}

export function createTreeStep(options: TreeStepOptions): TreeStep {
  const highlights: Partial<Record<string, TreeHighlightKind>> = {};

  for (const id of options.compareIndices ?? []) {
    highlights[id] = 'compare';
  }

  for (const id of options.currentIndices ?? []) {
    highlights[id] = 'current';
  }

  for (const id of options.swapIndices ?? []) {
    highlights[id] = 'swap';
  }

  for (const id of options.visitedIndices ?? []) {
    highlights[id] = 'visited';
  }

  for (const id of options.doneIndices ?? []) {
    highlights[id] = 'done';
  }

  return {
    kind: 'tree',
    nodes: options.nodes.map(n => ({ ...n })),
    edges: options.edges.map(e => ({ ...e })),
    highlights,
    nodeLabels: { ...options.nodeLabels },
    description: options.description,
  };
}
