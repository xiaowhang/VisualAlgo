export interface DataType {
  id: number
  value: number
}

export interface AlgorithmStep {
  data: DataType[]
  highlight: number[]
  action: string
}

export interface AlgorithmConfig {
  name: string
  generateSteps: (data: DataType[]) => AlgorithmStep[]
  description?: string
}
