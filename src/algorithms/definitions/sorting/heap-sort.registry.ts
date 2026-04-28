import { createSortingStep } from '@/algorithms/shared/sorting/createSortingStep';
import { getSortingInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildHeapSortSteps(source: number[]): AlgorithmStep[] {
  const values = [...source];
  const n = values.length;
  const steps: AlgorithmStep[] = [createSortingStep(values, [], [], '初始化数组')];

  function heapify(heapSize: number, rootIdx: number, phase: string): void {
    let i = rootIdx;

    while (true) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      steps.push(
        createSortingStep(values, [], [], `${phase}：调整以索引 ${i} 为根的子树`, {
          pivotIndices: [i],
        })
      );

      if (left < heapSize) {
        steps.push(
          createSortingStep(
            values,
            [i, left],
            [],
            `比较索引 ${i}(${values[i]}) 与左子节点索引 ${left}(${values[left]})`
          )
        );
        if (values[left] > values[largest]) largest = left;
      }

      if (right < heapSize) {
        steps.push(
          createSortingStep(
            values,
            [i, right],
            [],
            `比较索引 ${i}(${values[i]}) 与右子节点索引 ${right}(${values[right]})`
          )
        );
        if (values[right] > values[largest]) largest = right;
      }

      if (largest === i) break;

      [values[i], values[largest]] = [values[largest], values[i]];
      steps.push(
        createSortingStep(
          values,
          [i, largest],
          [i, largest],
          `交换索引 ${i}(${values[i]}) 与索引 ${largest}(${values[largest]})`
        )
      );
      i = largest;
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
    heapify(n, i, '建堆');
  }

  steps.push(createSortingStep(values, [], [], '大顶堆构建完成'));

  const doneIndices: number[] = [];
  for (let i = n - 1; i > 0; i -= 1) {
    [values[0], values[i]] = [values[i], values[0]];
    steps.push(
      createSortingStep(
        values,
        [0, i],
        [0, i],
        `交换堆顶索引 0(${values[0]}) 与堆末索引 ${i}(${values[i]})`
      )
    );

    doneIndices.push(i);
    steps.push(
      createSortingStep(values, [], [], `索引 ${i} 已就位`, { doneIndices: [...doneIndices] })
    );

    heapify(i, 0, '重调');
  }

  doneIndices.push(0);
  steps.push(createSortingStep(values, [], [], '排序完成', { doneIndices: [...doneIndices] }));

  return steps;
}

export const heapSortRegistry: AlgorithmDefinition = {
  id: 'heap-sort',
  slug: 'heap-sort',
  title: '堆排序',
  description: '利用大顶堆数据结构，反复提取堆顶最大值完成排序。',
  category: 'sorting',
  visualization: 'sorting',
  createSteps: () => buildHeapSortSteps(getSortingInput()),
};
