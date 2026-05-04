import { describe, bench, beforeAll } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { bubbleSortRegistry } from '@/algorithms/definitions/sorting/bubble-sort.registry';
import { nQueensRegistry } from '@/algorithms/definitions/backtracking/n-queens.registry';
import { hanoiRegistry } from '@/algorithms/definitions/divide-conquer/hanoi.registry';
import { subsetSumRegistry } from '@/algorithms/definitions/backtracking/subset-sum.registry';

function generateRandomArray(size: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  return arr;
}

describe('算法 createSteps 性能', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  describe('bubble-sort', () => {
    bench('10 元素', () => {
      const store = useAlgorithmInputsStore();
      store.sortingInput = generateRandomArray(10);
      const steps = bubbleSortRegistry.createSteps();
      void steps.length;
    });

    bench('30 元素', () => {
      const store = useAlgorithmInputsStore();
      store.sortingInput = generateRandomArray(30);
      const steps = bubbleSortRegistry.createSteps();
      void steps.length;
    });

    bench('50 元素', () => {
      const store = useAlgorithmInputsStore();
      store.sortingInput = generateRandomArray(50);
      const steps = bubbleSortRegistry.createSteps();
      void steps.length;
    });
  });

  describe('n-queens', () => {
    bench('n=4', () => {
      const store = useAlgorithmInputsStore();
      store.nQueensSize = 4;
      const steps = nQueensRegistry.createSteps();
      void steps.length;
    });

    bench('n=6', () => {
      const store = useAlgorithmInputsStore();
      store.nQueensSize = 6;
      const steps = nQueensRegistry.createSteps();
      void steps.length;
    });

    bench('n=8', () => {
      const store = useAlgorithmInputsStore();
      store.nQueensSize = 8;
      const steps = nQueensRegistry.createSteps();
      void steps.length;
    });
  });

  describe('hanoi', () => {
    bench('4 盘', () => {
      const store = useAlgorithmInputsStore();
      store.hanoiDiskCount = 4;
      const steps = hanoiRegistry.createSteps();
      void steps.length;
    });

    bench('6 盘', () => {
      const store = useAlgorithmInputsStore();
      store.hanoiDiskCount = 6;
      const steps = hanoiRegistry.createSteps();
      void steps.length;
    });

    bench('8 盘', () => {
      const store = useAlgorithmInputsStore();
      store.hanoiDiskCount = 8;
      const steps = hanoiRegistry.createSteps();
      void steps.length;
    });
  });

  describe('subset-sum', () => {
    bench('4 元素', () => {
      const store = useAlgorithmInputsStore();
      store.subsetSumArray = [3, 5, 6, 7];
      store.subsetSumTarget = 15;
      const steps = subsetSumRegistry.createSteps();
      void steps.length;
    });

    bench('6 元素', () => {
      const store = useAlgorithmInputsStore();
      store.subsetSumArray = [2, 3, 5, 7, 8, 10];
      store.subsetSumTarget = 18;
      const steps = subsetSumRegistry.createSteps();
      void steps.length;
    });
  });
});
