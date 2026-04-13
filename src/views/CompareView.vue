<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import GraphTraversalView from '@/components/visualization/GraphTraversalView.vue';
import SortingChart from '@/components/visualization/SortingChart.vue';
import {
  COMPARE_DEFAULT_CATEGORY,
  getCompareOptionsByCategory,
  isAlgorithmCategory,
  normalizeComparePair,
  resolveAlgorithmBySlug,
} from '@/algorithms/registry';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import type { AlgorithmCategory, GraphStep, SortingStep } from '@/types/algorithm';

const route = useRoute();
const router = useRouter();
const algorithmInputsStore = useAlgorithmInputsStore();
const playbackStore = useAlgorithmPlaybackStore();
const playbackRefs = storeToRefs(playbackStore);

const playback = {
  ...playbackRefs,
  seekTo: playbackStore.seekTo,
  setSpeed: playbackStore.setSpeed,
  play: playbackStore.play,
  pause: playbackStore.pause,
  reset: playbackStore.reset,
  step: playbackStore.step,
  stepBack: playbackStore.stepBack,
  setTotalSteps: playbackStore.setTotalSteps,
};

const { dataVersion } = storeToRefs(algorithmInputsStore);
const continueLonger = ref(true);
const completionNotice = ref('');

let completionNoticeTimer: number | null = null;
const COMPARE_LAST_CATEGORY_KEY = 'algo-compare:last-category';

function readStoredCompareCategory(): AlgorithmCategory | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const rawValue = window.localStorage.getItem(COMPARE_LAST_CATEGORY_KEY);
  if (!rawValue || !isAlgorithmCategory(rawValue)) {
    return undefined;
  }

  return rawValue;
}

function storeCompareCategory(category: AlgorithmCategory) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(COMPARE_LAST_CATEGORY_KEY, category);
}

function clearCompletionNoticeTimer() {
  if (completionNoticeTimer !== null) {
    window.clearTimeout(completionNoticeTimer);
    completionNoticeTimer = null;
  }
}

function showCompletionNotice(message: string) {
  completionNotice.value = message;
  clearCompletionNoticeTimer();
  completionNoticeTimer = window.setTimeout(() => {
    completionNotice.value = '';
    completionNoticeTimer = null;
  }, 2600);
}

onScopeDispose(clearCompletionNoticeTimer);

const leftSlug = ref('');
const rightSlug = ref('');
const compareCategory = ref<AlgorithmCategory>(
  readStoredCompareCategory() ?? COMPARE_DEFAULT_CATEGORY
);

const compareOptions = computed(() => getCompareOptionsByCategory(compareCategory.value));

function normalizePair(rawLeft: string, rawRight: string, preferredCategory?: AlgorithmCategory) {
  return normalizeComparePair({
    leftSlug: rawLeft,
    rightSlug: rawRight,
    preferredCategory,
  });
}

watch(
  () => [route.query.left, route.query.right],
  ([queryLeft, queryRight]) => {
    const rawLeft = typeof queryLeft === 'string' ? queryLeft : '';
    const rawRight = typeof queryRight === 'string' ? queryRight : '';
    const normalized = normalizePair(rawLeft, rawRight, readStoredCompareCategory());

    if (compareCategory.value !== normalized.category) {
      compareCategory.value = normalized.category;
    }

    if (leftSlug.value !== normalized.left) {
      leftSlug.value = normalized.left;
    }
    if (rightSlug.value !== normalized.right) {
      rightSlug.value = normalized.right;
    }

    storeCompareCategory(normalized.category);

    const needsRouteFix = rawLeft !== normalized.left || rawRight !== normalized.right;
    if (needsRouteFix) {
      void router.replace({
        name: 'CompareView',
        query: {
          left: normalized.left,
          right: normalized.right,
        },
      });
    }
  },
  { immediate: true }
);

watch([leftSlug, rightSlug], ([nextLeft, nextRight], [prevLeft, prevRight]) => {
  // 用户把一侧选成另一侧算法时，直接交换左右而不是改成第三个算法。
  if (nextLeft === nextRight) {
    const leftChanged = nextLeft !== prevLeft;
    const rightChanged = nextRight !== prevRight;

    if (leftChanged && !rightChanged) {
      rightSlug.value = prevLeft;
      return;
    }

    if (rightChanged && !leftChanged) {
      leftSlug.value = prevRight;
      return;
    }
  }

  const normalized = normalizePair(nextLeft, nextRight, compareCategory.value);

  if (compareCategory.value !== normalized.category) {
    compareCategory.value = normalized.category;
  }

  if (normalized.left !== leftSlug.value) {
    leftSlug.value = normalized.left;
  }
  if (normalized.right !== rightSlug.value) {
    rightSlug.value = normalized.right;
  }

  const queryLeft = typeof route.query.left === 'string' ? route.query.left : '';
  const queryRight = typeof route.query.right === 'string' ? route.query.right : '';
  if (queryLeft === normalized.left && queryRight === normalized.right) {
    storeCompareCategory(normalized.category);
    return;
  }

  storeCompareCategory(normalized.category);

  void router.replace({
    name: 'CompareView',
    query: {
      left: normalized.left,
      right: normalized.right,
    },
  });
});

const leftAlgorithm = computed(() => {
  const algorithm = resolveAlgorithmBySlug(leftSlug.value);
  if (!algorithm || algorithm.category !== compareCategory.value) {
    return null;
  }
  return algorithm;
});

const rightAlgorithm = computed(() => {
  const algorithm = resolveAlgorithmBySlug(rightSlug.value);
  if (!algorithm || algorithm.category !== compareCategory.value) {
    return null;
  }
  return algorithm;
});

const leftSteps = computed(() => leftAlgorithm.value?.createSteps() ?? []);
const rightSteps = computed(() => rightAlgorithm.value?.createSteps() ?? []);

const shortestTotalSteps = computed(() =>
  Math.min(leftSteps.value.length, rightSteps.value.length)
);
const longestTotalSteps = computed(() => Math.max(leftSteps.value.length, rightSteps.value.length));
const compareTotalSteps = computed(() =>
  continueLonger.value ? longestTotalSteps.value : shortestTotalSteps.value
);

watch(
  [
    compareTotalSteps,
    dataVersion,
    () => leftAlgorithm.value?.id ?? '',
    () => rightAlgorithm.value?.id ?? '',
  ],
  () => {
    completionNotice.value = '';
    clearCompletionNoticeTimer();
    playback.reset();
    playback.setTotalSteps(compareTotalSteps.value);
  },
  { immediate: true }
);

const leftStepIndex = computed(() => {
  if (leftSteps.value.length === 0) {
    return -1;
  }
  return Math.min(playback.currentStep.value, leftSteps.value.length - 1);
});

const rightStepIndex = computed(() => {
  if (rightSteps.value.length === 0) {
    return -1;
  }
  return Math.min(playback.currentStep.value, rightSteps.value.length - 1);
});

const leftStep = computed(() => {
  if (leftStepIndex.value < 0) {
    return null;
  }
  return leftSteps.value[leftStepIndex.value] ?? null;
});

const rightStep = computed(() => {
  if (rightStepIndex.value < 0) {
    return null;
  }
  return rightSteps.value[rightStepIndex.value] ?? null;
});

const leftSortingStep = computed<SortingStep | null>(() => {
  if (!leftStep.value || leftStep.value.kind !== 'sorting') {
    return null;
  }
  return leftStep.value as SortingStep;
});

const rightSortingStep = computed<SortingStep | null>(() => {
  if (!rightStep.value || rightStep.value.kind !== 'sorting') {
    return null;
  }
  return rightStep.value as SortingStep;
});

const leftGraphStep = computed<GraphStep | null>(() => {
  if (!leftStep.value || leftStep.value.kind !== 'graph') {
    return null;
  }
  return leftStep.value as GraphStep;
});

const rightGraphStep = computed<GraphStep | null>(() => {
  if (!rightStep.value || rightStep.value.kind !== 'graph') {
    return null;
  }
  return rightStep.value as GraphStep;
});

const compareVisualization = computed(() => {
  return compareCategory.value === 'graphs' ? 'graph' : 'sorting';
});

const compareTitle = computed(() => {
  return compareCategory.value === 'graphs' ? '图算法对比' : '排序算法对比';
});

const compareDescription = computed(() => {
  if (compareCategory.value === 'graphs') {
    return '同一图输入下并行执行两个图算法，对比遍历路径与总步数差异。';
  }
  return '同一输入下并行执行两个排序算法，对比执行过程与总步数差异。';
});

const leftGraphAlgorithmKey = computed(() => {
  if (!leftAlgorithm.value || leftAlgorithm.value.visualization !== 'graph') {
    return null;
  }
  return `${leftAlgorithm.value.category}:${leftAlgorithm.value.id}:left`;
});

const rightGraphAlgorithmKey = computed(() => {
  if (!rightAlgorithm.value || rightAlgorithm.value.visualization !== 'graph') {
    return null;
  }
  return `${rightAlgorithm.value.category}:${rightAlgorithm.value.id}:right`;
});

const leftCompleted = computed(
  () => leftSteps.value.length > 0 && playback.currentStep.value >= leftSteps.value.length - 1
);
const rightCompleted = computed(
  () => rightSteps.value.length > 0 && playback.currentStep.value >= rightSteps.value.length - 1
);

const leftStatusText = computed(() => {
  if (continueLonger.value && leftCompleted.value && !rightCompleted.value) {
    return '已完成，等待右侧';
  }
  return leftCompleted.value ? '已完成' : '执行中';
});

const rightStatusText = computed(() => {
  if (continueLonger.value && rightCompleted.value && !leftCompleted.value) {
    return '已完成，等待左侧';
  }
  return rightCompleted.value ? '已完成' : '执行中';
});

watch(
  () => playback.currentStep.value,
  (current, previous) => {
    if (!continueLonger.value || current <= previous) {
      return;
    }

    const leftFinishIndex = leftSteps.value.length - 1;
    const rightFinishIndex = rightSteps.value.length - 1;

    if (
      leftSteps.value.length > 0 &&
      current === leftFinishIndex &&
      rightFinishIndex > leftFinishIndex
    ) {
      showCompletionNotice('左侧算法已完成，右侧继续执行。');
      return;
    }

    if (
      rightSteps.value.length > 0 &&
      current === rightFinishIndex &&
      leftFinishIndex > rightFinishIndex
    ) {
      showCompletionNotice('右侧算法已完成，左侧继续执行。');
    }
  }
);

function handleSwapSide() {
  const prevLeft = leftSlug.value;
  leftSlug.value = rightSlug.value;
  rightSlug.value = prevLeft;
}

function handleCompareCategorySwitch(nextCategory: AlgorithmCategory) {
  if (nextCategory === compareCategory.value) {
    return;
  }

  const normalized = normalizePair('', '', nextCategory);
  compareCategory.value = normalized.category;
  leftSlug.value = normalized.left;
  rightSlug.value = normalized.right;
  storeCompareCategory(normalized.category);
}
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-300 flex-col gap-5 px-6 py-6 md:px-10 md:py-8">
    <Card>
      <CardHeader>
        <CardTitle>{{ compareTitle }}</CardTitle>
        <CardDescription>{{ compareDescription }}</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>算法组</FieldLegend>
          <FieldContent>
            <Select
              :model-value="compareCategory"
              @update:model-value="
                value =>
                  typeof value === 'string' &&
                  isAlgorithmCategory(value) &&
                  handleCompareCategorySwitch(value)
              "
            >
              <SelectTrigger id="compare-category" class="w-full">
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
          <FieldContent class="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr]">
            <Field class="gap-2">
              <FieldLabel for="left-algo" class="text-sm text-muted-foreground"
                >左侧算法</FieldLabel
              >
              <Select v-model="leftSlug">
                <SelectTrigger id="left-algo" class="w-full">
                  <SelectValue placeholder="选择左侧算法" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="item in compareOptions"
                    :key="`left-${item.slug}`"
                    :value="item.slug"
                  >
                    {{ item.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div class="flex items-end justify-center">
              <Button variant="outline" size="sm" class="w-full lg:w-auto" @click="handleSwapSide">
                交换左右
              </Button>
            </div>

            <Field class="gap-2">
              <FieldLabel for="right-algo" class="text-sm text-muted-foreground"
                >右侧算法</FieldLabel
              >
              <Select v-model="rightSlug">
                <SelectTrigger id="right-algo" class="w-full">
                  <SelectValue placeholder="选择右侧算法" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="item in compareOptions"
                    :key="`right-${item.slug}`"
                    :value="item.slug"
                  >
                    {{ item.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldContent>
        </FieldSet>

        <FieldSet class="rounded-lg bg-muted/50 p-3 shadow-sm ring-1 ring-border/70">
          <FieldLegend>执行模式</FieldLegend>
          <FieldContent>
            <Field orientation="responsive" class="gap-2">
              <FieldLabel class="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  v-model="continueLonger"
                  type="checkbox"
                  class="h-4 w-4 rounded border-input accent-primary"
                />
                继续执行较长算法
              </FieldLabel>
              <FieldDescription>
                {{ continueLonger ? '模式：执行到较长算法结束' : '模式：同步对比（最短步数）' }}
              </FieldDescription>
            </Field>
          </FieldContent>
        </FieldSet>

        <div
          class="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground shadow-sm ring-1 ring-border/70"
        >
          当前总步数：{{ playback.totalSteps.value }}（左 {{ leftSteps.length }} / 右
          {{ rightSteps.length }}）
        </div>

        <div
          v-if="completionNotice"
          class="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary"
        >
          {{ completionNotice }}
        </div>
      </CardContent>
    </Card>

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <Card class="min-h-70">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <span>{{ leftAlgorithm?.title ?? '左侧算法不可用' }}</span>
            <span
              class="rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border/70"
            >
              {{ leftStatusText }}
            </span>
          </CardTitle>
          <CardDescription>{{ leftStep?.description ?? '暂无步骤数据' }}</CardDescription>
        </CardHeader>
        <CardContent class="h-90">
          <SortingChart
            v-if="compareVisualization === 'sorting'"
            :step="leftSortingStep"
            :is-playing-override="playback.isPlaying.value"
          />
          <GraphTraversalView v-else :step="leftGraphStep" :algorithm-key="leftGraphAlgorithmKey" />
        </CardContent>
      </Card>

      <Card class="min-h-70">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <span>{{ rightAlgorithm?.title ?? '右侧算法不可用' }}</span>
            <span
              class="rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border/70"
            >
              {{ rightStatusText }}
            </span>
          </CardTitle>
          <CardDescription>{{ rightStep?.description ?? '暂无步骤数据' }}</CardDescription>
        </CardHeader>
        <CardContent class="h-90">
          <SortingChart
            v-if="compareVisualization === 'sorting'"
            :step="rightSortingStep"
            :is-playing-override="playback.isPlaying.value"
          />
          <GraphTraversalView
            v-else
            :step="rightGraphStep"
            :algorithm-key="rightGraphAlgorithmKey"
          />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
