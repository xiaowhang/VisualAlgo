import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GraphEdge, GraphNode } from '@/types/algorithm';
import { computeStableForceLayout } from '@/visualizers/graphLayout';
import {
  SORTING_DEFAULT_SIZE,
  SORTING_MAX_SIZE,
  SORTING_MIN_SIZE,
  SORTING_SNAPSHOT_FORMAT_VERSION,
  parseCustomSortingInputText,
  parseSortingImportJson,
  validateSortingNumbers,
  type SortingInputResult,
} from '@/lib/validation/sortingInput';

const GRAPH_DEFAULT_NODE_COUNT = 6;
const GRAPH_MIN_NODES = 4;
const GRAPH_MAX_NODES = 12;

export { SORTING_MIN_SIZE, SORTING_MAX_SIZE };
export { GRAPH_MIN_NODES, GRAPH_MAX_NODES };

function clampSortingSize(size: number) {
  return Math.min(SORTING_MAX_SIZE, Math.max(SORTING_MIN_SIZE, size));
}

function createRandomSortingData(size: number) {
  return Array.from({ length: clampSortingSize(size) }, () => Math.floor(Math.random() * 90) + 10);
}

function clampGraphNodeCount(count: number) {
  return Math.min(GRAPH_MAX_NODES, Math.max(GRAPH_MIN_NODES, count));
}

function createGraphNodeIds(count: number) {
  return Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
}

function createRandomGraphData(nodeIds: readonly string[]) {
  const indexById = new Map(nodeIds.map((id, index) => [id, index]));
  const edgeSet = new Set<string>();

  function createEdgeKey(a: string, b: string) {
    const indexA = indexById.get(a) ?? 0;
    const indexB = indexById.get(b) ?? 0;
    return indexA < indexB ? `${a}|${b}` : `${b}|${a}`;
  }

  function addEdge(a: string, b: string) {
    if (a === b) {
      return;
    }
    edgeSet.add(createEdgeKey(a, b));
  }

  for (let index = 1; index < nodeIds.length; index += 1) {
    const current = nodeIds[index];
    const parent = nodeIds[Math.floor(Math.random() * index)];
    addEdge(current, parent);
  }

  const allPairs: Array<[string, string]> = [];
  for (let sourceIndex = 0; sourceIndex < nodeIds.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < nodeIds.length; targetIndex += 1) {
      allPairs.push([nodeIds[sourceIndex], nodeIds[targetIndex]]);
    }
  }

  const maxExtraEdges = Math.max(2, nodeIds.length - 2);
  const extraEdgeCount = Math.floor(Math.random() * (maxExtraEdges + 1));

  for (let count = 0; count < extraEdgeCount; count += 1) {
    const candidate = allPairs[Math.floor(Math.random() * allPairs.length)];
    if (!candidate) {
      continue;
    }
    addEdge(candidate[0], candidate[1]);
  }

  const edges: GraphEdge[] = [...edgeSet].map(key => {
    const [source, target] = key.split('|');
    return { source, target };
  });

  const nodes = computeStableForceLayout(nodeIds, edges, {
    width: 760,
    height: 340,
    margin: 56,
    nodeRadius: 24,
    collisionPadding: 8,
  });

  const adjacencyList = new Map<string, string[]>(nodeIds.map(id => [id, []]));
  for (const edge of edges) {
    adjacencyList.get(edge.source)?.push(edge.target);
    adjacencyList.get(edge.target)?.push(edge.source);
  }

  for (const [id, neighbors] of adjacencyList) {
    neighbors.sort((left, right) => {
      const leftIndex = indexById.get(left) ?? 0;
      const rightIndex = indexById.get(right) ?? 0;
      return leftIndex - rightIndex;
    });
    adjacencyList.set(id, neighbors);
  }

  return {
    nodes,
    edges,
    adjacencyList,
  };
}

export const useAlgorithmInputsStore = defineStore('algorithm-inputs', () => {
  const initialGraphNodeIds = createGraphNodeIds(GRAPH_DEFAULT_NODE_COUNT);
  const initialGraphData = createRandomGraphData(initialGraphNodeIds);
  const sortingInput = ref<number[]>(createRandomSortingData(SORTING_DEFAULT_SIZE));
  const graphNodeCount = ref(GRAPH_DEFAULT_NODE_COUNT);
  const graphStartNode = ref('A');
  const graphNodes = ref<GraphNode[]>(initialGraphData.nodes);
  const graphEdges = ref<GraphEdge[]>(initialGraphData.edges);
  const graphAdjacencyList = ref<Map<string, string[]>>(initialGraphData.adjacencyList);
  const dataVersion = ref(0);

  function getGraphNodeIds() {
    return createGraphNodeIds(graphNodeCount.value);
  }

  function resolveGraphStartNode(preferredStartNode: string, nodeIds: readonly string[]) {
    if (nodeIds.includes(preferredStartNode)) {
      return preferredStartNode;
    }
    return nodeIds[0] ?? 'A';
  }

  function randomizeGraphInput(nextCount?: number) {
    const baseCount = nextCount ?? graphNodeCount.value;
    const targetCount = clampGraphNodeCount(Math.trunc(baseCount));
    const nodeIds = createGraphNodeIds(targetCount);
    const nextGraphData = createRandomGraphData(nodeIds);

    graphNodeCount.value = targetCount;
    graphNodes.value = nextGraphData.nodes;
    graphEdges.value = nextGraphData.edges;
    graphAdjacencyList.value = nextGraphData.adjacencyList;
    graphStartNode.value = nodeIds[Math.floor(Math.random() * nodeIds.length)] ?? 'A';
    dataVersion.value += 1;
  }

  function setGraphNodeCount(nextCount: number) {
    const targetCount = clampGraphNodeCount(Math.trunc(nextCount));
    const currentStartNode = graphStartNode.value;
    const nodeIds = createGraphNodeIds(targetCount);
    const nextGraphData = createRandomGraphData(nodeIds);

    graphNodeCount.value = targetCount;
    graphNodes.value = nextGraphData.nodes;
    graphEdges.value = nextGraphData.edges;
    graphAdjacencyList.value = nextGraphData.adjacencyList;
    graphStartNode.value = resolveGraphStartNode(currentStartNode, nodeIds);
    dataVersion.value += 1;

    return targetCount;
  }

  function setGraphStartNode(nodeId: string) {
    const validNodeIds = getGraphNodeIds();
    const normalized = resolveGraphStartNode(nodeId, validNodeIds);
    if (normalized === graphStartNode.value) {
      return;
    }

    graphStartNode.value = normalized;
    dataVersion.value += 1;
  }

  function applySortingInput(numbers: number[], successMessage: string): SortingInputResult {
    const validationResult = validateSortingNumbers(numbers);

    if (!validationResult.ok) {
      return validationResult;
    }

    sortingInput.value = numbers;
    dataVersion.value += 1;

    return {
      ok: true,
      message: successMessage,
    };
  }

  function randomizeAlgorithmInput(size?: number) {
    const baseSize = size ?? sortingInput.value.length;
    const targetSize = clampSortingSize(Math.trunc(baseSize > 0 ? baseSize : SORTING_DEFAULT_SIZE));
    sortingInput.value = createRandomSortingData(targetSize);

    const nodeIds = getGraphNodeIds();
    const nextGraphData = createRandomGraphData(nodeIds);
    graphNodes.value = nextGraphData.nodes;
    graphEdges.value = nextGraphData.edges;
    graphAdjacencyList.value = nextGraphData.adjacencyList;
    graphStartNode.value = nodeIds[Math.floor(Math.random() * nodeIds.length)] ?? 'A';
    dataVersion.value += 1;
  }

  function applyCustomSortingInput(rawText: string) {
    const parseResult = parseCustomSortingInputText(rawText);

    if (!parseResult.ok) {
      return {
        ok: false,
        message: parseResult.message,
      };
    }

    const numbers = parseResult.numbers;
    return applySortingInput(numbers, `已应用 ${numbers.length} 个元素。`);
  }

  function exportSortingAsJsonText() {
    return JSON.stringify(
      {
        formatVersion: SORTING_SNAPSHOT_FORMAT_VERSION,
        sortingInput: sortingInput.value,
      },
      null,
      2
    );
  }

  function importSortingFromJsonText(rawText: string) {
    const importResult = parseSortingImportJson(rawText);

    if (!importResult.ok) {
      return {
        ok: false,
        message: importResult.message,
      } as const;
    }

    const numbers = importResult.numbers;

    return applySortingInput(numbers, `已导入 ${numbers.length} 个元素。`);
  }

  return {
    sortingInput,
    graphNodeCount,
    graphStartNode,
    graphNodes,
    graphEdges,
    graphAdjacencyList,
    dataVersion,
    randomizeAlgorithmInput,
    randomizeGraphInput,
    setGraphNodeCount,
    setGraphStartNode,
    applyCustomSortingInput,
    exportSortingAsJsonText,
    importSortingFromJsonText,
  };
});
