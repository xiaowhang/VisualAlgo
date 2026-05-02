import { simplexRegistry } from './simplex.registry';
import { dualSimplexRegistry } from './dual-simplex.registry';
import { lpGraphicalRegistry } from './lp-graphical.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const linearProgrammingRegistries: AlgorithmDefinition[] = [
  simplexRegistry,
  dualSimplexRegistry,
  lpGraphicalRegistry,
];
