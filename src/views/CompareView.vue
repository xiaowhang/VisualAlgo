<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-vue-next';
import SortingChart from '@/components/visualization/SortingChart.vue';
import { findAlgorithm } from '@/algorithms/registry';
import { algorithmMenuByCategory } from '@/algorithms/registry/algorithmMenu';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { usePlaybackController } from '@/composables/usePlaybackController';
import type { SortingStep } from '@/types/algorithm';

const route = useRoute();
const router = useRouter();
const algorithmInputsStore = useAlgorithmInputsStore();
const playback = usePlaybackController();
const { dataVersion } = storeToRefs(algorithmInputsStore);
const continueLonger = ref(true);
const completionNotice = ref('');

let completionNoticeTimer: number | null = null;

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

const sortingOptions = computed(() => algorithmMenuByCategory.sorting);

function resolveFallbackPair() {
  const first = sortingOptions.value[0]?.slug ?? '';
  const second = sortingOptions.value.find(item => item.slug !== first)?.slug ?? first;
  return {
    left: first,
    right: second,
  };
}

function resolveSortingAlgorithm(slug: string) {
  const algorithm = findAlgorithm('sorting', slug);
  if (!algorithm || algorithm.visualization !== 'sorting') {
    return null;
  }
  return algorithm;
}

function normalizePair(rawLeft: string, rawRight: string) {
  const fallback = resolveFallbackPair();
  const normalizedLeft = resolveSortingAlgorithm(rawLeft)?.slug ?? fallback.left;

  let normalizedRight = resolveSortingAlgorithm(rawRight)?.slug ?? fallback.right;
  if (normalizedRight === normalizedLeft) {
    normalizedRight =
      sortingOptions.value.find(item => item.slug !== normalizedLeft)?.slug ?? normalizedLeft;
  }

  return {
    left: normalizedLeft,
    right: normalizedRight,
  };
}

const leftSlug = ref('');
const rightSlug = ref('');

watch(
  () => [route.query.left, route.query.right],
  ([queryLeft, queryRight]) => {
    const rawLeft = typeof queryLeft === 'string' ? queryLeft : '';
    const rawRight = typeof queryRight === 'string' ? queryRight : '';
    const normalized = normalizePair(rawLeft, rawRight);

    if (leftSlug.value !== normalized.left) {
      leftSlug.value = normalized.left;
    }
    if (rightSlug.value !== normalized.right) {
      rightSlug.value = normalized.right;
    }

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

watch([leftSlug, rightSlug], ([nextLeft, nextRight]) => {
  const normalized = normalizePair(nextLeft, nextRight);

  if (normalized.left !== leftSlug.value) {
    leftSlug.value = normalized.left;
  }
  if (normalized.right !== rightSlug.value) {
    rightSlug.value = normalized.right;
  }

  const queryLeft = typeof route.query.left === 'string' ? route.query.left : '';
  const queryRight = typeof route.query.right === 'string' ? route.query.right : '';
  if (queryLeft === normalized.left && queryRight === normalized.right) {
    return;
  }

  void router.replace({
    name: 'CompareView',
    query: {
      left: normalized.left,
      right: normalized.right,
    },
  });
});

const leftAlgorithm = computed(() => resolveSortingAlgorithm(leftSlug.value));
const rightAlgorithm = computed(() => resolveSortingAlgorithm(rightSlug.value));

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

const leftStep = computed<SortingStep | null>(() => {
  if (leftStepIndex.value < 0) {
    return null;
  }
  return leftSteps.value[leftStepIndex.value] as SortingStep;
});

const rightStep = computed<SortingStep | null>(() => {
  if (rightStepIndex.value < 0) {
    return null;
  }
  return rightSteps.value[rightStepIndex.value] as SortingStep;
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

const progressLabel = computed(() => {
  if (playback.totalSteps.value === 0) {
    return '0 / 0';
  }
  return `${playback.currentStep.value + 1} / ${playback.totalSteps.value}`;
});

const seekMax = computed(() => Math.max(playback.totalSteps.value - 1, 0));

function handleSeek(value: string | number) {
  playback.seekTo(Number(value));
}

function handleSwapSide() {
  const prevLeft = leftSlug.value;
  leftSlug.value = rightSlug.value;
  rightSlug.value = prevLeft;
}
</script>

<template>
  <div class="mx-auto flex h-full w-full flex-col gap-4 p-6">
    <Card>
      <CardHeader>
        <CardTitle>排序算法对比</CardTitle>
        <CardDescription
          >同一输入下并行执行两个排序算法，对比执行过程与总步数差异。</CardDescription
        >
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <div class="flex items-center gap-3">
            <Label for="left-algo" class="min-w-16 text-sm text-muted-foreground">左侧</Label>
            <select
              id="left-algo"
              v-model="leftSlug"
              class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option v-for="item in sortingOptions" :key="`left-${item.slug}`" :value="item.slug">
                {{ item.title }}
              </option>
            </select>
          </div>

          <div class="flex items-center justify-center">
            <Button variant="outline" size="sm" @click="handleSwapSide">Swap</Button>
          </div>

          <div class="flex items-center gap-3">
            <Label for="right-algo" class="min-w-16 text-sm text-muted-foreground">右侧</Label>
            <select
              id="right-algo"
              v-model="rightSlug"
              class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option v-for="item in sortingOptions" :key="`right-${item.slug}`" :value="item.slug">
                {{ item.title }}
              </option>
            </select>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3"
        >
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              v-model="continueLonger"
              type="checkbox"
              class="h-4 w-4 rounded border-input accent-primary"
            />
            继续执行较长算法
          </label>
          <span class="text-sm text-muted-foreground">
            {{ continueLonger ? '模式：执行到较长算法结束' : '模式：同步对比（最短步数）' }}
          </span>
        </div>

        <div class="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          当前总步数：{{ playback.totalSteps.value }}（左 {{ leftSteps.length }} / 右
          {{ rightSteps.length }}）
        </div>

        <div
          v-if="completionNotice"
          class="rounded-md border border-primary/35 bg-primary/10 p-3 text-sm text-primary"
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
              class="rounded-sm border bg-muted/40 px-2 py-0.5 text-xs font-normal text-muted-foreground"
            >
              {{ leftStatusText }}
            </span>
          </CardTitle>
          <CardDescription>{{ leftStep?.description ?? '暂无步骤数据' }}</CardDescription>
        </CardHeader>
        <CardContent class="h-90">
          <SortingChart :step="leftStep" :is-playing-override="playback.isPlaying.value" />
        </CardContent>
      </Card>

      <Card class="min-h-70">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <span>{{ rightAlgorithm?.title ?? '右侧算法不可用' }}</span>
            <span
              class="rounded-sm border bg-muted/40 px-2 py-0.5 text-xs font-normal text-muted-foreground"
            >
              {{ rightStatusText }}
            </span>
          </CardTitle>
          <CardDescription>{{ rightStep?.description ?? '暂无步骤数据' }}</CardDescription>
        </CardHeader>
        <CardContent class="h-90">
          <SortingChart :step="rightStep" :is-playing-override="playback.isPlaying.value" />
        </CardContent>
      </Card>
    </div>

    <div class="flex h-20 w-full items-center gap-3 border bg-background px-4">
      <Button
        variant="outline"
        size="sm"
        :disabled="!playback.canPlay.value"
        @click="playback.play"
      >
        <Play class="mr-1 h-4 w-4" />
        Play
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="!playback.canStepBack.value"
        @click="playback.stepBack"
      >
        <StepForward class="mr-1 h-4 w-4 rotate-180" />
        Prev
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="!playback.isPlaying.value"
        @click="playback.pause"
      >
        <Pause class="mr-1 h-4 w-4" />
        Pause
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="!playback.canStep.value"
        @click="playback.step"
      >
        <StepForward class="mr-1 h-4 w-4" />
        Step
      </Button>
      <Button variant="ghost" size="sm" @click="playback.reset">
        <RotateCcw class="mr-1 h-4 w-4" />
        Reset
      </Button>

      <div class="ml-2 flex min-w-36 items-center gap-2 text-sm text-muted-foreground">
        <span>Speed</span>
        <Input
          :model-value="playback.speed.value"
          type="range"
          min="0.5"
          max="2"
          step="0.25"
          class="h-8 w-28"
          @update:model-value="value => playback.setSpeed(Number(value))"
        />
        <span>{{ playback.speed.value.toFixed(2) }}x</span>
      </div>

      <div class="flex min-w-64 items-center gap-2 text-sm text-muted-foreground">
        <span>Progress</span>
        <Input
          :model-value="playback.currentStep.value"
          type="range"
          min="0"
          :max="seekMax"
          :step="1"
          class="h-8 w-44"
          :disabled="playback.totalSteps.value <= 1"
          @update:model-value="handleSeek"
        />
        <span>{{ playback.progressPercent.value.toFixed(0) }}%</span>
      </div>

      <div class="ml-auto rounded-md border bg-muted/30 px-3 py-1 text-sm text-muted-foreground">
        Step {{ progressLabel }}
      </div>
    </div>
  </div>
</template>
