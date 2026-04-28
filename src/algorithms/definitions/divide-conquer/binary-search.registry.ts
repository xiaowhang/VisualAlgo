import { createSortingStep } from '@/algorithms/shared/sorting/createSortingStep';
import { getSortingInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildBinarySearchSteps(source: number[]): AlgorithmStep[] {
  const values = [...source].sort((a, b) => a - b);
  const targetIndex = Math.floor(Math.random() * values.length);
  const target = values[targetIndex]!;

  const steps: AlgorithmStep[] = [
    createSortingStep(
      values,
      [],
      [],
      `在有序数组中检索目标值 ${target}，上方柱状图展示排序结果。`,
      { pivotIndices: [0, values.length - 1] }
    ),
  ];

  let lo = 0;
  let hi = values.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    steps.push(
      createSortingStep(values, [mid], [], `检查中点索引 ${mid}（值 = ${values[mid]}）`, {
        pivotIndices: [lo, hi],
      })
    );

    if (values[mid] === target) {
      steps.push(
        createSortingStep(values, [], [], `在索引 ${mid} 找到目标值 ${target}。`, {
          doneIndices: [mid],
          pivotIndices: [lo, hi],
        })
      );
      return steps;
    }

    if (values[mid]! < target) {
      lo = mid + 1;
      steps.push(
        createSortingStep(
          values,
          [],
          [],
          `${values[mid]} < ${target}，搜索范围缩小至右半区 [${lo}, ${hi}]。`,
          { pivotIndices: [lo, hi] }
        )
      );
    } else {
      hi = mid - 1;
      steps.push(
        createSortingStep(
          values,
          [],
          [],
          `${values[mid]} > ${target}，搜索范围缩小至左半区 [${lo}, ${hi}]。`,
          { pivotIndices: [lo, hi] }
        )
      );
    }
  }

  steps.push(createSortingStep(values, [], [], `目标值 ${target} 不在数组中。`));

  return steps;
}

export const binarySearchRegistry: AlgorithmDefinition = {
  id: 'binary-search',
  slug: 'binary-search',
  title: '二分检索',
  description: '在有序序列中通过折半比较快速定位目标值。',
  category: 'divide-conquer',
  visualization: 'sorting',
  createSteps: () => buildBinarySearchSteps(getSortingInput()),
};
