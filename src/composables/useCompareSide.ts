import { computed, type Ref } from 'vue';
import { resolveAlgorithmBySlug } from '@/algorithms/registry';
import type { AlgorithmCategory, GraphStep, SortingStep } from '@/types/algorithm';

interface UseCompareSideOptions {
  side: 'left' | 'right';
  slug: Ref<string>;
  category: Ref<AlgorithmCategory>;
  currentStep: Ref<number>;
}

export function useCompareSide(options: UseCompareSideOptions) {
  const algorithm = computed(() => {
    const candidate = resolveAlgorithmBySlug(options.slug.value);
    if (!candidate || candidate.category !== options.category.value) {
      return null;
    }
    return candidate;
  });

  const steps = computed(() => algorithm.value?.createSteps() ?? []);

  const stepIndex = computed(() => {
    if (steps.value.length === 0) {
      return -1;
    }
    return Math.min(options.currentStep.value, steps.value.length - 1);
  });

  const step = computed(() => {
    if (stepIndex.value < 0) {
      return null;
    }
    return steps.value[stepIndex.value] ?? null;
  });

  const sortingStep = computed<SortingStep | null>(() => {
    if (!step.value || step.value.kind !== 'sorting') {
      return null;
    }
    return step.value as SortingStep;
  });

  const graphStep = computed<GraphStep | null>(() => {
    if (!step.value || step.value.kind !== 'graph') {
      return null;
    }
    return step.value as GraphStep;
  });

  const graphAlgorithmKey = computed(() => {
    if (!algorithm.value || algorithm.value.visualization !== 'graph') {
      return null;
    }
    return `${algorithm.value.category}:${algorithm.value.id}:${options.side}`;
  });

  const completed = computed(
    () => steps.value.length > 0 && options.currentStep.value >= steps.value.length - 1
  );

  return {
    algorithm,
    steps,
    stepIndex,
    step,
    sortingStep,
    graphStep,
    graphAlgorithmKey,
    completed,
  };
}
