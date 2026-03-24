import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';

export function getSortingInput(): number[] {
  return [...useAlgorithmInputsStore().sortingInput];
}

export function getGraphStartNode(): string {
  return useAlgorithmInputsStore().graphStartNode;
}
