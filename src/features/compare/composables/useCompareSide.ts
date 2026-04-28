import { computed, type Ref } from 'vue';
import { resolveAlgorithmBySlug } from '@/algorithms/registry';
import { useAlgorithmStepSelection } from '@/composables/useAlgorithmStepSelection';
import type { AlgorithmCategory } from '@/types/algorithm';

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
  const { stepIndex, step, sortingStep, graphStep, treeStep } = useAlgorithmStepSelection({
    steps,
    currentStep: options.currentStep,
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
    treeStep,
    graphAlgorithmKey,
    completed,
  };
}
