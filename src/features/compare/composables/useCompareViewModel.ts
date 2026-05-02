import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useCompareRouteActions } from '@/features/compare/composables/useCompareRouteActions';
import { useCompareSide } from '@/features/compare/composables/useCompareSide';

export function useCompareViewModel() {
  const route = useRoute();
  const algorithmInputsStore = useAlgorithmInputsStore();
  const playbackStore = useAlgorithmPlaybackStore();
  const playbackRefs = storeToRefs(playbackStore);

  const { compareGroup, compareLeftSlug, compareRightSlug, syncRouteQuery } =
    useCompareRouteActions();

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
  const { dataVersion } = storeToRefs(algorithmInputsStore);

  watch(
    () => [route.query.left, route.query.right],
    ([queryLeft, queryRight]) => {
      syncRouteQuery(queryLeft, queryRight);
    },
    { immediate: true }
  );

  const leftSide = useCompareSide({
    side: 'left',
    slug: compareLeftSlug,
    group: compareGroup,
    currentStep: playback.currentStep,
  });

  const rightSide = useCompareSide({
    side: 'right',
    slug: compareRightSlug,
    group: compareGroup,
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

  const leftVisualization = computed(() => leftSide.algorithm.value?.visualization ?? 'sorting');
  const rightVisualization = computed(() => rightSide.algorithm.value?.visualization ?? 'sorting');

  const compareTitle = computed(() => {
    if (compareGroup.value === 'graph-traversal') return '图遍历算法对比';
    if (compareGroup.value === 'max-flow') return '最大流算法对比';
    return '排序算法对比';
  });

  const compareDescription = computed(() => {
    if (compareGroup.value === 'graph-traversal') {
      return '同一图输入下并行执行两个图遍历算法，对比遍历路径与总步数差异。';
    }
    if (compareGroup.value === 'max-flow') {
      return '同一网络流输入下并行执行两个最大流算法，对比增广路径与总步数差异。';
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

  return {
    playback,
    leftSide,
    rightSide,
    leftVisualization,
    rightVisualization,
    compareTitle,
    compareDescription,
    leftTitle,
    rightTitle,
    leftStepDescription,
    rightStepDescription,
    leftStatusText,
    rightStatusText,
  };
}
