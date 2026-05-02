import { createSortingStep } from '@/algorithms/shared/sorting/createSortingStep';
import { getSortingInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildInsertionSortSteps(source: number[]): AlgorithmStep[] {
  const values = [...source];
  const steps: AlgorithmStep[] = [createSortingStep(values, [], [], '初始化数组')];

  for (let index = 1; index < values.length; index += 1) {
    let current = index;
    steps.push(createSortingStep(values, [current], [], `选取索引 ${current} 作为插入元素`));

    while (current > 0 && values[current - 1] > values[current]) {
      steps.push(
        createSortingStep(
          values,
          [current - 1, current],
          [],
          `比较索引 ${current - 1} 与 ${current}`
        )
      );

      [values[current - 1], values[current]] = [values[current], values[current - 1]];
      steps.push(
        createSortingStep(
          values,
          [current - 1, current],
          [current - 1, current],
          `向左交换元素到索引 ${current - 1}`
        )
      );

      current -= 1;
    }
  }

  steps.push(
    createSortingStep(values, [], [], '排序完成', {
      doneIndices: values.map((_, index) => index),
    })
  );

  return steps;
}

export const insertionSortRegistry: AlgorithmDefinition = {
  id: 'insertion-sort',
  slug: 'insertion-sort',
  title: '插入排序',
  description: '将每个元素插入到已排序区间的正确位置。',
  categories: ['sorting'],
  comparisonGroup: 'sorting',
  visualization: 'sorting',
  createSteps: () => buildInsertionSortSteps(getSortingInput()),
};
