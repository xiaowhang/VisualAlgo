import { createSortingStep } from '@/algorithms/shared/sorting/createSortingStep';
import { getSortingInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function quickSort(values: number[], left: number, right: number, steps: AlgorithmStep[]) {
  if (left >= right) {
    return;
  }

  const pivot = values[right];
  let partitionIndex = left;

  for (let current = left; current < right; current += 1) {
    steps.push(
      createSortingStep(values, [current], [], `比较索引 ${current} 与基准值 ${pivot}`, {
        pivotIndices: [right],
      })
    );

    if (values[current] < pivot) {
      if (partitionIndex !== current) {
        [values[partitionIndex], values[current]] = [values[current], values[partitionIndex]];
        steps.push(
          createSortingStep(
            values,
            [partitionIndex, current],
            [partitionIndex, current],
            `交换到小于基准区间：${partitionIndex} 与 ${current}`
          )
        );
      }

      partitionIndex += 1;
    }
  }

  [values[partitionIndex], values[right]] = [values[right], values[partitionIndex]];
  steps.push(
    createSortingStep(
      values,
      [partitionIndex, right],
      [partitionIndex, right],
      `基准值归位到索引 ${partitionIndex}`,
      {
        pivotIndices: [partitionIndex],
      }
    )
  );

  quickSort(values, left, partitionIndex - 1, steps);
  quickSort(values, partitionIndex + 1, right, steps);
}

function buildQuickSortSteps(source: number[]): AlgorithmStep[] {
  const values = [...source];
  const steps: AlgorithmStep[] = [createSortingStep(values, [], [], '初始化数组')];

  quickSort(values, 0, values.length - 1, steps);
  steps.push(
    createSortingStep(values, [], [], '排序完成', {
      doneIndices: values.map((_, index) => index),
    })
  );

  return steps;
}

export const quickSortRegistry: AlgorithmDefinition = {
  id: 'quick-sort',
  slug: 'quick-sort',
  title: '快速排序',
  description: '通过分区策略将数组递归拆分并完成排序。',
  categories: ['sorting', 'divide-conquer'],
  visualization: 'sorting',
  createSteps: () => buildQuickSortSteps(getSortingInput()),
};
