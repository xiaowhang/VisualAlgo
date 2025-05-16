import type { AlgorithmStep, DataType } from '@/types'
import { type ColorKey } from '@/constants'

/**
 * 生成冒泡排序的步骤
 * @param dataWithIdsInput 初始数据
 * @returns 排序步骤数组
 */
export function generateBubbleSortSteps(dataWithIdsInput: DataType[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const arr = dataWithIdsInput.slice()
  const n = arr.length

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  let swapped = true
  for (let i = 0; i < n - 1 && swapped; i++) {
    swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          [j, 'gold'],
          [j + 1, 'gold'],
        ]),
      })
      if (arr[j].value > arr[j + 1].value) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
        steps.push({
          data: arr.slice(),
          highlight: new Map<number, ColorKey>([
            [j, 'gold'],
            [j + 1, 'gold'],
          ]),
        })
      }
    }

    // 优化：如果提前排序完成
    if (!swapped && i < n - 2) {
      break
    }
  }

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  return steps
}
