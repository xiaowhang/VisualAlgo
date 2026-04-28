import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import type { GraphEdge, GraphNode } from '@/types/algorithm';

export function getSortingInput(): number[] {
  return [...useAlgorithmInputsStore().sortingInput];
}

export function getGraphStartNode(): string {
  return useAlgorithmInputsStore().graphStartNode;
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Map<string, string[]>;
}

export function getGraphSnapshot(): GraphSnapshot {
  const store = useAlgorithmInputsStore();

  return {
    nodes: store.graphNodes.map(node => ({ ...node })),
    edges: store.graphEdges.map(edge => ({ ...edge })),
    adjacencyList: new Map(
      [...store.graphAdjacencyList.entries()].map(([nodeId, neighbors]) => [nodeId, [...neighbors]])
    ),
  };
}

export interface TreeSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function getTreeSnapshot(): TreeSnapshot {
  const store = useAlgorithmInputsStore();

  return {
    nodes: store.treeNodes.map(node => ({ ...node })),
    edges: store.treeEdges.map(edge => ({ ...edge })),
  };
}

export function getTreeTargetValue(): string {
  return useAlgorithmInputsStore().treeTargetValue;
}
