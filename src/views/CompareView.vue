<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import CompareSideCard from '@/components/CompareSideCard.vue';
import { useCompareSide } from '@/composables/useCompareSide';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { useAlgorithmComparisonStore } from '@/stores/algorithmComparison';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';

const route = useRoute();
const router = useRouter();
const algorithmInputsStore = useAlgorithmInputsStore();
const comparisonStore = useAlgorithmComparisonStore();
const playbackStore = useAlgorithmPlaybackStore();
const playbackRefs = storeToRefs(playbackStore);
const comparisonRefs = storeToRefs(comparisonStore);

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
const continueLonger = playback.compareContinueLonger;
const { leftSlug, rightSlug, compareCategory } = comparisonRefs;

const { dataVersion } = storeToRefs(algorithmInputsStore);

watch(
  () => [route.query.left, route.query.right],
  ([queryLeft, queryRight]) => {
    const result = comparisonStore.applyRouteQuery(queryLeft, queryRight);

    if (result.needsRouteFix) {
      void router.replace({
        name: 'CompareView',
        query: {
          left: result.left,
          right: result.right,
        },
      });
    }
  },
  { immediate: true }
);

watch([leftSlug, rightSlug], ([nextLeft, nextRight], [prevLeft, prevRight]) => {
  const result = comparisonStore.applySelectionChange({
    nextLeft,
    nextRight,
    prevLeft: prevLeft ?? '',
    prevRight: prevRight ?? '',
    queryLeft: route.query.left,
    queryRight: route.query.right,
  });

  if (!result.needsRouteFix) {
    return;
  }

  void router.replace({
    name: 'CompareView',
    query: {
      left: result.left,
      right: result.right,
    },
  });
});

const leftSide = useCompareSide({
  side: 'left',
  slug: leftSlug,
  category: compareCategory,
  currentStep: playback.currentStep,
});

const rightSide = useCompareSide({
  side: 'right',
  slug: rightSlug,
  category: compareCategory,
  currentStep: playback.currentStep,
});

const shortestTotalSteps = computed(() =>
  Math.min(leftSide.steps.value.length, rightSide.steps.value.length)
);
const longestTotalSteps = computed(() =>
  Math.max(leftSide.steps.value.length, rightSide.steps.value.length)
);
const compareTotalSteps = computed(() =>
  continueLonger.value ? longestTotalSteps.value : shortestTotalSteps.value
);

watch(
  [
    compareTotalSteps,
    dataVersion,
    () => leftSide.algorithm.value?.id ?? '',
    () => rightSide.algorithm.value?.id ?? '',
  ],
  () => {
    playback.reset();
    playback.setTotalSteps(compareTotalSteps.value);
  },
  { immediate: true }
);

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

const leftCompleted = leftSide.completed;
const rightCompleted = rightSide.completed;

const leftTitle = computed(() => leftSide.algorithm.value?.title ?? '左侧算法不可用');
const rightTitle = computed(() => rightSide.algorithm.value?.title ?? '右侧算法不可用');

const leftStepDescription = computed(() => leftSide.step.value?.description ?? '暂无步骤数据');
const rightStepDescription = computed(() => rightSide.step.value?.description ?? '暂无步骤数据');

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
</script>

<template>
  <div class="mx-auto flex h-full w-full flex-col gap-5 px-6 py-6 md:px-10 md:py-8">
    <Card>
      <CardHeader>
        <CardTitle>{{ compareTitle }}</CardTitle>
        <CardDescription>{{ compareDescription }}</CardDescription>
      </CardHeader>
    </Card>

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <CompareSideCard
        :title="leftTitle"
        :status-text="leftStatusText"
        :description="leftStepDescription"
        :visualization="compareVisualization"
        :sorting-step="leftSide.sortingStep.value"
        :graph-step="leftSide.graphStep.value"
        :graph-algorithm-key="leftSide.graphAlgorithmKey.value"
        :is-playing="playback.isPlaying.value"
      />

      <CompareSideCard
        :title="rightTitle"
        :status-text="rightStatusText"
        :description="rightStepDescription"
        :visualization="compareVisualization"
        :sorting-step="rightSide.sortingStep.value"
        :graph-step="rightSide.graphStep.value"
        :graph-algorithm-key="rightSide.graphAlgorithmKey.value"
        :is-playing="playback.isPlaying.value"
      />
    </div>
  </div>
</template>
