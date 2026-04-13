<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import {
  COMPARE_DEFAULT_CATEGORY,
  getCompareOptionsByCategory,
  isAlgorithmCategory,
  normalizeComparePair,
  findAlgorithm,
  resolveAlgorithmBySlug,
} from '@/algorithms/registry';
import type { AlgorithmCategory } from '@/types/algorithm';
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
const router = useRouter();
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
  setCompareContinueLonger: playbackStore.setCompareContinueLonger,
};

const activeAlgorithm = computed(() => {
  const category = String(route.params.category ?? '');
  const slug = String(route.params.slug ?? '');
  return findAlgorithm(category, slug);
});

function readStoredCompareCategory() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const rawValue = window.localStorage.getItem('algo-compare:last-category');
  if (!rawValue || !isAlgorithmCategory(rawValue)) {
    return undefined;
  }

  return rawValue;
}

const isCompareView = computed(() => route.name === 'CompareView');

const compareCategory = computed(() => {
  if (!isCompareView.value) {
    return null;
  }

  const queryLeft = typeof route.query.left === 'string' ? route.query.left : '';
  const queryRight = typeof route.query.right === 'string' ? route.query.right : '';
  const normalized = normalizeComparePair({
    leftSlug: queryLeft,
    rightSlug: queryRight,
    preferredCategory: readStoredCompareCategory() ?? COMPARE_DEFAULT_CATEGORY,
  });
  return normalized.category;
});

const compareOptions = computed(() => {
  if (!compareCategory.value) {
    return [];
  }
  return getCompareOptionsByCategory(compareCategory.value);
});

const compareLeftSlug = computed(() => {
  const queryLeft = typeof route.query.left === 'string' ? route.query.left : '';
  const queryRight = typeof route.query.right === 'string' ? route.query.right : '';
  const normalized = normalizeComparePair({
    leftSlug: queryLeft,
    rightSlug: queryRight,
    preferredCategory: readStoredCompareCategory() ?? COMPARE_DEFAULT_CATEGORY,
  });
  return normalized.left;
});

const compareRightSlug = computed(() => {
  const queryLeft = typeof route.query.left === 'string' ? route.query.left : '';
  const queryRight = typeof route.query.right === 'string' ? route.query.right : '';
  const normalized = normalizeComparePair({
    leftSlug: queryLeft,
    rightSlug: queryRight,
    preferredCategory: readStoredCompareCategory() ?? COMPARE_DEFAULT_CATEGORY,
  });
  return normalized.right;
});

const compareLeftAlgorithm = computed(() => resolveAlgorithmBySlug(compareLeftSlug.value));
const compareRightAlgorithm = computed(() => resolveAlgorithmBySlug(compareRightSlug.value));
const compareLeftStepsCount = computed(() => compareLeftAlgorithm.value?.createSteps().length ?? 0);
const compareRightStepsCount = computed(
  () => compareRightAlgorithm.value?.createSteps().length ?? 0
);
const compareLeftCurrentStep = computed(() => {
  if (compareLeftStepsCount.value === 0) {
    return 0;
  }
  return Math.min(playback.currentStep.value + 1, compareLeftStepsCount.value);
});
const compareRightCurrentStep = computed(() => {
  if (compareRightStepsCount.value === 0) {
    return 0;
  }
  return Math.min(playback.currentStep.value + 1, compareRightStepsCount.value);
});
const compareLeftCompleted = computed(
  () =>
    compareLeftStepsCount.value > 0 && playback.currentStep.value >= compareLeftStepsCount.value - 1
);
const compareRightCompleted = computed(
  () =>
    compareRightStepsCount.value > 0 &&
    playback.currentStep.value >= compareRightStepsCount.value - 1
);
const compareLeftStatusText = computed(() => {
  if (
    playback.compareContinueLonger.value &&
    compareLeftCompleted.value &&
    !compareRightCompleted.value
  ) {
    return '已完成，等待右侧';
  }
  return compareLeftCompleted.value ? '已完成' : '执行中';
});
const compareRightStatusText = computed(() => {
  if (
    playback.compareContinueLonger.value &&
    compareRightCompleted.value &&
    !compareLeftCompleted.value
  ) {
    return '已完成，等待左侧';
  }
  return compareRightCompleted.value ? '已完成' : '执行中';
});

function persistCompareCategory(category: string) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem('algo-compare:last-category', category);
}

function updateCompareQuery(
  rawLeft: string,
  rawRight: string,
  preferredCategory?: AlgorithmCategory
) {
  const normalized = normalizeComparePair({
    leftSlug: rawLeft,
    rightSlug: rawRight,
    preferredCategory: preferredCategory ?? readStoredCompareCategory() ?? COMPARE_DEFAULT_CATEGORY,
  });

  persistCompareCategory(normalized.category);

  void router.replace({
    name: 'CompareView',
    query: {
      left: normalized.left,
      right: normalized.right,
    },
  });
}

function handleCompareCategorySwitch(nextCategory: string) {
  if (!isAlgorithmCategory(nextCategory) || nextCategory === compareCategory.value) {
    return;
  }

  updateCompareQuery('', '', nextCategory);
}

function handleCompareLeftChange(nextSlug: string) {
  if (!nextSlug) {
    return;
  }
  updateCompareQuery(nextSlug, compareRightSlug.value, compareCategory.value ?? undefined);
}

function handleCompareRightChange(nextSlug: string) {
  if (!nextSlug) {
    return;
  }
  updateCompareQuery(compareLeftSlug.value, nextSlug, compareCategory.value ?? undefined);
}

function handleCompareSwap() {
  updateCompareQuery(
    compareRightSlug.value,
    compareLeftSlug.value,
    compareCategory.value ?? undefined
  );
}

const steps = computed(() => activeAlgorithm.value?.createSteps() ?? []);

const currentStepData = computed(() => {
  if (steps.value.length === 0) {
    return null;
  }
  return steps.value[playback.currentStep.value] ?? steps.value[0];
});

const isSortingAlgorithm = computed(
  () =>
    (isCompareView.value && compareCategory.value === 'sorting') ||
    activeAlgorithm.value?.visualization === 'sorting'
);
const isGraphAlgorithm = computed(
  () =>
    (isCompareView.value && compareCategory.value === 'graphs') ||
    activeAlgorithm.value?.visualization === 'graph'
);

const panelTitle = computed(() => {
  if (isCompareView.value) {
    return compareCategory.value === 'graphs' ? '图算法对比' : '排序算法对比';
  }
  return activeAlgorithm.value?.title ?? '算法未找到';
});

const panelDescription = computed(() => {
  if (isCompareView.value) {
    if (compareCategory.value === 'graphs') {
      return '对比模式共享同一份图输入。修改后会同时影响左右算法。';
    }
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
const activeTab = ref<'overview' | 'compare' | 'data' | 'files'>(
  isCompareView.value ? 'compare' : 'overview'
);
const panelScrollRef = ref<HTMLDivElement | null>(null);

const modeLabel = computed(() => {
  if (isCompareView.value) {
    return compareCategory.value === 'graphs' ? '图算法对比模式' : '排序算法对比模式';
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

watch(isCompareView, value => {
  if (value && activeTab.value === 'overview') {
    activeTab.value = 'compare';
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
        <TabsTrigger v-if="!isCompareView" value="overview">概览</TabsTrigger>
        <TabsTrigger v-if="isCompareView" value="compare">对比配置</TabsTrigger>
        <TabsTrigger value="data">数据设置</TabsTrigger>
        <TabsTrigger value="files">文件操作</TabsTrigger>
      </TabsList>

      <TabsContent v-if="!isCompareView" value="overview" class="pt-1">
        <SettingsOverviewTab
          :panel-description="panelDescription"
          :step-description="stepDescription"
          :is-compare-view="isCompareView"
        />
      </TabsContent>

      <TabsContent v-if="isCompareView" value="compare" class="pt-1">
        <div class="space-y-4">
          <FieldSet>
            <FieldLegend>算法组</FieldLegend>
            <FieldContent>
              <Select
                :model-value="compareCategory ?? COMPARE_DEFAULT_CATEGORY"
                @update:model-value="
                  value =>
                    typeof value === 'string' &&
                    isAlgorithmCategory(value) &&
                    handleCompareCategorySwitch(value)
                "
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择算法组" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sorting">排序算法</SelectItem>
                  <SelectItem value="graphs">图算法</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </FieldSet>

          <FieldSet>
            <FieldLegend>算法选择</FieldLegend>
            <FieldContent class="space-y-3">
              <Field class="gap-2">
                <FieldLabel class="text-sm text-muted-foreground">左侧算法</FieldLabel>
                <Select
                  :model-value="compareLeftSlug"
                  @update:model-value="
                    value => typeof value === 'string' && handleCompareLeftChange(value)
                  "
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择左侧算法" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="item in compareOptions"
                      :key="`panel-left-${item.slug}`"
                      :value="item.slug"
                    >
                      {{ item.title }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Button variant="outline" size="sm" class="w-full" @click="handleCompareSwap">
                交换左右算法
              </Button>

              <Field class="gap-2">
                <FieldLabel class="text-sm text-muted-foreground">右侧算法</FieldLabel>
                <Select
                  :model-value="compareRightSlug"
                  @update:model-value="
                    value => typeof value === 'string' && handleCompareRightChange(value)
                  "
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择右侧算法" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="item in compareOptions"
                      :key="`panel-right-${item.slug}`"
                      :value="item.slug"
                    >
                      {{ item.title }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldContent>
          </FieldSet>

          <FieldSet>
            <FieldLegend>执行模式</FieldLegend>
            <FieldContent>
              <Field orientation="responsive" class="gap-2">
                <FieldLabel class="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    :checked="playback.compareContinueLonger.value"
                    type="checkbox"
                    class="h-4 w-4 rounded border-input accent-primary"
                    @change="
                      event =>
                        playback.setCompareContinueLonger(
                          (event.target as HTMLInputElement).checked
                        )
                    "
                  />
                  继续执行较长算法
                </FieldLabel>
                <FieldDescription>
                  {{
                    playback.compareContinueLonger.value
                      ? '模式：执行到较长算法结束'
                      : '模式：同步对比（最短步数）'
                  }}
                </FieldDescription>
              </Field>
            </FieldContent>
          </FieldSet>

          <div class="space-y-2 rounded-lg bg-muted/50 p-3 text-xs ring-1 ring-border/70">
            <p class="font-medium text-foreground">对比进度</p>
            <p class="text-muted-foreground">总步数：{{ playback.totalSteps.value }}</p>
            <div class="rounded-md bg-background/80 p-2 ring-1 ring-border/70">
              <p class="text-muted-foreground">
                左侧：{{ compareLeftCurrentStep }} / {{ compareLeftStepsCount }}
              </p>
              <p class="mt-1 text-foreground">状态：{{ compareLeftStatusText }}</p>
            </div>
            <div class="rounded-md bg-background/80 p-2 ring-1 ring-border/70">
              <p class="text-muted-foreground">
                右侧：{{ compareRightCurrentStep }} / {{ compareRightStepsCount }}
              </p>
              <p class="mt-1 text-foreground">状态：{{ compareRightStatusText }}</p>
            </div>
          </div>
        </div>
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
