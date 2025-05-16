import type { AlgorithmStep, DataType } from '@/types'
import { type ColorKey } from '@/constants'

/**
 * 生成插入排序的步骤
 * @param dataWithIdsInput 初始数据
 * @returns 排序步骤数组
 */
export function generateInsertionSortSteps(dataWithIdsInput: DataType[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const arr = dataWithIdsInput.slice()
  const n = arr.length

  steps.push({
    data: arr.slice(),
    highlight: new Map<number, ColorKey>(),
  })

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1

    steps.push({
      data: arr.slice(),
      highlight: new Map<number, ColorKey>([
        ...Array.from({ length: i }, (_, idx) => [idx, 'green'] as [number, ColorKey]),
        [i, 'gold'],
      ]),
    })

    while (j >= 0 && arr[j].value > key.value) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...Array.from({ length: i }, (_, idx) => [idx, 'green'] as [number, ColorKey]),
          [j, 'orange'],
          [i, 'gold'],
        ]),
      })
      j--
    }
    if (j !== -1) {
      steps.push({
        data: arr.slice(),
        highlight: new Map<number, ColorKey>([
          ...Array.from({ length: i }, (_, idx) => [idx, 'green'] as [number, ColorKey]),
          [j, 'orange'],
          [i, 'gold'],
        ]),
      })
    }

    arr.splice(j + 1, 0, key)
    arr.splice(i + 1, 1)

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
