import type { ColorKey } from '@/constants'

export type DataType = {
  id: number
  value: number
}

export type HighlightType = Map<number, ColorKey>

export type AlgorithmStep = {
  data: DataType[]
  highlight: Map<number, ColorKey>
}

export type AlgorithmConfig = {
  name: string
  generateSteps: (data: DataType[]) => AlgorithmStep[]
  description?: string
}
