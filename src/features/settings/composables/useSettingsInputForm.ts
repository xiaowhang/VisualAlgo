import { computed, ref, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import type {
  GraphSectionData,
  SortingSectionData,
  TreeSectionData,
} from '@/features/settings/types';
import {
  GRAPH_MAX_NODES,
  GRAPH_MIN_NODES,
  HANOI_MAX_DISKS,
  HANOI_MIN_DISKS,
  SORTING_MAX_SIZE,
  SORTING_MIN_SIZE,
  TREE_MAX_NODES,
  TREE_MIN_NODES,
  TREE_VALUE_MAX,
  TREE_VALUE_MIN,
  useAlgorithmInputsStore,
} from '@/stores/algorithmInputs';

interface UseSettingsInputFormOptions {
  isGraphAlgorithm: Readonly<Ref<boolean>>;
  isTreeAlgorithm: Readonly<Ref<boolean>>;
  isHanoiAlgorithm: Readonly<Ref<boolean>>;
  isGreedyAlgorithm: Readonly<Ref<boolean>>;
  greedyAlgorithmSlug: Readonly<Ref<string>>;
  isDpAlgorithm: Readonly<Ref<boolean>>;
  dpAlgorithmSlug: Readonly<Ref<string>>;
  isBacktrackingAlgorithm: Readonly<Ref<boolean>>;
  backtrackingAlgorithmSlug: Readonly<Ref<string>>;
}

export function useSettingsInputForm(options: UseSettingsInputFormOptions) {
  const algorithmInputsStore = useAlgorithmInputsStore();
  const algorithmInputsRefs = storeToRefs(algorithmInputsStore);

  const algorithmInputs = {
    ...algorithmInputsRefs,
    randomizeAlgorithmInput: algorithmInputsStore.randomizeAlgorithmInput,
    applyCustomSortingInput: algorithmInputsStore.applyCustomSortingInput,
    exportSortingAsJsonText: algorithmInputsStore.exportSortingAsJsonText,
    importSortingFromJsonText: algorithmInputsStore.importSortingFromJsonText,
    randomizeGraphInput: algorithmInputsStore.randomizeGraphInput,
    setGraphNodeCount: algorithmInputsStore.setGraphNodeCount,
    setGraphStartNode: algorithmInputsStore.setGraphStartNode,
    randomizeTreeInput: algorithmInputsStore.randomizeTreeInput,
    setTreeNodeCount: algorithmInputsStore.setTreeNodeCount,
    setTreeValueRange: algorithmInputsStore.setTreeValueRange,
    setTreeTargetValue: algorithmInputsStore.setTreeTargetValue,
    exportGraphAsJsonText: algorithmInputsStore.exportGraphAsJsonText,
    importGraphFromJsonText: algorithmInputsStore.importGraphFromJsonText,
    exportTreeAsJsonText: algorithmInputsStore.exportTreeAsJsonText,
    importTreeFromJsonText: algorithmInputsStore.importTreeFromJsonText,
    setHanoiDiskCount: algorithmInputsStore.setHanoiDiskCount,
    setDpLcsStringX: algorithmInputsStore.setDpLcsStringX,
    setDpLcsStringY: algorithmInputsStore.setDpLcsStringY,
    randomizeDpLcsStrings: algorithmInputsStore.randomizeDpLcsStrings,
    setDpKnapsackCapacity: algorithmInputsStore.setDpKnapsackCapacity,
    setDpKnapsackItemCount: algorithmInputsStore.setDpKnapsackItemCount,
    randomizeDpKnapsackItems: algorithmInputsStore.randomizeDpKnapsackItems,
    setDpInvestmentCount: algorithmInputsStore.setDpInvestmentCount,
    setDpInvestmentResources: algorithmInputsStore.setDpInvestmentResources,
    randomizeDpInvestmentReturns: algorithmInputsStore.randomizeDpInvestmentReturns,
    randomizeDpAlgorithmInput: algorithmInputsStore.randomizeDpAlgorithmInput,
    exportDpAsJsonText: algorithmInputsStore.exportDpAsJsonText,
    importDpFromJsonText: algorithmInputsStore.importDpFromJsonText,
  };

  const sortingSize = computed(() => algorithmInputs.sortingInput.value.length);
  const sizeInput = ref(String(sortingSize.value));
  const sizeMessage = ref('');
  const sizeError = ref(false);

  const graphNodeCount = computed(() => algorithmInputs.graphNodeCount.value);
  const graphNodeCountInput = ref(String(graphNodeCount.value));
  const graphSizeMessage = ref('');
  const graphSizeError = ref(false);

  const graphStartNodeInput = ref(algorithmInputs.graphStartNode.value);
  const graphMessage = ref('');
  const graphMessageError = ref(false);

  const graphNodeOptions = computed(() => algorithmInputs.graphNodes.value.map(node => node.id));

  const customData = ref(algorithmInputs.sortingInput.value.join(', '));
  const customDataMessage = ref('');
  const customDataError = ref(false);

  watch(sortingSize, value => {
    sizeInput.value = String(value);
  });

  watch(graphNodeCount, value => {
    graphNodeCountInput.value = String(value);
  });

  watch(
    () => algorithmInputs.graphStartNode.value,
    value => {
      graphStartNodeInput.value = value;
    }
  );

  watch(graphNodeOptions, options => {
    if (options.length === 0) {
      graphStartNodeInput.value = '';
      return;
    }

    if (!options.includes(graphStartNodeInput.value)) {
      graphStartNodeInput.value = options[0];
    }
  });

  const treeNodeCountInput = ref(String(algorithmInputs.treeNodeCount.value));
  const treeMinValueInput = ref(String(algorithmInputs.treeMinValue.value));
  const treeMaxValueInput = ref(String(algorithmInputs.treeMaxValue.value));
  const treeTargetValueInput = ref(algorithmInputs.treeTargetValue.value);
  const treeSizeMessage = ref('');
  const treeSizeError = ref(false);
  const treeValueMessage = ref('');
  const treeValueError = ref(false);
  const treeMessage = ref('');
  const treeMessageError = ref(false);

  watch(
    () => algorithmInputs.treeNodeCount.value,
    value => {
      treeNodeCountInput.value = String(value);
    }
  );

  watch(
    () => algorithmInputs.treeMinValue.value,
    value => {
      treeMinValueInput.value = String(value);
    }
  );

  watch(
    () => algorithmInputs.treeMaxValue.value,
    value => {
      treeMaxValueInput.value = String(value);
    }
  );

  watch(
    () => algorithmInputs.treeTargetValue.value,
    value => {
      treeTargetValueInput.value = value;
    }
  );

  const hanoiDiskCountInput = ref(String(algorithmInputs.hanoiDiskCount.value));
  const hanoiMessage = ref('');
  const hanoiMessageError = ref(false);

  watch(
    () => algorithmInputs.hanoiDiskCount.value,
    value => {
      hanoiDiskCountInput.value = String(value);
    }
  );

  function normalizeHanoiDiskCountInput(rawValue: string) {
    const parsed = Number(rawValue);

    if (!Number.isFinite(parsed)) {
      return { normalized: algorithmInputs.hanoiDiskCount.value, adjusted: true };
    }

    const integerCount = Math.trunc(parsed);
    const clamped = Math.min(HANOI_MAX_DISKS, Math.max(HANOI_MIN_DISKS, integerCount));

    return { normalized: clamped, adjusted: clamped !== integerCount };
  }

  function applyHanoiDiskCount() {
    const { normalized, adjusted } = normalizeHanoiDiskCountInput(hanoiDiskCountInput.value);
    algorithmInputs.setHanoiDiskCount(normalized);

    hanoiDiskCountInput.value = String(algorithmInputs.hanoiDiskCount.value);
    hanoiMessageError.value = adjusted;
    hanoiMessage.value = adjusted
      ? `圆盘数量范围为 ${HANOI_MIN_DISKS}-${HANOI_MAX_DISKS}，已自动调整。`
      : `已设置 ${algorithmInputs.hanoiDiskCount.value} 个圆盘。`;
  }

  const huffmanInput = ref(algorithmInputsStore.huffmanInput);
  const huffmanMessage = ref('');
  const huffmanMessageError = ref(false);

  watch(
    () => algorithmInputsStore.huffmanInput,
    value => {
      huffmanInput.value = value;
    }
  );

  function applyHuffmanInput() {
    const trimmed = huffmanInput.value.trim();
    if (trimmed.length === 0) {
      huffmanMessage.value = '输入字符串不能为空。';
      huffmanMessageError.value = true;
      return;
    }
    algorithmInputsStore.setHuffmanInput(trimmed);
    huffmanInput.value = algorithmInputsStore.huffmanInput;
    huffmanMessage.value = `已设置输入字符串（${trimmed.length} 个字符）。`;
    huffmanMessageError.value = false;
  }

  function randomizeHuffman() {
    algorithmInputsStore.randomizeHuffmanInput();
    huffmanInput.value = algorithmInputsStore.huffmanInput;
    huffmanMessage.value = '已随机生成新字符串。';
    huffmanMessageError.value = false;
  }

  const activityIntervalCountInput = ref(String(algorithmInputsStore.activityIntervals.length));

  watch(
    () => algorithmInputsStore.activityIntervals.length,
    value => {
      activityIntervalCountInput.value = String(value);
    }
  );

  function applyActivityIntervalCount() {
    const count = Math.trunc(Number(activityIntervalCountInput.value));
    algorithmInputsStore.setActivityIntervalCount(count);
    activityIntervalCountInput.value = String(algorithmInputsStore.activityIntervals.length);
    huffmanMessage.value = `已设置 ${algorithmInputsStore.activityIntervals.length} 个活动。`;
    huffmanMessageError.value = false;
  }

  function randomizeActivity() {
    algorithmInputsStore.randomizeActivityIntervals();
    activityIntervalCountInput.value = String(algorithmInputsStore.activityIntervals.length);
    huffmanMessage.value = '已随机生成活动区间。';
    huffmanMessageError.value = false;
  }

  const dpLcsStringXInput = ref(algorithmInputsStore.dpLcsStringX);
  const dpLcsStringYInput = ref(algorithmInputsStore.dpLcsStringY);
  const dpKnapsackCapacityInput = ref(String(algorithmInputsStore.dpKnapsackCapacity));
  const dpKnapsackItemCountInput = ref(String(algorithmInputsStore.dpKnapsackItems.length));
  const dpInvestmentCountInput = ref(String(algorithmInputsStore.dpInvestmentCount));
  const dpInvestmentResourcesInput = ref(String(algorithmInputsStore.dpInvestmentResources));
  const dpMessage = ref('');
  const dpMessageError = ref(false);

  watch(
    () => algorithmInputsStore.dpLcsStringX,
    value => {
      dpLcsStringXInput.value = value;
    }
  );

  watch(
    () => algorithmInputsStore.dpLcsStringY,
    value => {
      dpLcsStringYInput.value = value;
    }
  );

  watch(
    () => algorithmInputsStore.dpKnapsackCapacity,
    value => {
      dpKnapsackCapacityInput.value = String(value);
    }
  );

  watch(
    () => algorithmInputsStore.dpKnapsackItems.length,
    value => {
      dpKnapsackItemCountInput.value = String(value);
    }
  );

  watch(
    () => algorithmInputsStore.dpInvestmentCount,
    value => {
      dpInvestmentCountInput.value = String(value);
    }
  );

  watch(
    () => algorithmInputsStore.dpInvestmentResources,
    value => {
      dpInvestmentResourcesInput.value = String(value);
    }
  );

  function applyDpLcs() {
    const x = dpLcsStringXInput.value.trim();
    const y = dpLcsStringYInput.value.trim();
    if (x.length === 0 || y.length === 0) {
      dpMessage.value = '两个字符串均不能为空。';
      dpMessageError.value = true;
      return;
    }
    algorithmInputsStore.setDpLcsStringX(x);
    algorithmInputsStore.setDpLcsStringY(y);
    dpLcsStringXInput.value = algorithmInputsStore.dpLcsStringX;
    dpLcsStringYInput.value = algorithmInputsStore.dpLcsStringY;
    dpMessage.value = `已设置 LCS 数据：X="${x}", Y="${y}"。`;
    dpMessageError.value = false;
  }

  function applyDpKnapsack() {
    const capacity = Math.trunc(Number(dpKnapsackCapacityInput.value));
    const itemCount = Math.trunc(Number(dpKnapsackItemCountInput.value));
    algorithmInputsStore.setDpKnapsackCapacity(capacity);
    algorithmInputsStore.setDpKnapsackItemCount(itemCount);
    dpKnapsackCapacityInput.value = String(algorithmInputsStore.dpKnapsackCapacity);
    dpKnapsackItemCountInput.value = String(algorithmInputsStore.dpKnapsackItems.length);
    dpMessage.value = `已设置背包数据：容量=${algorithmInputsStore.dpKnapsackCapacity}，${algorithmInputsStore.dpKnapsackItems.length} 个物品。`;
    dpMessageError.value = false;
  }

  function applyDpInvestment() {
    const count = Math.trunc(Number(dpInvestmentCountInput.value));
    const resources = Math.trunc(Number(dpInvestmentResourcesInput.value));
    algorithmInputsStore.setDpInvestmentCount(count);
    algorithmInputsStore.setDpInvestmentResources(resources);
    dpInvestmentCountInput.value = String(algorithmInputsStore.dpInvestmentCount);
    dpInvestmentResourcesInput.value = String(algorithmInputsStore.dpInvestmentResources);
    dpMessage.value = `已设置投资数据：${algorithmInputsStore.dpInvestmentCount} 项投资，资源=${algorithmInputsStore.dpInvestmentResources}。`;
    dpMessageError.value = false;
  }

  function randomizeDp() {
    const slug = options.dpAlgorithmSlug.value;
    if (slug === 'lcs') {
      algorithmInputsStore.randomizeDpLcsStrings();
      dpLcsStringXInput.value = algorithmInputsStore.dpLcsStringX;
      dpLcsStringYInput.value = algorithmInputsStore.dpLcsStringY;
    } else if (slug === 'knapsack') {
      algorithmInputsStore.randomizeDpKnapsackItems();
      dpKnapsackCapacityInput.value = String(algorithmInputsStore.dpKnapsackCapacity);
      dpKnapsackItemCountInput.value = String(algorithmInputsStore.dpKnapsackItems.length);
    } else if (slug === 'investment') {
      algorithmInputsStore.randomizeDpInvestmentReturns();
      dpInvestmentCountInput.value = String(algorithmInputsStore.dpInvestmentCount);
      dpInvestmentResourcesInput.value = String(algorithmInputsStore.dpInvestmentResources);
    }
    dpMessage.value = '已随机生成新数据。';
    dpMessageError.value = false;
  }

  const nQueensSizeInput = ref(String(algorithmInputsStore.nQueensSize));
  const subsetSumArrayInput = ref(algorithmInputsStore.subsetSumArray.join(', '));
  const subsetSumTargetInput = ref(String(algorithmInputsStore.subsetSumTarget));
  const backtrackingMessage = ref('');
  const backtrackingMessageError = ref(false);

  watch(
    () => algorithmInputsStore.nQueensSize,
    value => {
      nQueensSizeInput.value = String(value);
    }
  );

  watch(
    () => algorithmInputsStore.subsetSumArray,
    value => {
      subsetSumArrayInput.value = value.join(', ');
    }
  );

  watch(
    () => algorithmInputsStore.subsetSumTarget,
    value => {
      subsetSumTargetInput.value = String(value);
    }
  );

  function applyNQueensSize() {
    const parsed = Math.trunc(Number(nQueensSizeInput.value));
    algorithmInputsStore.setNQueensSize(parsed);
    nQueensSizeInput.value = String(algorithmInputsStore.nQueensSize);
    backtrackingMessage.value = `已设置棋盘大小为 ${algorithmInputsStore.nQueensSize}×${algorithmInputsStore.nQueensSize}。`;
    backtrackingMessageError.value = false;
  }

  function applySubsetSum() {
    const nums = subsetSumArrayInput.value
      .split(/[,，\s]+/)
      .map(s => Number(s.trim()))
      .filter(v => Number.isFinite(v));
    const target = Math.trunc(Number(subsetSumTargetInput.value));
    algorithmInputsStore.setSubsetSumArray(nums);
    algorithmInputsStore.setSubsetSumTarget(target);
    subsetSumArrayInput.value = algorithmInputsStore.subsetSumArray.join(', ');
    subsetSumTargetInput.value = String(algorithmInputsStore.subsetSumTarget);
    backtrackingMessage.value = `已设置子集和数据：[${algorithmInputsStore.subsetSumArray.join(', ')}]，目标=${algorithmInputsStore.subsetSumTarget}。`;
    backtrackingMessageError.value = false;
  }

  function randomizeBacktracking() {
    const slug = options.backtrackingAlgorithmSlug.value;
    if (slug === 'n-queens') {
      algorithmInputsStore.randomizeNQueensInput();
      nQueensSizeInput.value = String(algorithmInputsStore.nQueensSize);
    } else if (slug === 'subset-sum') {
      algorithmInputsStore.randomizeSubsetSumInput();
      subsetSumArrayInput.value = algorithmInputsStore.subsetSumArray.join(', ');
      subsetSumTargetInput.value = String(algorithmInputsStore.subsetSumTarget);
    }
    backtrackingMessage.value = '已随机生成新数据。';
    backtrackingMessageError.value = false;
  }

  function normalizeSizeInput(rawValue: string) {
    const parsed = Number(rawValue);

    if (!Number.isFinite(parsed)) {
      return {
        normalized: sortingSize.value,
        adjusted: true,
      };
    }

    const integerSize = Math.trunc(parsed);
    const clamped = Math.min(SORTING_MAX_SIZE, Math.max(SORTING_MIN_SIZE, integerSize));

    return {
      normalized: clamped,
      adjusted: clamped !== integerSize,
    };
  }

  function applySizeFromInput() {
    const { normalized, adjusted } = normalizeSizeInput(sizeInput.value);

    sizeInput.value = String(normalized);
    sizeError.value = adjusted;
    sizeMessage.value = adjusted
      ? `长度范围为 ${SORTING_MIN_SIZE}-${SORTING_MAX_SIZE}，已自动调整。`
      : '';

    return normalized;
  }

  function normalizeGraphNodeCountInput(rawValue: string) {
    const parsed = Number(rawValue);

    if (!Number.isFinite(parsed)) {
      return {
        normalized: graphNodeCount.value,
        adjusted: true,
      };
    }

    const integerCount = Math.trunc(parsed);
    const clamped = Math.min(GRAPH_MAX_NODES, Math.max(GRAPH_MIN_NODES, integerCount));

    return {
      normalized: clamped,
      adjusted: clamped !== integerCount,
    };
  }

  function applyGraphNodeCountFromInput() {
    const { normalized, adjusted } = normalizeGraphNodeCountInput(graphNodeCountInput.value);
    const appliedCount = algorithmInputs.setGraphNodeCount(normalized);

    graphNodeCountInput.value = String(appliedCount);
    graphSizeError.value = adjusted;
    graphSizeMessage.value = adjusted
      ? `节点数量范围为 ${GRAPH_MIN_NODES}-${GRAPH_MAX_NODES}，已自动调整。`
      : `已更新为 ${appliedCount} 个节点。`;

    graphMessage.value = '';
    graphMessageError.value = false;

    return appliedCount;
  }

  function applyGraphStartNode() {
    if (graphNodeOptions.value.length === 0) {
      graphMessage.value = '当前无可用节点。';
      graphMessageError.value = true;
      return;
    }

    algorithmInputs.setGraphStartNode(graphStartNodeInput.value);
    graphMessage.value = `已设置起始节点为 ${algorithmInputs.graphStartNode.value}。`;
    graphMessageError.value = false;
  }

  function applyCustomData() {
    const result = algorithmInputs.applyCustomSortingInput(customData.value);
    customDataMessage.value = result.message;
    customDataError.value = !result.ok;

    if (result.ok) {
      customData.value = algorithmInputs.sortingInput.value.join(', ');
    }
  }

  function normalizeTreeNodeCountInput(rawValue: string) {
    const parsed = Number(rawValue);

    if (!Number.isFinite(parsed)) {
      return { normalized: algorithmInputs.treeNodeCount.value, adjusted: true };
    }

    const integerCount = Math.trunc(parsed);
    const clamped = Math.min(TREE_MAX_NODES, Math.max(TREE_MIN_NODES, integerCount));

    return { normalized: clamped, adjusted: clamped !== integerCount };
  }

  function applyTreeNodeCountFromInput() {
    const { normalized, adjusted } = normalizeTreeNodeCountInput(treeNodeCountInput.value);
    algorithmInputs.setTreeNodeCount(normalized);

    treeNodeCountInput.value = String(algorithmInputs.treeNodeCount.value);
    treeSizeError.value = adjusted;
    treeSizeMessage.value = adjusted
      ? `节点数量范围为 ${TREE_MIN_NODES}-${TREE_MAX_NODES}，已自动调整。`
      : `已更新为 ${algorithmInputs.treeNodeCount.value} 个节点。`;

    treeMessage.value = '';
    treeMessageError.value = false;
  }

  function normalizeTreeValueRange(minRaw: string, maxRaw: string) {
    const minParsed = Number(minRaw);
    const maxParsed = Number(maxRaw);

    if (!Number.isFinite(minParsed) || !Number.isFinite(maxParsed)) {
      return {
        min: algorithmInputs.treeMinValue.value,
        max: algorithmInputs.treeMaxValue.value,
        adjusted: true,
      };
    }

    const minClamped = Math.min(TREE_VALUE_MAX, Math.max(TREE_VALUE_MIN, Math.trunc(minParsed)));
    const maxClamped = Math.min(TREE_VALUE_MAX, Math.max(TREE_VALUE_MIN, Math.trunc(maxParsed)));

    return {
      min: minClamped,
      max: maxClamped,
      adjusted: minClamped !== minParsed || maxClamped !== maxParsed,
    };
  }

  function applyTreeValueRangeFromInput() {
    const { min, max, adjusted } = normalizeTreeValueRange(
      treeMinValueInput.value,
      treeMaxValueInput.value
    );
    algorithmInputs.setTreeValueRange(min, max);

    treeMinValueInput.value = String(algorithmInputs.treeMinValue.value);
    treeMaxValueInput.value = String(algorithmInputs.treeMaxValue.value);
    treeValueError.value = adjusted;
    treeValueMessage.value = adjusted
      ? `数值范围为 ${TREE_VALUE_MIN}-${TREE_VALUE_MAX}，已自动调整。`
      : `已更新范围为 ${algorithmInputs.treeMinValue.value} - ${algorithmInputs.treeMaxValue.value}。`;

    treeMessage.value = '';
    treeMessageError.value = false;
  }

  function applyTreeTargetValue() {
    algorithmInputs.setTreeTargetValue(treeTargetValueInput.value);
    treeMessage.value = `已设置查找目标为 ${algorithmInputs.treeTargetValue.value}。`;
    treeMessageError.value = false;
  }

  function randomizeData() {
    if (options.isHanoiAlgorithm.value) {
      const { normalized } = normalizeHanoiDiskCountInput(hanoiDiskCountInput.value);
      algorithmInputs.setHanoiDiskCount(normalized);
      hanoiDiskCountInput.value = String(algorithmInputs.hanoiDiskCount.value);
      hanoiMessage.value = `已随机生成 ${algorithmInputs.hanoiDiskCount.value} 个圆盘。`;
      hanoiMessageError.value = false;
      return;
    }

    if (options.isGreedyAlgorithm.value) {
      const slug = options.greedyAlgorithmSlug.value;
      if (slug === 'huffman') {
        algorithmInputsStore.randomizeHuffmanInput();
        huffmanInput.value = algorithmInputsStore.huffmanInput;
        huffmanMessage.value = '已随机生成新字符串。';
        huffmanMessageError.value = false;
      } else if (slug === 'activity-selection') {
        algorithmInputsStore.randomizeActivityIntervals();
        huffmanMessage.value = '已随机生成活动区间。';
        huffmanMessageError.value = false;
      } else if (slug === 'dijkstra') {
        const count = normalizeGraphNodeCountInput(graphNodeCountInput.value).normalized;
        graphNodeCountInput.value = String(count);
        algorithmInputs.randomizeGraphInput(count);
        graphStartNodeInput.value = algorithmInputs.graphStartNode.value;
        graphSizeMessage.value = '';
        graphSizeError.value = false;
        graphMessage.value = `已随机生成 ${count} 个节点，起始节点为 ${algorithmInputs.graphStartNode.value}。`;
        graphMessageError.value = false;
      }
      return;
    }

    if (options.isDpAlgorithm.value) {
      randomizeDp();
      return;
    }

    if (options.isBacktrackingAlgorithm.value) {
      randomizeBacktracking();
      return;
    }

    if (options.isTreeAlgorithm.value) {
      const count = normalizeTreeNodeCountInput(treeNodeCountInput.value).normalized;
      algorithmInputs.randomizeTreeInput(
        count,
        Number(treeMinValueInput.value),
        Number(treeMaxValueInput.value)
      );

      treeNodeCountInput.value = String(algorithmInputs.treeNodeCount.value);
      treeMinValueInput.value = String(algorithmInputs.treeMinValue.value);
      treeMaxValueInput.value = String(algorithmInputs.treeMaxValue.value);
      treeTargetValueInput.value = algorithmInputs.treeTargetValue.value;
      treeSizeMessage.value = '';
      treeSizeError.value = false;
      treeValueMessage.value = '';
      treeValueError.value = false;
      treeMessage.value = `已随机生成 ${algorithmInputs.treeNodeCount.value} 个节点，查找目标为 ${algorithmInputs.treeTargetValue.value}。`;
      treeMessageError.value = false;
      return;
    }

    if (options.isGraphAlgorithm.value) {
      const count = normalizeGraphNodeCountInput(graphNodeCountInput.value).normalized;
      graphNodeCountInput.value = String(count);
      algorithmInputs.randomizeGraphInput(count);
      graphStartNodeInput.value = algorithmInputs.graphStartNode.value;
      graphSizeMessage.value = '';
      graphSizeError.value = false;
      graphMessage.value = `已随机生成 ${count} 个节点，起始节点为 ${algorithmInputs.graphStartNode.value}。`;
      graphMessageError.value = false;
      return;
    }

    const size = applySizeFromInput();
    algorithmInputs.randomizeAlgorithmInput(size);
    customData.value = algorithmInputs.sortingInput.value.join(', ');
    customDataError.value = false;
    customDataMessage.value = `已按 ${size} 个元素生成随机输入。`;
  }

  function downloadTextFile(fileName: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  function exportJsonFile() {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    let text: string;
    let fileName: string;

    if (options.isGraphAlgorithm.value) {
      text = algorithmInputs.exportGraphAsJsonText();
      fileName = `graph-input-${timestamp}.json`;
    } else if (options.isTreeAlgorithm.value) {
      text = algorithmInputs.exportTreeAsJsonText();
      fileName = `tree-input-${timestamp}.json`;
    } else if (options.isHanoiAlgorithm.value) {
      text = JSON.stringify({ hanoiDiskCount: algorithmInputs.hanoiDiskCount.value }, null, 2);
      fileName = `hanoi-input-${timestamp}.json`;
    } else if (options.isDpAlgorithm.value) {
      const slug = options.dpAlgorithmSlug.value;
      text = algorithmInputs.exportDpAsJsonText(
        slug === 'lcs' ? 'lcs' : slug === 'knapsack' ? 'knapsack' : 'investment'
      );
      fileName = `dp-${slug}-input-${timestamp}.json`;
    } else {
      text = algorithmInputs.exportSortingAsJsonText();
      fileName = `sorting-input-${timestamp}.json`;
    }

    downloadTextFile(fileName, text, 'application/json;charset=utf-8');
    customDataError.value = false;
    customDataMessage.value = '已导出 JSON 文件。';
  }

  async function handleImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const lowerCaseName = file.name.toLowerCase();

      if (!lowerCaseName.endsWith('.json')) {
        customDataError.value = true;
        customDataMessage.value = '仅支持 .json 文件。';
        return;
      }

      let result: { ok: boolean; message: string };

      if (options.isGraphAlgorithm.value) {
        result = algorithmInputs.importGraphFromJsonText(text);
      } else if (options.isTreeAlgorithm.value) {
        result = algorithmInputs.importTreeFromJsonText(text);
      } else if (options.isHanoiAlgorithm.value) {
        try {
          const parsed = JSON.parse(text);
          if (typeof parsed.hanoiDiskCount === 'number') {
            algorithmInputs.setHanoiDiskCount(parsed.hanoiDiskCount);
            hanoiDiskCountInput.value = String(algorithmInputs.hanoiDiskCount.value);
            result = {
              ok: true,
              message: `已导入 ${algorithmInputs.hanoiDiskCount.value} 个圆盘。`,
            };
          } else {
            result = { ok: false, message: 'JSON 格式无效，缺少 hanoiDiskCount 字段。' };
          }
        } catch {
          result = { ok: false, message: 'JSON 解析失败，请检查文件内容。' };
        }
      } else if (options.isDpAlgorithm.value) {
        result = algorithmInputs.importDpFromJsonText(text);
      } else {
        result = algorithmInputs.importSortingFromJsonText(text);
      }

      customDataError.value = !result.ok;
      customDataMessage.value = result.message;

      if (result.ok) {
        if (
          !options.isGraphAlgorithm.value &&
          !options.isTreeAlgorithm.value &&
          !options.isDpAlgorithm.value
        ) {
          customData.value = algorithmInputs.sortingInput.value.join(', ');
        }
        if (options.isGraphAlgorithm.value) {
          graphNodeCountInput.value = String(algorithmInputs.graphNodeCount.value);
          graphStartNodeInput.value = algorithmInputs.graphStartNode.value;
        }
        if (options.isTreeAlgorithm.value) {
          treeNodeCountInput.value = String(algorithmInputs.treeNodeCount.value);
          treeTargetValueInput.value = algorithmInputs.treeTargetValue.value;
        }
        if (options.isDpAlgorithm.value) {
          dpLcsStringXInput.value = algorithmInputsStore.dpLcsStringX;
          dpLcsStringYInput.value = algorithmInputsStore.dpLcsStringY;
          dpKnapsackCapacityInput.value = String(algorithmInputsStore.dpKnapsackCapacity);
          dpKnapsackItemCountInput.value = String(algorithmInputsStore.dpKnapsackItems.length);
          dpInvestmentCountInput.value = String(algorithmInputsStore.dpInvestmentCount);
          dpInvestmentResourcesInput.value = String(algorithmInputsStore.dpInvestmentResources);
        }
      }
    } catch {
      customDataError.value = true;
      customDataMessage.value = '读取文件失败，请重试。';
    } finally {
      input.value = '';
    }
  }

  const sortingData = computed<SortingSectionData>(() => ({
    sizeRange: { min: SORTING_MIN_SIZE, max: SORTING_MAX_SIZE },
    sizeValidation: { message: sizeMessage.value, error: sizeError.value },
    customValidation: { message: customDataMessage.value, error: customDataError.value },
  }));

  const graphData = computed<GraphSectionData>(() => ({
    nodeCountRange: { min: GRAPH_MIN_NODES, max: GRAPH_MAX_NODES },
    sizeValidation: { message: graphSizeMessage.value, error: graphSizeError.value },
    nodeOptions: graphNodeOptions.value,
    generalValidation: { message: graphMessage.value, error: graphMessageError.value },
  }));

  const treeData = computed<TreeSectionData>(() => ({
    nodeCountRange: { min: TREE_MIN_NODES, max: TREE_MAX_NODES },
    valueRange: { min: TREE_VALUE_MIN, max: TREE_VALUE_MAX },
    sizeValidation: { message: treeSizeMessage.value, error: treeSizeError.value },
    valueValidation: { message: treeValueMessage.value, error: treeValueError.value },
    generalValidation: { message: treeMessage.value, error: treeMessageError.value },
  }));

  return {
    sizeInput,
    sizeMessage,
    sizeError,
    graphNodeCountInput,
    graphSizeMessage,
    graphSizeError,
    graphStartNodeInput,
    graphMessage,
    graphMessageError,
    graphNodeOptions,
    treeNodeCountInput,
    treeMinValueInput,
    treeMaxValueInput,
    treeTargetValueInput,
    treeSizeMessage,
    treeSizeError,
    treeValueMessage,
    treeValueError,
    treeMessage,
    treeMessageError,
    customData,
    customDataMessage,
    customDataError,
    sortingData,
    graphData,
    treeData,
    hanoiDiskCountInput,
    hanoiMessage,
    hanoiMessageError,
    applyHanoiDiskCount,
    huffmanInput,
    huffmanMessage,
    huffmanMessageError,
    applyHuffmanInput,
    randomizeHuffman,
    randomizeActivity,
    activityIntervalCountInput,
    applyActivityIntervalCount,
    applySizeFromInput,
    applyGraphNodeCountFromInput,
    applyGraphStartNode,
    applyTreeNodeCountFromInput,
    applyTreeValueRangeFromInput,
    applyTreeTargetValue,
    applyCustomData,
    randomizeData,
    exportJsonFile,
    handleImportFile,
    dpLcsStringXInput,
    dpLcsStringYInput,
    dpKnapsackCapacityInput,
    dpKnapsackItemCountInput,
    dpInvestmentCountInput,
    dpInvestmentResourcesInput,
    dpMessage,
    dpMessageError,
    applyDpLcs,
    applyDpKnapsack,
    applyDpInvestment,
    randomizeDp,
    nQueensSizeInput,
    subsetSumArrayInput,
    subsetSumTargetInput,
    backtrackingMessage,
    backtrackingMessageError,
    applyNQueensSize,
    applySubsetSum,
    randomizeBacktracking,
  };
}
