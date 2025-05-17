import type { AlgorithmStep, DataType } from '@/types'
import { type ColorKey } from '@/constants'

/**
 * 生成快速排序的步骤
 * @param dataWithIdsInput 初始数据
 * @returns 排序步骤数组
 */
export function generateQuickSortSteps(dataWithIdsInput: DataType[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const arr = dataWithIdsInput.slice()
  const n = arr.length

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  quickSort(arr, 0, n - 1, steps)

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  return steps
}

// 记录已经确定位置的下标
const sortedIndex: number[] = []

function quickSort(arr: DataType[], l: number, r: number, steps: AlgorithmStep[]) {
  if (l >= r) {
    if (l === r) sortedIndex.push(l)
    return
  }

  const pivot = partition(arr, l, r, steps)
  quickSort(arr, l, pivot - 1, steps)
  quickSort(arr, pivot + 1, r, steps)
}

function partition(arr: DataType[], l: number, r: number, steps: AlgorithmStep[]): number {
  const pivot = arr[l].value

  while (l < r) {
    while (l < r && pivot <= arr[r].value) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...sortedIndex.map((index) => [index, 'green'] as [number, ColorKey]),
          [l, 'gold'],
          [r, 'orange'],
        ]),
      })
      r--
    }
    if (l < r) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...sortedIndex.map((index) => [index, 'green'] as [number, ColorKey]),
          [l, 'gold'],
          [r, 'orange'],
        ]),
      })
      ;[arr[l], arr[r]] = [arr[r], arr[l]]
    }
    while (l < r && arr[l].value <= pivot) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...sortedIndex.map((index) => [index, 'green'] as [number, ColorKey]),
          [l, 'orange'],
          [r, 'gold'],
        ]),
      })
      l++
    }
    if (l < r) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...sortedIndex.map((index) => [index, 'green'] as [number, ColorKey]),
          [l, 'orange'],
          [r, 'gold'],
        ]),
      })
      ;[arr[l], arr[r]] = [arr[r], arr[l]]
    }
  }
  arr[l].value = pivot
  sortedIndex.push(l)
  return l
}
