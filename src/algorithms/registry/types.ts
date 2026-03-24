import type { AlgorithmCategory } from '@/types/algorithm';

export interface AlgorithmMenuItem {
  title: string;
  slug: string;
  category: AlgorithmCategory;
}
