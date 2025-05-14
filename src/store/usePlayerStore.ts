import { defineStore } from 'pinia'
import type { HighlightType } from '@/types'

type DataType = {
  id: number
  value: number
}

type AlgorithmStep = {
  data: DataType[]
  highlight: HighlightType
  action: string
}

export const usePlayerStore = defineStore('player', () => {
  // States
  const algorithmSteps = ref<AlgorithmStep[]>([]) // 数组，每个元素格式为 { data: [{id, value}, ...], highlight: {i,j}, action: string }
  const currentStep = ref<number>(1)
  const isPlaying = ref<boolean>(false)
  const playbackRate = ref<number>(0) // 影响 playerInterval 以控制播放速度

  let timer: ReturnType<typeof setInterval> | null = null

  // 从中生成步骤的原始数据，现在存储 {id, value} 对象
  const initialData = ref<DataType[]>([])

  // Getters
  const totalSteps = computed<number>(() => algorithmSteps.value.length)
  const currentStepIndex = computed<number>(() => currentStep.value - 1)
  const playerInterval = computed<number>(() => 400 / Math.pow(2, playbackRate.value))

  const currentStepData = computed<AlgorithmStep | null>(() => {
    if (
      totalSteps.value === 0 ||
      currentStepIndex.value < 0 ||
      currentStepIndex.value >= totalSteps.value
    ) {
      return null
    }
    return algorithmSteps.value[currentStepIndex.value]
  })

  const playerData = computed<DataType[]>(() => {
    if (currentStepData.value && currentStepData.value.data) {
      return currentStepData.value.data // 已经是 {id, value} 对象数组
    }
    // 如果步骤尚未可用或索引越界，则回退到 initialData。如果 initialData 为空，则返回空数组。
    return initialData.value.length > 0 ? initialData.value : []
  })

  const playerHighlight = computed<HighlightType>(() => {
    return currentStepData.value ? currentStepData.value.highlight : new Map()
  })

  const currentAction = computed<string | null>(() => {
    return currentStepData.value ? currentStepData.value.action : null
  })

  // Actions
  function isValidStep(step: number) {
    return step >= 1 && step <= totalSteps.value
  }

  function pause() {
    if (!timer) return

    isPlaying.value = false
    clearInterval(timer)
    timer = null
  }

  function prev() {
    pause()
    if (!isValidStep(currentStep.value - 1)) return false
    currentStep.value--
    return true
  }

  function next() {
    pause()
    if (!isValidStep(currentStep.value + 1)) return false
    currentStep.value++
    return true
  }

  function play(flag: boolean = false) {
    pause()
    if (next() || (flag && setCurrentStep(1))) {
      timer = setInterval(() => play(), playerInterval.value)
      isPlaying.value = true
    }
  }

  function handlePlayToggle() {
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
      play(true)
    } else {
      pause()
    }
  }

  function setCurrentStep(step: number) {
    pause()
    if (!isValidStep(step)) return false
    currentStep.value = step
    return true
  }

  function createResetHandler(generateStepsFn: (data: DataType[]) => AlgorithmStep[]) {
    return function (data: number[]) {
      const dataWithIds = data.map((val, idx) => ({
        id: idx,
        value: val,
      }))
      initialData.value = dataWithIds.slice() // 存储带 ID 的初始状态
      algorithmSteps.value = generateStepsFn(dataWithIds) // 从带 ID 的数据生成步骤（传递引用，generateSortSteps 会对其进行切片）

      currentStep.value = 1
      pause()
    }
  }

  return {
    // States
    algorithmSteps,
    currentStep,
    isPlaying,
    playbackRate,
    initialData,

    // Getters
    totalSteps,
    currentStepIndex,
    playerInterval,
    currentStepData,
    playerData,
    playerHighlight,
    currentAction,

    // Actions
    isValidStep,
    pause,
    prev,
    next,
    play,
    handlePlayToggle,
    setCurrentStep,
    createResetHandler,
  }
})
