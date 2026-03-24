import { createSortingStep } from '@/algorithms/shared/sorting/createSortingStep';
import { getSortingInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildBubbleSortSteps(source: number[]): AlgorithmStep[] {
  const values = [...source];
  const steps: AlgorithmStep[] = [createSortingStep(values, [], [], '初始化数组')];

  for (let outer = 0; outer < values.length - 1; outer += 1) {
    for (let inner = 0; inner < values.length - 1 - outer; inner += 1) {
      steps.push(
        createSortingStep(values, [inner, inner + 1], [], `比较索引 ${inner} 与 ${inner + 1}`)
      );

      if (values[inner] > values[inner + 1]) {
        [values[inner], values[inner + 1]] = [values[inner + 1], values[inner]];
        steps.push(
          createSortingStep(
            values,
            [inner, inner + 1],
            [inner, inner + 1],
            `交换 ${inner} 与 ${inner + 1}`
          )
        );
      }
    }
  }

  steps.push(
    createSortingStep(values, [], [], '排序完成', {
      doneIndices: values.map((_, index) => index),
    })
  );

  return steps;
}

export const bubbleSortRegistry: AlgorithmDefinition = {
  id: 'bubble-sort',
  slug: 'bubble-sort',
  title: 'Bubble Sort',
  description: '通过相邻交换将较大元素逐步移动到末尾。',
  category: 'sorting',
  visualization: 'sorting',
  createSteps: () => buildBubbleSortSteps(getSortingInput()),
};
