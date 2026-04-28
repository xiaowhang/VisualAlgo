import { binarySearchRegistry } from '@/algorithms/definitions/divide-conquer/binary-search.registry';
import { hanoiRegistry } from '@/algorithms/definitions/divide-conquer/hanoi.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const divideConquerRegistries: AlgorithmDefinition[] = [binarySearchRegistry, hanoiRegistry];
