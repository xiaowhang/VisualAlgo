import type { AlgorithmStep, DataType } from '../types/algorithm'
import { type ColorKey } from '@/constants'

/**
 * 生成选择排序的步骤
 * @param dataWithIdsInput 初始数据
 * @returns 排序步骤数组
 */
export function generateSelectionSortSteps(dataWithIdsInput: DataType[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const arr = dataWithIdsInput.slice()
  const n = arr.length

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i
    for (let j = i + 1; j < n; j++) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          [minIndex, 'gold'],
          [j, 'gold'],
          ...Array.from({ length: i }, (_, idx) => [idx, 'green'] as [number, ColorKey]),
        ]),
      })
      if (arr[j].value < arr[minIndex].value) {
        minIndex = j
      }
    }
    if (minIndex !== i) {
      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
    }
    steps.push({
      data: arr.slice(),
      highlight: new Map<number, ColorKey>(
        Array.from({ length: i + 1 }, (_, idx) => [idx, 'green']),
      ),
    })
  }

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  return steps
}
