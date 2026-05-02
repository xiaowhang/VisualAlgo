import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type {
  AlgorithmStep,
  ChessboardStep,
  DecisionTreeStep,
  DpTableStep,
  GraphStep,
  HanoiStep,
  HuffmanStep,
  LpGraphicalStep,
  LpTableauStep,
  NetworkFlowStep,
  SortingStep,
  TimelineStep,
  TreeStep,
} from '@/types/algorithm';

interface UseAlgorithmStepSelectionOptions {
  steps: MaybeRefOrGetter<AlgorithmStep[]>;
  currentStep: MaybeRefOrGetter<number>;
}

export function useAlgorithmStepSelection(options: UseAlgorithmStepSelectionOptions) {
  const steps = computed(() => toValue(options.steps));
  const currentStep = computed(() => toValue(options.currentStep));

  const stepIndex = computed(() => {
    if (steps.value.length === 0) {
      return -1;
    }

    return Math.min(currentStep.value, steps.value.length - 1);
  });

  const step = computed<AlgorithmStep | null>(() => {
    if (stepIndex.value < 0) {
      return null;
    }

    return steps.value[stepIndex.value] ?? null;
  });

  const sortingStep = computed<SortingStep | null>(() => {
    if (!step.value || step.value.kind !== 'sorting') {
      return null;
    }

    return step.value;
  });

  const graphStep = computed<GraphStep | null>(() => {
    if (!step.value || step.value.kind !== 'graph') {
      return null;
    }

    return step.value;
  });

  const treeStep = computed<TreeStep | null>(() => {
    if (!step.value || step.value.kind !== 'tree') {
      return null;
    }

    return step.value;
  });

  const hanoiStep = computed<HanoiStep | null>(() => {
    if (!step.value || step.value.kind !== 'hanoi') {
      return null;
    }

    return step.value;
  });

  const dpTableStep = computed<DpTableStep | null>(() => {
    if (!step.value || step.value.kind !== 'dp-table') {
      return null;
    }

    return step.value;
  });

  const huffmanStep = computed<HuffmanStep | null>(() => {
    if (!step.value || step.value.kind !== 'huffman') {
      return null;
    }

    return step.value;
  });

  const timelineStep = computed<TimelineStep | null>(() => {
    if (!step.value || step.value.kind !== 'timeline') {
      return null;
    }

    return step.value;
  });

  const chessboardStep = computed<ChessboardStep | null>(() => {
    if (!step.value || step.value.kind !== 'chessboard') {
      return null;
    }

    return step.value;
  });

  const decisionTreeStep = computed<DecisionTreeStep | null>(() => {
    if (!step.value || step.value.kind !== 'decision-tree') {
      return null;
    }

    return step.value;
  });

  const networkFlowStep = computed<NetworkFlowStep | null>(() => {
    if (!step.value || step.value.kind !== 'network-flow') {
      return null;
    }

    return step.value;
  });

  const lpTableauStep = computed<LpTableauStep | null>(() => {
    if (!step.value || step.value.kind !== 'lp-tableau') {
      return null;
    }

    return step.value;
  });

  const lpGraphicalStep = computed<LpGraphicalStep | null>(() => {
    if (!step.value || step.value.kind !== 'lp-graphical') {
      return null;
    }

    return step.value;
  });

  return {
    stepIndex,
    step,
    sortingStep,
    graphStep,
    treeStep,
    hanoiStep,
    dpTableStep,
    huffmanStep,
    timelineStep,
    chessboardStep,
    decisionTreeStep,
    networkFlowStep,
    lpTableauStep,
    lpGraphicalStep,
  };
}
