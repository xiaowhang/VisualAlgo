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

export function getHanoiDiskCount(): number {
  return useAlgorithmInputsStore().hanoiDiskCount;
}

export function getDpLcsStrings(): { x: string; y: string } {
  const store = useAlgorithmInputsStore();
  return { x: store.dpLcsStringX, y: store.dpLcsStringY };
}

export function getDpKnapsackInput(): {
  capacity: number;
  items: { weight: number; value: number }[];
} {
  const store = useAlgorithmInputsStore();
  return {
    capacity: store.dpKnapsackCapacity,
    items: store.dpKnapsackItems.map(item => ({ ...item })),
  };
}

export function getDpInvestmentInput(): {
  investmentCount: number;
  resources: number;
  returns: number[][];
} {
  const store = useAlgorithmInputsStore();
  return {
    investmentCount: store.dpInvestmentCount,
    resources: store.dpInvestmentResources,
    returns: store.dpInvestmentReturns.map(row => [...row]),
  };
}

export function getDijkstraInput(): {
  graph: GraphSnapshot;
  startNode: string;
} {
  return {
    graph: getGraphSnapshot(),
    startNode: getGraphStartNode(),
  };
}

export function getHuffmanInput(): { text: string } {
  return { text: useAlgorithmInputsStore().huffmanInput };
}

export function getActivityInput(): {
  intervals: { start: number; end: number; label: string }[];
} {
  return {
    intervals: useAlgorithmInputsStore().activityIntervals.map(interval => ({ ...interval })),
  };
}

export function getNQueensSize(): number {
  return useAlgorithmInputsStore().nQueensSize;
}

export function getSubsetSumInput(): { nums: number[]; target: number } {
  const store = useAlgorithmInputsStore();
  return {
    nums: [...store.subsetSumArray],
    target: store.subsetSumTarget,
  };
}

export function getNetworkFlowInput(): {
  nodes: { id: string; x: number; y: number }[];
  edges: { source: string; target: string; capacity: number }[];
  source: string;
  sink: string;
} {
  const store = useAlgorithmInputsStore();
  return {
    nodes: store.networkFlowNodes.map(n => ({ ...n })),
    edges: store.networkFlowEdges.map(e => ({ ...e })),
    source: store.networkFlowSource,
    sink: store.networkFlowSink,
  };
}

export function getLpInput(): {
  objective: number[];
  constraints: number[][];
  constraintLabels: string[];
} {
  const store = useAlgorithmInputsStore();
  return {
    objective: [...store.lpObjective],
    constraints: store.lpConstraints.map(row => [...row]),
    constraintLabels: [...store.lpConstraintLabels],
  };
}
