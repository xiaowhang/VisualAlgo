import { createSortingStep } from '@/algorithms/shared/sorting/createSortingStep';
import { getSortingInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function merge(
  values: number[],
  left: number,
  middle: number,
  right: number,
  steps: AlgorithmStep[]
) {
  const leftBuffer = values.slice(left, middle + 1);
  const rightBuffer = values.slice(middle + 1, right + 1);
  let leftIndex = 0;
  let rightIndex = 0;
  let mergedIndex = left;

  while (leftIndex < leftBuffer.length && rightIndex < rightBuffer.length) {
    steps.push(
      createSortingStep(
        values,
        [left + leftIndex, middle + 1 + rightIndex],
        [],
        `比较分区元素 ${leftBuffer[leftIndex]} 与 ${rightBuffer[rightIndex]}`
      )
    );

    if (leftBuffer[leftIndex] <= rightBuffer[rightIndex]) {
      values[mergedIndex] = leftBuffer[leftIndex];
      leftIndex += 1;
    } else {
      values[mergedIndex] = rightBuffer[rightIndex];
      rightIndex += 1;
    }

    steps.push(createSortingStep(values, [mergedIndex], [mergedIndex], `写入索引 ${mergedIndex}`));
    mergedIndex += 1;
  }

  while (leftIndex < leftBuffer.length) {
    values[mergedIndex] = leftBuffer[leftIndex];
    steps.push(
      createSortingStep(values, [mergedIndex], [mergedIndex], `补齐左分区到索引 ${mergedIndex}`)
    );
    leftIndex += 1;
    mergedIndex += 1;
  }

  while (rightIndex < rightBuffer.length) {
    values[mergedIndex] = rightBuffer[rightIndex];
    steps.push(
      createSortingStep(values, [mergedIndex], [mergedIndex], `补齐右分区到索引 ${mergedIndex}`)
    );
    rightIndex += 1;
    mergedIndex += 1;
  }
}

function mergeSort(values: number[], left: number, right: number, steps: AlgorithmStep[]) {
  if (left >= right) {
    return;
  }

  const middle = Math.floor((left + right) / 2);
  mergeSort(values, left, middle, steps);
  mergeSort(values, middle + 1, right, steps);
  merge(values, left, middle, right, steps);
}

function buildMergeSortSteps(source: number[]): AlgorithmStep[] {
  const values = [...source];
  const steps: AlgorithmStep[] = [createSortingStep(values, [], [], '初始化数组')];

  mergeSort(values, 0, values.length - 1, steps);
  steps.push(
    createSortingStep(values, [], [], '排序完成', {
      doneIndices: values.map((_, index) => index),
    })
  );

  return steps;
}

export const mergeSortRegistry: AlgorithmDefinition = {
  id: 'merge-sort',
  slug: 'merge-sort',
  title: '归并排序',
  description: '通过分治与归并过程构造有序序列。',
  category: 'sorting',
  visualization: 'sorting',
  createSteps: () => buildMergeSortSteps(getSortingInput()),
};
