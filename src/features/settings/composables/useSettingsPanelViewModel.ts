import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import {
  getCompareOptionsByCategory,
  findAlgorithm,
  resolveAlgorithmBySlug,
} from '@/algorithms/registry';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useCompareRouteActions } from '@/features/compare/composables/useCompareRouteActions';
import { useSettingsInputForm } from '@/features/settings/composables/useSettingsInputForm';

export function useSettingsPanelViewModel() {
  const playbackStore = useAlgorithmPlaybackStore();
  const route = useRoute();
  const playbackRefs = storeToRefs(playbackStore);

  const {
    compareCategory,
    compareLeftSlug,
    compareRightSlug,
    handleCompareCategorySwitch,
    handleCompareLeftChange,
    handleCompareRightChange,
    handleCompareSwap,
  } = useCompareRouteActions();

  const playback = {
    ...playbackRefs,
    setCompareContinueLonger: playbackStore.setCompareContinueLonger,
  };

  const activeAlgorithm = computed(() => {
    const category = String(route.params.category ?? '');
    const slug = String(route.params.slug ?? '');
    return findAlgorithm(category, slug);
  });

  const isCompareView = computed(() => route.name === 'CompareView');

  const visibleCompareCategory = computed(() => {
    if (!isCompareView.value) {
      return null;
    }

    return compareCategory.value;
  });

  const compareOptions = computed(() => {
    if (!visibleCompareCategory.value) {
      return [];
    }
    return getCompareOptionsByCategory(visibleCompareCategory.value);
  });

  const compareLeftAlgorithm = computed(() => resolveAlgorithmBySlug(compareLeftSlug.value));
  const compareRightAlgorithm = computed(() => resolveAlgorithmBySlug(compareRightSlug.value));

  const compareLeftStepsCount = computed(
    () => compareLeftAlgorithm.value?.createSteps().length ?? 0
  );
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
      compareLeftStepsCount.value > 0 &&
      playback.currentStep.value >= compareLeftStepsCount.value - 1
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

  const steps = computed(() => activeAlgorithm.value?.createSteps() ?? []);

  const currentStepData = computed(() => {
    if (steps.value.length === 0) {
      return null;
    }
    return steps.value[playback.currentStep.value] ?? steps.value[0];
  });

  const isSortingAlgorithm = computed(
    () =>
      (isCompareView.value && visibleCompareCategory.value === 'sorting') ||
      activeAlgorithm.value?.visualization === 'sorting'
  );

  const isGraphAlgorithm = computed(
    () =>
      (isCompareView.value && visibleCompareCategory.value === 'graphs') ||
      activeAlgorithm.value?.visualization === 'graph'
  );

  const isTreeAlgorithm = computed(
    () =>
      (isCompareView.value && visibleCompareCategory.value === 'trees') ||
      activeAlgorithm.value?.visualization === 'tree'
  );

  const isDivideConquerAlgorithm = computed(
    () =>
      (isCompareView.value && visibleCompareCategory.value === 'divide-conquer') ||
      activeAlgorithm.value?.category === 'divide-conquer'
  );

  const isHanoiAlgorithm = computed(
    () =>
      (isCompareView.value && visibleCompareCategory.value === 'divide-conquer') ||
      activeAlgorithm.value?.visualization === 'hanoi'
  );

  const inputForm = useSettingsInputForm({
    isGraphAlgorithm,
    isTreeAlgorithm,
    isHanoiAlgorithm,
  });

  const panelTitle = computed(() => {
    if (isCompareView.value) {
      if (visibleCompareCategory.value === 'graphs') return '图算法对比';
      if (visibleCompareCategory.value === 'trees') return '树算法对比';
      if (visibleCompareCategory.value === 'divide-conquer') return '分治算法对比';
      return '排序算法对比';
    }
    return activeAlgorithm.value?.title ?? '算法未找到';
  });

  const panelDescription = computed(() => {
    if (isCompareView.value) {
      if (visibleCompareCategory.value === 'graphs') {
        return '对比模式共享同一份图输入。修改后会同时影响左右算法。';
      }
      if (visibleCompareCategory.value === 'trees') {
        return '对比模式共享同一份树输入。修改后会同时影响左右算法。';
      }
      if (visibleCompareCategory.value === 'divide-conquer') {
        return '对比模式共享同一份输入。修改后会同时影响左右算法。';
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

  const activeTab = ref<'overview' | 'compare' | 'data' | 'files'>(
    isCompareView.value ? 'compare' : 'overview'
  );
  const panelScrollRef = ref<HTMLDivElement | null>(null);

  const modeLabel = computed(() => {
    if (isCompareView.value) {
      if (visibleCompareCategory.value === 'graphs') return '图算法对比模式';
      if (visibleCompareCategory.value === 'trees') return '树算法对比模式';
      if (visibleCompareCategory.value === 'divide-conquer') return '分治算法对比模式';
      return '排序算法对比模式';
    }
    if (isTreeAlgorithm.value) return '树算法';
    if (isGraphAlgorithm.value) return '图算法';
    if (isDivideConquerAlgorithm.value) return '分治算法';
    return '排序算法';
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
      return;
    }

    if (!value) {
      activeTab.value = 'overview';
    }
  });

  return {
    compareLeftSlug,
    compareRightSlug,
    handleCompareCategorySwitch,
    handleCompareLeftChange,
    handleCompareRightChange,
    handleCompareSwap,
    playback,
    isCompareView,
    visibleCompareCategory,
    compareOptions,
    compareLeftCurrentStep,
    compareRightCurrentStep,
    compareLeftStepsCount,
    compareRightStepsCount,
    compareLeftStatusText,
    compareRightStatusText,
    isSortingAlgorithm,
    isGraphAlgorithm,
    isTreeAlgorithm,
    isDivideConquerAlgorithm,
    isHanoiAlgorithm,
    panelTitle,
    panelDescription,
    stepDescription,
    activeTab,
    panelScrollRef,
    modeLabel,
    ...inputForm,
  };
}
