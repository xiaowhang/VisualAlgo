import type { AlgorithmStep, DataType } from '@/types'
import { type ColorKey } from '@/constants'

/**
 * 生成希尔排序的步骤
 * @param dataWithIdsInput 初始数据
 * @returns 排序步骤数组
 */
export function generateShellSortSteps(dataWithIdsInput: DataType[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const arr = dataWithIdsInput.slice()
  const n = arr.length

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  let gap = n
  while (gap > 1) {
    gap = Math.floor(gap / 2)
    for (let i = gap; i < n; i++) {
      const key = arr[i]
      let j = i - gap
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...Array.from(
            { length: Math.floor(i / gap) + 1 },
            (_, idx) => [i - idx * gap, 'green'] as [number, ColorKey],
          ),
          [i, 'gold'] as [number, ColorKey],
        ]),
      })
      while (j >= 0 && arr[j].value > key.value) {
        steps.push({
          data: arr.slice(),
          highlight: new Map<number, ColorKey>([
            ...Array.from(
              { length: Math.floor(i / gap) + 1 },
              (_, idx) => [i - idx * gap, 'green'] as [number, ColorKey],
            ),
            [j, 'orange'] as [number, ColorKey],
            [i, 'gold'] as [number, ColorKey],
          ]),
        })
        j -= gap
      }
      if (j >= 0) {
        steps.push({
          data: arr.slice(),
          highlight: new Map<number, ColorKey>([
            ...Array.from(
              { length: Math.floor(i / gap) + 1 },
              (_, idx) => [i - idx * gap, 'green'] as [number, ColorKey],
            ),
            [j, 'orange'] as [number, ColorKey],
            [i, 'gold'] as [number, ColorKey],
          ]),
        })
      }

      j = i - gap
      while (j >= 0 && arr[j].value > key.value) {
        arr[j + gap] = arr[j]
        j -= gap
      }
      arr[j + gap] = key

      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...Array.from(
            { length: Math.floor(i / gap) + 1 },
            (_, idx) => [i - idx * gap, 'green'] as [number, ColorKey],
          ),
        ]),
      })
    }
  }

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  return steps
}
