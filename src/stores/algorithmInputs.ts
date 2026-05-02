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
import { DP_SNAPSHOT_FORMAT_VERSION, parseDpImportJson } from '@/lib/validation/dpInput';
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

const HUFFMAN_DEFAULT_INPUT = 'abracadabra';
const HUFFAN_PRESET_STRINGS = [
  'abracadabra',
  'hello world',
  'greedy algorithm',
  'data compression',
  'binary tree',
];

const NQUEENS_MIN_SIZE = 4;
const NQUEENS_MAX_SIZE = 8;
const NQUEENS_DEFAULT_SIZE = 8;

const SUBSET_SUM_DEFAULT_ARRAY = [2, 4, 6, 8, 10];
const SUBSET_SUM_DEFAULT_TARGET = 16;
const SUBSET_SUM_MIN_LEN = 3;
const SUBSET_SUM_MAX_LEN = 8;
const SUBSET_SUM_MIN_VALUE = 1;

const NETWORK_FLOW_DEFAULT_NODES = [
  { id: 'S', x: 80, y: 170 },
  { id: 'A', x: 280, y: 80 },
  { id: 'B', x: 280, y: 260 },
  { id: 'C', x: 480, y: 170 },
  { id: 'T', x: 680, y: 170 },
];
const NETWORK_FLOW_DEFAULT_EDGES = [
  { source: 'S', target: 'A', capacity: 10 },
  { source: 'S', target: 'B', capacity: 8 },
  { source: 'A', target: 'B', capacity: 5 },
  { source: 'A', target: 'C', capacity: 7 },
  { source: 'B', target: 'C', capacity: 10 },
  { source: 'C', target: 'T', capacity: 10 },
  { source: 'B', target: 'T', capacity: 6 },
];
const NETWORK_FLOW_DEFAULT_SOURCE = 'S';
const NETWORK_FLOW_DEFAULT_SINK = 'T';
const NETWORK_FLOW_MIN_NODES = 3;
const NETWORK_FLOW_MAX_NODES = 8;

const LP_DEFAULT_OBJECTIVE = [3, 5];
const LP_DEFAULT_CONSTRAINTS = [
  [1, 0, 4],
  [0, 2, 12],
  [3, 5, 30],
];
const LP_DEFAULT_CONSTRAINT_LABELS = ['x₁ ≤ 4', '2x₂ ≤ 12', '3x₁+5x₂ ≤ 30'];
const SUBSET_SUM_MAX_VALUE = 30;

const ACTIVITY_DEFAULT_INTERVALS = [
  { start: 1, end: 4, label: 'A' },
  { start: 3, end: 5, label: 'B' },
  { start: 0, end: 6, label: 'C' },
  { start: 5, end: 7, label: 'D' },
  { start: 3, end: 9, label: 'E' },
  { start: 5, end: 9, label: 'F' },
  { start: 6, end: 10, label: 'G' },
  { start: 8, end: 11, label: 'H' },
  { start: 8, end: 12, label: 'I' },
  { start: 2, end: 14, label: 'J' },
];
const ACTIVITY_MIN_INTERVALS = 4;
const ACTIVITY_MAX_INTERVALS = 12;

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
export { ACTIVITY_MIN_INTERVALS, ACTIVITY_MAX_INTERVALS };
export { NQUEENS_MIN_SIZE, NQUEENS_MAX_SIZE };
export { SUBSET_SUM_MIN_LEN, SUBSET_SUM_MAX_LEN, SUBSET_SUM_MIN_VALUE, SUBSET_SUM_MAX_VALUE };
export {
  NETWORK_FLOW_DEFAULT_SOURCE,
  NETWORK_FLOW_DEFAULT_SINK,
  NETWORK_FLOW_MIN_NODES,
  NETWORK_FLOW_MAX_NODES,
};

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
    return { source, target, weight: Math.floor(Math.random() * 20) + 1 };
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
  const huffmanInput = ref(HUFFMAN_DEFAULT_INPUT);
  const activityIntervals = ref([...ACTIVITY_DEFAULT_INTERVALS]);
  const nQueensSize = ref(NQUEENS_DEFAULT_SIZE);
  const subsetSumArray = ref([...SUBSET_SUM_DEFAULT_ARRAY]);
  const subsetSumTarget = ref(SUBSET_SUM_DEFAULT_TARGET);
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

  function setHuffmanInput(s: string) {
    if (s !== huffmanInput.value) {
      huffmanInput.value = s;
      dataVersion.value += 1;
    }
  }

  function randomizeHuffmanInput() {
    const current = huffmanInput.value;
    let next = current;
    while (next === current && HUFFAN_PRESET_STRINGS.length > 1) {
      next = HUFFAN_PRESET_STRINGS[Math.floor(Math.random() * HUFFAN_PRESET_STRINGS.length)];
    }
    huffmanInput.value = next;
    dataVersion.value += 1;
  }

  function randomizeActivityIntervals(count?: number) {
    const n = Math.min(
      ACTIVITY_MAX_INTERVALS,
      Math.max(ACTIVITY_MIN_INTERVALS, Math.trunc(count ?? activityIntervals.value.length))
    );
    const intervals: { start: number; end: number; label: string }[] = [];
    for (let i = 0; i < n; i++) {
      const start = Math.floor(Math.random() * 12);
      const end = start + 1 + Math.floor(Math.random() * 8);
      intervals.push({ start, end, label: String.fromCharCode(65 + i) });
    }
    intervals.sort((a, b) => a.start - b.start);
    activityIntervals.value = intervals;
    dataVersion.value += 1;
  }

  function setActivityIntervalCount(count: number) {
    randomizeActivityIntervals(count);
  }

  function setNQueensSize(size: number) {
    nQueensSize.value = Math.min(NQUEENS_MAX_SIZE, Math.max(NQUEENS_MIN_SIZE, Math.trunc(size)));
    dataVersion.value += 1;
  }

  function randomizeNQueensInput() {
    const sizes = [4, 5, 6, 7, 8, 9, 10, 11, 12];
    let next = sizes[Math.floor(Math.random() * sizes.length)] ?? NQUEENS_DEFAULT_SIZE;
    while (next === nQueensSize.value && sizes.length > 1) {
      next = sizes[Math.floor(Math.random() * sizes.length)] ?? NQUEENS_DEFAULT_SIZE;
    }
    nQueensSize.value = next;
    dataVersion.value += 1;
  }

  function setSubsetSumArray(arr: number[]) {
    const clamped = arr
      .filter(v => Number.isFinite(v))
      .map(v => Math.min(SUBSET_SUM_MAX_VALUE, Math.max(SUBSET_SUM_MIN_VALUE, Math.trunc(v))))
      .slice(0, SUBSET_SUM_MAX_LEN);
    if (clamped.length >= SUBSET_SUM_MIN_LEN) {
      subsetSumArray.value = clamped;
      dataVersion.value += 1;
    }
  }

  function setSubsetSumTarget(target: number) {
    subsetSumTarget.value = Math.max(1, Math.trunc(target));
    dataVersion.value += 1;
  }

  function randomizeSubsetSumInput() {
    const len =
      Math.floor(Math.random() * (SUBSET_SUM_MAX_LEN - SUBSET_SUM_MIN_LEN + 1)) +
      SUBSET_SUM_MIN_LEN;
    const arr = Array.from(
      { length: len },
      () =>
        Math.floor(Math.random() * (SUBSET_SUM_MAX_VALUE - SUBSET_SUM_MIN_VALUE + 1)) +
        SUBSET_SUM_MIN_VALUE
    );
    subsetSumArray.value = arr;
    const sum = arr.reduce((a, b) => a + b, 0);
    subsetSumTarget.value = Math.floor(Math.random() * sum) + 1;
    dataVersion.value += 1;
  }

  // --- 网络流 ---
  const networkFlowNodes = ref([...NETWORK_FLOW_DEFAULT_NODES]);
  const networkFlowEdges = ref([...NETWORK_FLOW_DEFAULT_EDGES]);
  const networkFlowSource = ref(NETWORK_FLOW_DEFAULT_SOURCE);
  const networkFlowSink = ref(NETWORK_FLOW_DEFAULT_SINK);

  function setNetworkFlowSource(source: string) {
    networkFlowSource.value = source;
    dataVersion.value += 1;
  }

  function setNetworkFlowSink(sink: string) {
    networkFlowSink.value = sink;
    dataVersion.value += 1;
  }

  function randomizeNetworkFlowInput() {
    const templates = [
      {
        ids: ['S', 'A', 'B', 'C', 'T'],
        edges: [
          { source: 'S', target: 'A' },
          { source: 'S', target: 'B' },
          { source: 'A', target: 'C' },
          { source: 'B', target: 'C' },
          { source: 'C', target: 'T' },
        ],
      },
      {
        ids: ['S', 'A', 'B', 'T'],
        edges: [
          { source: 'S', target: 'A' },
          { source: 'S', target: 'B' },
          { source: 'A', target: 'T' },
          { source: 'B', target: 'T' },
        ],
      },
    ];
    const template = templates[Math.floor(Math.random() * templates.length)]!;
    const graphEdges: GraphEdge[] = template.edges.map(e => ({ ...e, weight: 1 }));
    const nodes = computeStableForceLayout(template.ids, graphEdges, {
      width: 760,
      height: 340,
      margin: 56,
      nodeRadius: 24,
      collisionPadding: 8,
      linkDistance: 160,
    });
    const edges = template.edges.map(e => ({
      ...e,
      capacity: Math.floor(Math.random() * 15) + 5,
    }));
    networkFlowNodes.value = nodes;
    networkFlowEdges.value = edges;
    networkFlowSource.value = 'S';
    networkFlowSink.value = 'T';
    dataVersion.value += 1;
  }

  function setNetworkFlowNodeCount(count: number) {
    const nodeCount = Math.min(
      NETWORK_FLOW_MAX_NODES,
      Math.max(NETWORK_FLOW_MIN_NODES, Math.trunc(count))
    );

    // Build node ids: S, A, B, ..., T
    const ids: string[] = ['S'];
    for (let i = 0; i < nodeCount - 2; i++) {
      ids.push(String.fromCharCode(65 + i));
    }
    ids.push('T');

    // Generate edges: connect each node to 1-3 later nodes
    const edgeDefs: { source: string; target: string }[] = [];
    for (let i = 0; i < ids.length - 1; i++) {
      const maxReach = Math.min(i + 3, ids.length - 1);
      // Always connect to the next node to ensure connectivity
      edgeDefs.push({ source: ids[i]!, target: ids[i + 1]! });
      for (let j = i + 2; j <= maxReach; j++) {
        if (Math.random() > 0.4) {
          edgeDefs.push({ source: ids[i]!, target: ids[j]! });
        }
      }
    }

    // Layout using the same algorithm as graph algorithms
    const graphEdges: GraphEdge[] = edgeDefs.map(e => ({ ...e, weight: 1 }));
    const nodes = computeStableForceLayout(ids, graphEdges, {
      width: 760,
      height: 340,
      margin: 56,
      nodeRadius: 24,
      collisionPadding: 8,
      linkDistance: 160,
    });

    const edges = edgeDefs.map(e => ({
      ...e,
      capacity: Math.floor(Math.random() * 15) + 5,
    }));

    networkFlowNodes.value = nodes;
    networkFlowEdges.value = edges;
    networkFlowSource.value = 'S';
    networkFlowSink.value = 'T';
    dataVersion.value += 1;
    return nodeCount;
  }

  // --- 线性规划 ---
  const lpObjective = ref([...LP_DEFAULT_OBJECTIVE]);
  const lpConstraints = ref(LP_DEFAULT_CONSTRAINTS.map(row => [...row]));
  const lpConstraintLabels = ref([...LP_DEFAULT_CONSTRAINT_LABELS]);

  function setLpProblem(objective: number[], constraints: number[][], labels: string[]) {
    lpObjective.value = [...objective];
    lpConstraints.value = constraints.map(row => [...row]);
    lpConstraintLabels.value = [...labels];
    dataVersion.value += 1;
  }

  function randomizeLpInput() {
    const templates = [
      {
        objective: [3, 5],
        constraints: [
          [1, 0, 4],
          [0, 2, 12],
          [3, 5, 30],
        ],
        labels: ['x₁ ≤ 4', '2x₂ ≤ 12', '3x₁+5x₂ ≤ 30'],
      },
      {
        objective: [2, 3],
        constraints: [
          [1, 1, 8],
          [2, 1, 14],
          [1, 0, 6],
        ],
        labels: ['x₁+x₂ ≤ 8', '2x₁+x₂ ≤ 14', 'x₁ ≤ 6'],
      },
      {
        objective: [5, 4],
        constraints: [
          [6, 4, 24],
          [1, 2, 6],
          [1, 0, 3],
          [0, 1, 4],
        ],
        labels: ['6x₁+4x₂ ≤ 24', 'x₁+2x₂ ≤ 6', 'x₁ ≤ 3', 'x₂ ≤ 4'],
      },
    ];
    const template = templates[Math.floor(Math.random() * templates.length)]!;
    lpObjective.value = [...template.objective];
    lpConstraints.value = template.constraints.map(row => [...row]);
    lpConstraintLabels.value = [...template.labels];
    dataVersion.value += 1;
  }

  function exportGraphAsJsonText() {
    const nodeIds = graphNodes.value.map(n => n.id);
    const edgeTuples = graphEdges.value.map(e =>
      e.weight != null ? [e.source, e.target, e.weight] : [e.source, e.target]
    );
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

  function exportDpAsJsonText(type: 'lcs' | 'knapsack' | 'investment') {
    if (type === 'lcs') {
      return JSON.stringify(
        {
          formatVersion: DP_SNAPSHOT_FORMAT_VERSION,
          type: 'lcs',
          x: dpLcsStringX.value,
          y: dpLcsStringY.value,
        },
        null,
        2
      );
    }
    if (type === 'knapsack') {
      return JSON.stringify(
        {
          formatVersion: DP_SNAPSHOT_FORMAT_VERSION,
          type: 'knapsack',
          capacity: dpKnapsackCapacity.value,
          items: dpKnapsackItems.value,
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        formatVersion: DP_SNAPSHOT_FORMAT_VERSION,
        type: 'investment',
        investmentCount: dpInvestmentCount.value,
        resources: dpInvestmentResources.value,
        returns: dpInvestmentReturns.value,
      },
      null,
      2
    );
  }

  function importDpFromJsonText(rawText: string) {
    const result = parseDpImportJson(rawText);

    if (!result.ok) {
      return { ok: false, message: result.message } as const;
    }

    if (result.type === 'lcs') {
      dpLcsStringX.value = result.x;
      dpLcsStringY.value = result.y;
      dataVersion.value += 1;
      return { ok: true, message: `已导入 LCS 数据：X="${result.x}", Y="${result.y}"。` } as const;
    }

    if (result.type === 'knapsack') {
      dpKnapsackCapacity.value = result.capacity;
      dpKnapsackItems.value = result.items;
      dataVersion.value += 1;
      return {
        ok: true,
        message: `已导入背包数据：容量=${result.capacity}，${result.items.length} 个物品。`,
      } as const;
    }

    dpInvestmentCount.value = result.investmentCount;
    dpInvestmentResources.value = result.resources;
    dpInvestmentReturns.value = result.returns;
    dataVersion.value += 1;
    return {
      ok: true,
      message: `已导入投资数据：${result.investmentCount} 项投资，资源=${result.resources}。`,
    } as const;
  }

  function exportNetworkFlowAsJsonText() {
    return JSON.stringify(
      {
        nodes: networkFlowNodes.value,
        edges: networkFlowEdges.value,
        source: networkFlowSource.value,
        sink: networkFlowSink.value,
      },
      null,
      2
    );
  }

  function importNetworkFlowFromJsonText(rawText: string) {
    try {
      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        return { ok: false, message: 'JSON 格式无效，缺少 nodes 或 edges 字段。' } as const;
      }
      const nodes = parsed.nodes as { id: string; x: number; y: number }[];
      const edges = parsed.edges as { source: string; target: string; capacity: number }[];
      if (nodes.length === 0) {
        return { ok: false, message: '节点列表不能为空。' } as const;
      }
      networkFlowNodes.value = nodes;
      networkFlowEdges.value = edges;
      if (typeof parsed.source === 'string') networkFlowSource.value = parsed.source;
      if (typeof parsed.sink === 'string') networkFlowSink.value = parsed.sink;
      dataVersion.value += 1;
      return {
        ok: true,
        message: `已导入网络流数据：${nodes.length} 个节点，${edges.length} 条边。`,
      } as const;
    } catch {
      return { ok: false, message: 'JSON 解析失败，请检查文件内容。' } as const;
    }
  }

  function exportLpAsJsonText() {
    return JSON.stringify(
      {
        objective: lpObjective.value,
        constraints: lpConstraints.value,
        constraintLabels: lpConstraintLabels.value,
      },
      null,
      2
    );
  }

  function importLpFromJsonText(rawText: string) {
    try {
      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed.objective) || !Array.isArray(parsed.constraints)) {
        return {
          ok: false,
          message: 'JSON 格式无效，缺少 objective 或 constraints 字段。',
        } as const;
      }
      const objective = parsed.objective as number[];
      const constraints = parsed.constraints as number[][];
      if (objective.length < 2) {
        return { ok: false, message: '目标函数至少需要 2 个系数。' } as const;
      }
      if (constraints.length === 0) {
        return { ok: false, message: '至少需要 1 条约束。' } as const;
      }
      lpObjective.value = objective;
      lpConstraints.value = constraints;
      if (Array.isArray(parsed.constraintLabels)) {
        lpConstraintLabels.value = parsed.constraintLabels;
      }
      dataVersion.value += 1;
      return {
        ok: true,
        message: `已导入 LP 数据：${objective.length} 个变量，${constraints.length} 条约束。`,
      } as const;
    } catch {
      return { ok: false, message: 'JSON 解析失败，请检查文件内容。' } as const;
    }
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
    huffmanInput,
    activityIntervals,
    setHuffmanInput,
    randomizeHuffmanInput,
    randomizeActivityIntervals,
    setActivityIntervalCount,
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
    exportDpAsJsonText,
    importDpFromJsonText,
    nQueensSize,
    setNQueensSize,
    randomizeNQueensInput,
    subsetSumArray,
    subsetSumTarget,
    setSubsetSumArray,
    setSubsetSumTarget,
    randomizeSubsetSumInput,
    networkFlowNodes,
    networkFlowEdges,
    networkFlowSource,
    networkFlowSink,
    setNetworkFlowSource,
    setNetworkFlowSink,
    randomizeNetworkFlowInput,
    setNetworkFlowNodeCount,
    lpObjective,
    lpConstraints,
    lpConstraintLabels,
    setLpProblem,
    randomizeLpInput,
    exportNetworkFlowAsJsonText,
    importNetworkFlowFromJsonText,
    exportLpAsJsonText,
    importLpFromJsonText,
  };
});
