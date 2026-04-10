<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { findAlgorithm } from '@/algorithms/registry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SettingsOverviewTab from '@/components/settings-panel/SettingsOverviewTab.vue';
import SettingsPanelDataTab from '@/components/settings-panel/SettingsPanelDataTab.vue';
import SettingsPanelFileTab from '@/components/settings-panel/SettingsPanelFileTab.vue';
import SettingsPanelHeaderBar from '@/components/settings-panel/SettingsPanelHeaderBar.vue';
import {
  GRAPH_MAX_NODES,
  GRAPH_MIN_NODES,
  SORTING_MAX_SIZE,
  SORTING_MIN_SIZE,
  useAlgorithmInputsStore,
} from '@/stores/algorithmInputs';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';

const algorithmInputsStore = useAlgorithmInputsStore();
const playbackStore = useAlgorithmPlaybackStore();
const route = useRoute();
const algorithmInputsRefs = storeToRefs(algorithmInputsStore);
const playbackRefs = storeToRefs(playbackStore);

const algorithmInputs = {
  ...algorithmInputsRefs,
  randomizeAlgorithmInput: algorithmInputsStore.randomizeAlgorithmInput,
  applyCustomSortingInput: algorithmInputsStore.applyCustomSortingInput,
  exportSortingAsJsonText: algorithmInputsStore.exportSortingAsJsonText,
  importSortingFromJsonText: algorithmInputsStore.importSortingFromJsonText,
  randomizeGraphInput: algorithmInputsStore.randomizeGraphInput,
  setGraphNodeCount: algorithmInputsStore.setGraphNodeCount,
  setGraphStartNode: algorithmInputsStore.setGraphStartNode,
};
const playback = {
  ...playbackRefs,
};

const activeAlgorithm = computed(() => {
  const category = String(route.params.category ?? '');
  const slug = String(route.params.slug ?? '');
  return findAlgorithm(category, slug);
});

const isCompareView = computed(() => route.name === 'CompareView');

const steps = computed(() => activeAlgorithm.value?.createSteps() ?? []);

const currentStepData = computed(() => {
  if (steps.value.length === 0) {
    return null;
  }
  return steps.value[playback.currentStep.value] ?? steps.value[0];
});

const isSortingAlgorithm = computed(
  () => isCompareView.value || activeAlgorithm.value?.visualization === 'sorting'
);
const isGraphAlgorithm = computed(() => activeAlgorithm.value?.visualization === 'graph');

const panelTitle = computed(() => {
  if (isCompareView.value) {
    return '排序算法对比';
  }
  return activeAlgorithm.value?.title ?? '算法未找到';
});

const panelDescription = computed(() => {
  if (isCompareView.value) {
    return '对比模式共享同一份排序输入。修改后会同时影响左右算法。';
  }
  return activeAlgorithm.value?.description ?? '请从左侧重新选择算法。';
});

const stepDescription = computed(() => {
  if (isCompareView.value) {
    return '对比模式下步骤描述请查看中间画布上方的左右算法说明。';
  }
  return currentStepData.value?.description ?? '暂无步骤数据';
});

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
const activeTab = ref<'overview' | 'data' | 'files'>('overview');
const panelScrollRef = ref<HTMLDivElement | null>(null);

const modeLabel = computed(() => {
  if (isCompareView.value) {
    return '对比模式';
  }
  return isGraphAlgorithm.value ? '图算法' : '排序算法';
});

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

watch(activeTab, async () => {
  await nextTick();
  if (panelScrollRef.value) {
    panelScrollRef.value.scrollTop = 0;
  }
});

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

function randomizeData() {
  if (isGraphAlgorithm.value) {
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
  const text = algorithmInputs.exportSortingAsJsonText();
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const fileName = `sorting-input-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;
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
    const result = lowerCaseName.endsWith('.json')
      ? algorithmInputs.importSortingFromJsonText(text)
      : {
          ok: false,
          message: '仅支持 .json 文件。',
        };

    customDataError.value = !result.ok;
    customDataMessage.value = result.message;

    if (result.ok) {
      customData.value = algorithmInputs.sortingInput.value.join(', ');
    }
  } catch {
    customDataError.value = true;
    customDataMessage.value = '读取文件失败，请重试。';
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <div
    ref="panelScrollRef"
    class="hidden h-full w-72 flex-col gap-4 overflow-y-auto border-l border-sidebar-border/80 bg-sidebar px-4 py-6 lg:flex xl:w-80 xl:px-5"
  >
    <SettingsPanelHeaderBar :title="panelTitle" :mode-label="modeLabel" />

    <Tabs v-model="activeTab" class="gap-3">
      <TabsList class="grid h-9 w-full grid-cols-3">
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="data">数据设置</TabsTrigger>
        <TabsTrigger value="files">文件操作</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" class="pt-1">
        <SettingsOverviewTab
          :panel-description="panelDescription"
          :step-description="stepDescription"
          :is-compare-view="isCompareView"
        />
      </TabsContent>

      <TabsContent value="data" class="pt-1">
        <SettingsPanelDataTab
          v-model:size-input="sizeInput"
          v-model:graph-node-count-input="graphNodeCountInput"
          v-model:graph-start-node-input="graphStartNodeInput"
          v-model:custom-data="customData"
          :is-sorting-algorithm="isSortingAlgorithm"
          :is-graph-algorithm="isGraphAlgorithm"
          :sorting-min-size="SORTING_MIN_SIZE"
          :sorting-max-size="SORTING_MAX_SIZE"
          :size-message="sizeMessage"
          :size-error="sizeError"
          :graph-min-nodes="GRAPH_MIN_NODES"
          :graph-max-nodes="GRAPH_MAX_NODES"
          :graph-size-message="graphSizeMessage"
          :graph-size-error="graphSizeError"
          :graph-node-options="graphNodeOptions"
          :graph-message="graphMessage"
          :graph-message-error="graphMessageError"
          :custom-data-message="customDataMessage"
          :custom-data-error="customDataError"
          :randomize-data="randomizeData"
          :apply-size-from-input="applySizeFromInput"
          :apply-graph-node-count-from-input="applyGraphNodeCountFromInput"
          :apply-graph-start-node="applyGraphStartNode"
          :apply-custom-data="applyCustomData"
        />
      </TabsContent>

      <TabsContent value="files" class="pt-1">
        <SettingsPanelFileTab
          :is-sorting-algorithm="isSortingAlgorithm"
          :custom-data-message="customDataMessage"
          :custom-data-error="customDataError"
          :export-json-file="exportJsonFile"
          :handle-import-file="handleImportFile"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
