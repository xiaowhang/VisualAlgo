import { dijkstraRegistry } from './dijkstra.registry';
import { huffmanRegistry } from './huffman.registry';
import { activitySelectionRegistry } from './activity-selection.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const greedyRegistries: AlgorithmDefinition[] = [
  dijkstraRegistry,
  huffmanRegistry,
  activitySelectionRegistry,
];
