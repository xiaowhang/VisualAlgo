import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GraphEdge, GraphNode } from '@/types/algorithm';
import { computeStableForceLayout } from '@/visualizers/graphLayout';
import { createRandomBSTData, getDefaultBST } from '@/algorithms/shared/tree/fixtures';
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
import { GRAPH_SNAPSHOT_FORMAT_VERSION, parseGraphImportJson } from '@/lib/validation/graphInput';
import {
  TREE_MAX_NODES,
  TREE_MIN_NODES,
  TREE_SNAPSHOT_FORMAT_VERSION,
  TREE_VALUE_MAX,
  TREE_VALUE_MIN,
  parseTreeImportJson,
} from '@/lib/validation/treeInput';

const GRAPH_DEFAULT_NODE_COUNT = 8;
const GRAPH_MIN_NODES = 6;
const GRAPH_MAX_NODES = 14;
const TREE_DEFAULT_NODE_COUNT = 9;
const TREE_DEFAULT_TARGET_VALUE = '7';
const HANOI_MIN_DISKS = 2;
const HANOI_MAX_DISKS = 8;
const HANOI_DEFAULT_DISK_COUNT = 4;

const DP_INVESTMENT_MIN = 2;
const DP_INVESTMENT_MAX = 5;
const DP_RESOURCES_MIN = 3;
const DP_RESOURCES_MAX = 10;
const DP_INVESTMENT_DEFAULT_COUNT = 3;
const DP_INVESTMENT_DEFAULT_RESOURCES = 5;
const DP_KNAPSACK_CAPACITY_MIN = 3;
const DP_KNAPSACK_CAPACITY_MAX = 15;
const DP_KNAPSACK_ITEMS_MIN = 2;
const DP_KNAPSACK_ITEMS_MAX = 6;
const DP_KNAPSACK_DEFAULT_CAPACITY = 10;
const DP_LCS_STRING_LEN_MIN = 3;
const DP_LCS_STRING_LEN_MAX = 8;
const DP_LCS_DEFAULT_X = 'ABCBDAB';
const DP_LCS_DEFAULT_Y = 'BDCABA';

export { SORTING_MIN_SIZE, SORTING_MAX_SIZE };
export { GRAPH_MIN_NODES, GRAPH_MAX_NODES };
export { HANOI_MIN_DISKS, HANOI_MAX_DISKS };
export { TREE_MIN_NODES, TREE_MAX_NODES, TREE_VALUE_MIN, TREE_VALUE_MAX };
export { DP_INVESTMENT_MIN, DP_INVESTMENT_MAX, DP_RESOURCES_MIN, DP_RESOURCES_MAX };
export {
  DP_KNAPSACK_CAPACITY_MIN,
  DP_KNAPSACK_CAPACITY_MAX,
  DP_KNAPSACK_ITEMS_MIN,
  DP_KNAPSACK_ITEMS_MAX,
};
export { DP_LCS_STRING_LEN_MIN, DP_LCS_STRING_LEN_MAX };

function clampSortingSize(size: number) {
  return Math.min(SORTING_MAX_SIZE, Math.max(SORTING_MIN_SIZE, size));
}

function createRandomSortingData(size: number) {
  return Array.from({ length: clampSortingSize(size) }, () => Math.floor(Math.random() * 90) + 10);
}

function clampGraphNodeCount(count: number) {
  return Math.min(GRAPH_MAX_NODES, Math.max(GRAPH_MIN_NODES, count));
}

function clampTreeNodeCount(count: number) {
  return Math.min(TREE_MAX_NODES, Math.max(TREE_MIN_NODES, count));
}

function clampTreeValue(value: number) {
  return Math.min(TREE_VALUE_MAX, Math.max(TREE_VALUE_MIN, value));
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
  const defaultBST = getDefaultBST();
  const sortingInput = ref<number[]>(createRandomSortingData(SORTING_DEFAULT_SIZE));
  const graphNodeCount = ref(GRAPH_DEFAULT_NODE_COUNT);
  const graphStartNode = ref('A');
  const graphNodes = ref<GraphNode[]>(initialGraphData.nodes);
  const graphEdges = ref<GraphEdge[]>(initialGraphData.edges);
  const graphAdjacencyList = ref<Map<string, string[]>>(initialGraphData.adjacencyList);
  const treeNodes = ref<GraphNode[]>(defaultBST.nodes);
  const treeEdges = ref<GraphEdge[]>(defaultBST.edges);
  const treeTargetValue = ref(TREE_DEFAULT_TARGET_VALUE);
  const treeNodeCount = ref(TREE_DEFAULT_NODE_COUNT);
  const treeMinValue = ref(TREE_VALUE_MIN);
  const treeMaxValue = ref(TREE_VALUE_MAX);
  const hanoiDiskCount = ref(HANOI_DEFAULT_DISK_COUNT);
  const dpInvestmentCount = ref(DP_INVESTMENT_DEFAULT_COUNT);
  const dpInvestmentResources = ref(DP_INVESTMENT_DEFAULT_RESOURCES);
  const dpInvestmentReturns = ref<number[][]>([
    [0, 11, 12, 13, 14, 15],
    [0, 0, 5, 10, 15, 20],
    [0, 2, 4, 6, 8, 10],
  ]);
  const dpKnapsackCapacity = ref(DP_KNAPSACK_DEFAULT_CAPACITY);
  const dpKnapsackItems = ref<{ weight: number; value: number }[]>([
    { weight: 2, value: 3 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 8 },
  ]);
  const dpLcsStringX = ref(DP_LCS_DEFAULT_X);
  const dpLcsStringY = ref(DP_LCS_DEFAULT_Y);
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

  function buildAdjacencyListFromEdges(nodeIds: readonly string[], edges: readonly GraphEdge[]) {
    const adjacencyList = new Map<string, string[]>(nodeIds.map(id => [id, []]));
    for (const edge of edges) {
      adjacencyList.get(edge.source)?.push(edge.target);
      adjacencyList.get(edge.target)?.push(edge.source);
    }
    for (const [id, neighbors] of adjacencyList) {
      neighbors.sort((a, b) => a.localeCompare(b));
      adjacencyList.set(id, neighbors);
    }
    return adjacencyList;
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

  function randomizeTreeInput(nextCount?: number, nextMinValue?: number, nextMaxValue?: number) {
    const count = clampTreeNodeCount(nextCount ?? treeNodeCount.value);
    const minVal = clampTreeValue(nextMinValue ?? treeMinValue.value);
    const maxVal = clampTreeValue(nextMaxValue ?? treeMaxValue.value);
    const effectiveMax = Math.max(minVal, maxVal);
    const effectiveMin = Math.min(minVal, maxVal);
    const availableCount = effectiveMax - effectiveMin + 1;
    const actualCount = Math.min(count, availableCount);

    const data = createRandomBSTData({
      nodeCount: actualCount,
      minValue: effectiveMin,
      maxValue: effectiveMax,
    });

    treeNodeCount.value = actualCount;
    treeMinValue.value = effectiveMin;
    treeMaxValue.value = effectiveMax;
    treeNodes.value = data.nodes;
    treeEdges.value = data.edges;
    treeTargetValue.value =
      data.nodes[Math.floor(Math.random() * data.nodes.length)]?.id ?? TREE_DEFAULT_TARGET_VALUE;
    dataVersion.value += 1;
  }

  function setTreeNodeCount(nextCount: number) {
    randomizeTreeInput(nextCount, treeMinValue.value, treeMaxValue.value);
  }

  function setTreeValueRange(nextMin: number, nextMax: number) {
    randomizeTreeInput(treeNodeCount.value, nextMin, nextMax);
  }

  function setTreeTargetValue(value: string) {
    treeTargetValue.value = value;
    dataVersion.value += 1;
  }

  function setHanoiDiskCount(count: number) {
    hanoiDiskCount.value = Math.min(HANOI_MAX_DISKS, Math.max(HANOI_MIN_DISKS, Math.trunc(count)));
    dataVersion.value += 1;
  }

  function randomizeDpInvestmentReturns() {
    const n = dpInvestmentCount.value;
    const M = dpInvestmentResources.value;
    const newReturns: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [0];
      let acc = 0;
      for (let j = 1; j <= M; j++) {
        acc += Math.floor(Math.random() * 10) + 1;
        row.push(acc);
      }
      newReturns.push(row);
    }
    dpInvestmentReturns.value = newReturns;
    dataVersion.value += 1;
  }

  function setDpInvestmentCount(count: number) {
    dpInvestmentCount.value = Math.min(
      DP_INVESTMENT_MAX,
      Math.max(DP_INVESTMENT_MIN, Math.trunc(count))
    );
    randomizeDpInvestmentReturns();
  }

  function setDpInvestmentResources(resources: number) {
    dpInvestmentResources.value = Math.min(
      DP_RESOURCES_MAX,
      Math.max(DP_RESOURCES_MIN, Math.trunc(resources))
    );
    randomizeDpInvestmentReturns();
  }

  function randomizeDpKnapsackItems() {
    const n = dpKnapsackItems.value.length;
    dpKnapsackItems.value = Array.from({ length: n }, () => ({
      weight: Math.floor(Math.random() * 8) + 1,
      value: Math.floor(Math.random() * 10) + 1,
    }));
    dataVersion.value += 1;
  }

  function setDpKnapsackCapacity(capacity: number) {
    dpKnapsackCapacity.value = Math.min(
      DP_KNAPSACK_CAPACITY_MAX,
      Math.max(DP_KNAPSACK_CAPACITY_MIN, Math.trunc(capacity))
    );
    dataVersion.value += 1;
  }

  function setDpKnapsackItemCount(count: number) {
    const clamped = Math.min(
      DP_KNAPSACK_ITEMS_MAX,
      Math.max(DP_KNAPSACK_ITEMS_MIN, Math.trunc(count))
    );
    if (clamped !== dpKnapsackItems.value.length) {
      dpKnapsackItems.value = Array.from({ length: clamped }, () => ({
        weight: Math.floor(Math.random() * 8) + 1,
        value: Math.floor(Math.random() * 10) + 1,
      }));
      dataVersion.value += 1;
    }
  }

  function setDpLcsStringX(s: string) {
    if (s !== dpLcsStringX.value) {
      dpLcsStringX.value = s;
      dataVersion.value += 1;
    }
  }

  function setDpLcsStringY(s: string) {
    if (s !== dpLcsStringY.value) {
      dpLcsStringY.value = s;
      dataVersion.value += 1;
    }
  }

  function randomizeDpLcsStrings() {
    const chars = 'ABCDEFGH';
    const len1 =
      Math.floor(Math.random() * (DP_LCS_STRING_LEN_MAX - DP_LCS_STRING_LEN_MIN + 1)) +
      DP_LCS_STRING_LEN_MIN;
    const len2 =
      Math.floor(Math.random() * (DP_LCS_STRING_LEN_MAX - DP_LCS_STRING_LEN_MIN + 1)) +
      DP_LCS_STRING_LEN_MIN;
    dpLcsStringX.value = Array.from(
      { length: len1 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    dpLcsStringY.value = Array.from(
      { length: len2 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    dataVersion.value += 1;
  }

  function randomizeDpAlgorithmInput() {
    randomizeDpInvestmentReturns();
    randomizeDpKnapsackItems();
    randomizeDpLcsStrings();
  }

  function exportGraphAsJsonText() {
    const nodeIds = graphNodes.value.map(n => n.id);
    const edgeTuples = graphEdges.value.map(e => [e.source, e.target] as [string, string]);
    return JSON.stringify(
      {
        formatVersion: GRAPH_SNAPSHOT_FORMAT_VERSION,
        nodes: nodeIds,
        edges: edgeTuples,
        startNode: graphStartNode.value,
      },
      null,
      2
    );
  }

  function importGraphFromJsonText(rawText: string) {
    const result = parseGraphImportJson(rawText);

    if (!result.ok) {
      return { ok: false, message: result.message } as const;
    }

    const { nodeIds, edges, startNode } = result;
    const nodes = computeStableForceLayout(nodeIds, edges, {
      width: 760,
      height: 340,
      margin: 56,
      nodeRadius: 24,
      collisionPadding: 8,
    });
    const adjacencyList = buildAdjacencyListFromEdges(nodeIds, edges);

    graphNodes.value = nodes;
    graphEdges.value = edges;
    graphAdjacencyList.value = adjacencyList;
    graphNodeCount.value = nodeIds.length;
    graphStartNode.value = resolveGraphStartNode(startNode, nodeIds);
    dataVersion.value += 1;

    return {
      ok: true,
      message: `已导入 ${nodeIds.length} 个节点、${edges.length} 条边。`,
    } as const;
  }

  function exportTreeAsJsonText() {
    const nodeIds = treeNodes.value.map(n => n.id);
    const edgeTuples = treeEdges.value.map(e => [e.source, e.target] as [string, string]);
    return JSON.stringify(
      {
        formatVersion: TREE_SNAPSHOT_FORMAT_VERSION,
        nodes: nodeIds,
        edges: edgeTuples,
        treeTargetValue: treeTargetValue.value,
      },
      null,
      2
    );
  }

  function importTreeFromJsonText(rawText: string) {
    const result = parseTreeImportJson(rawText);

    if (!result.ok) {
      return { ok: false, message: result.message } as const;
    }

    const { nodes, edges, treeTargetValue: target } = result;

    treeNodes.value = nodes;
    treeEdges.value = edges;
    treeTargetValue.value = target;
    treeNodeCount.value = nodes.length;
    dataVersion.value += 1;

    return { ok: true, message: `已导入 ${nodes.length} 个树节点。` } as const;
  }

  return {
    sortingInput,
    graphNodeCount,
    graphStartNode,
    graphNodes,
    graphEdges,
    graphAdjacencyList,
    treeNodes,
    treeEdges,
    treeTargetValue,
    treeNodeCount,
    treeMinValue,
    treeMaxValue,
    hanoiDiskCount,
    setHanoiDiskCount,
    dpInvestmentCount,
    dpInvestmentResources,
    dpInvestmentReturns,
    dpKnapsackCapacity,
    dpKnapsackItems,
    dpLcsStringX,
    dpLcsStringY,
    setDpInvestmentCount,
    setDpInvestmentResources,
    randomizeDpInvestmentReturns,
    setDpKnapsackCapacity,
    setDpKnapsackItemCount,
    randomizeDpKnapsackItems,
    setDpLcsStringX,
    setDpLcsStringY,
    randomizeDpLcsStrings,
    randomizeDpAlgorithmInput,
    dataVersion,
    randomizeAlgorithmInput,
    randomizeGraphInput,
    randomizeTreeInput,
    setGraphNodeCount,
    setGraphStartNode,
    setTreeNodeCount,
    setTreeValueRange,
    setTreeTargetValue,
    applyCustomSortingInput,
    exportSortingAsJsonText,
    importSortingFromJsonText,
    exportGraphAsJsonText,
    importGraphFromJsonText,
    exportTreeAsJsonText,
    importTreeFromJsonText,
  };
});
