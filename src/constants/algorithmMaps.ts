export const categoryMap = {
  sorting: '排序',
} as const

export const titleMap = {
  BubbleSort: '冒泡排序',
  SelectionSort: '选择排序',
  InsertionSort: '插入排序',
  ShellSort: '希尔排序',
  QuickSort: '快速排序',
} as const

export type Category = keyof typeof categoryMap
export type Title = keyof typeof titleMap
