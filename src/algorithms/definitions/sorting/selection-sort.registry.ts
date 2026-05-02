import { createSortingStep } from '@/algorithms/shared/sorting/createSortingStep';
import { getSortingInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildSelectionSortSteps(source: number[]): AlgorithmStep[] {
  const values = [...source];
  const steps: AlgorithmStep[] = [createSortingStep(values, [], [], '初始化数组')];

  for (let i = 0; i < values.length - 1; i += 1) {
    let minIdx = i;

    steps.push(
      createSortingStep(values, [], [], `选取索引 ${i} 处元素作为当前最小值`, {
        pivotIndices: [minIdx],
      })
    );

    for (let j = i + 1; j < values.length; j += 1) {
      steps.push(createSortingStep(values, [minIdx, j], [], `比较索引 ${minIdx} 与索引 ${j}`));

      if (values[j] < values[minIdx]) {
        minIdx = j;
        steps.push(
          createSortingStep(values, [], [], `更新最小值为索引 ${j}`, { pivotIndices: [minIdx] })
        );
      }
    }

    if (minIdx !== i) {
      [values[i], values[minIdx]] = [values[minIdx], values[i]];
      steps.push(
        createSortingStep(values, [i, minIdx], [i, minIdx], `交换索引 ${i} 与索引 ${minIdx}`)
      );
    }
  }

  steps.push(
    createSortingStep(values, [], [], '排序完成', {
      doneIndices: values.map((_, index) => index),
    })
  );

  return steps;
}

export const selectionSortRegistry: AlgorithmDefinition = {
  id: 'selection-sort',
  slug: 'selection-sort',
  title: '选择排序',
  description: '每次从未排序区间选取最小值放到已排序区间末尾。',
  categories: ['sorting'],
  comparisonGroup: 'sorting',
  visualization: 'sorting',
  createSteps: () => buildSelectionSortSteps(getSortingInput()),
};
