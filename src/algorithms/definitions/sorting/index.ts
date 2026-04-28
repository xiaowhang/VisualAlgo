import { bubbleSortRegistry } from '@/algorithms/definitions/sorting/bubble-sort.registry';
import { insertionSortRegistry } from '@/algorithms/definitions/sorting/insertion-sort.registry';
import { mergeSortRegistry } from '@/algorithms/definitions/sorting/merge-sort.registry';
import { quickSortRegistry } from '@/algorithms/definitions/sorting/quick-sort.registry';
import { heapSortRegistry } from '@/algorithms/definitions/sorting/heap-sort.registry';
import { selectionSortRegistry } from '@/algorithms/definitions/sorting/selection-sort.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const sortingRegistries: AlgorithmDefinition[] = [
  quickSortRegistry,
  mergeSortRegistry,
  heapSortRegistry,
  bubbleSortRegistry,
  insertionSortRegistry,
  selectionSortRegistry,
];
