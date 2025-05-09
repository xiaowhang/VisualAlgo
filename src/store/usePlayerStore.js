import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  // States
  const algorithmSteps = ref([]) // 数组，每个元素格式为 { data: [{id, value}, ...], highlight: {i,j}, action: string }
  const currentStep = ref(1)
  const isPlaying = ref(false)
  const playbackRate = ref(0) // 影响 playerInterval 以控制播放速度

  let timer = null

  // 从中生成步骤的原始数据，现在存储 {id, value} 对象
  const initialData = ref([])

  // Getters
  const totalSteps = computed(() => algorithmSteps.value.length)
  const currentStepIndex = computed(() => currentStep.value - 1)
  const playerInterval = computed(() => 400 / Math.pow(2, playbackRate.value))

  const currentStepData = computed(() => {
    if (
      totalSteps.value === 0 ||
      currentStepIndex.value < 0 ||
      currentStepIndex.value >= totalSteps.value
    ) {
      return null
    }
    return algorithmSteps.value[currentStepIndex.value]
  })

  const playerData = computed(() => {
    if (currentStepData.value && currentStepData.value.data) {
      return currentStepData.value.data // 已经是 {id, value} 对象数组
    }
    // 如果步骤尚未可用或索引越界，则回退到 initialData。如果 initialData 为空，则返回空数组。
    return initialData.value.length > 0 ? initialData.value : []
  })

  const playerHighlight = computed(() => {
    return currentStepData.value
      ? currentStepData.value.highlight
      : { i: -1, j: -1 }
  })

  const currentAction = computed(() => {
    return currentStepData.value ? currentStepData.value.action : null
  })

  // Actions
  function isVaildStep(step) {
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
    if (!isVaildStep(currentStep.value - 1)) return false
    currentStep.value--
    return true
  }

  function next() {
    pause()
    if (!isVaildStep(currentStep.value + 1)) return false
    currentStep.value++
    return true
  }

  function play(flag = false) {
    pause()
    if (next() || (flag && setCurrentStep(1))) {
      timer = setInterval(() => play(), playerInterval.value)
      isPlaying.value = true
    }
  }

  watch(() => playbackRate.value, play)

  function handlePlayToggle() {
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
      play(true)
    } else {
      pause()
    }
  }

  function setCurrentStep(step) {
    pause()
    if (!isVaildStep(step)) return false
    currentStep.value = step
    return true
  }

  function generateSortSteps(dataWithIdsInput) {
    // dataWithIdsInput 是一个 {id, value} 对象的数组。
    // initialData.value 已由 resetPlayer 设置为 dataWithIdsInput 的初始状态。
    algorithmSteps.value = []
    // 创建数组结构的可变副本，但重用项目对象进行排序。
    const arr = dataWithIdsInput.slice()
    const n = arr.length

    algorithmSteps.value.push({
      data: arr.slice(), // 存储数组的快照（对象引用数组）
      highlight: { i: -1, j: -1 },
      action: 'initial',
    })

    let swapped = true
    for (let i = 0; i < n - 1 && swapped; i++) {
      swapped = false
      for (let j = 0; j < n - 1 - i; j++) {
        algorithmSteps.value.push({
          data: arr.slice(),
          highlight: { i: j, j: j + 1 },
          action: 'compare',
        })
        if (arr[j].value > arr[j + 1].value) {
          // 按 .value 比较
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]] // 交换 arr 中的对象
          swapped = true
          algorithmSteps.value.push({
            data: arr.slice(),
            highlight: { i: j, j: j + 1 },
            action: 'swap',
          })
        }
      }
      if (!swapped && i < n - 2) {
        // 如果没有发生交换并且不是最后一次遍历
        // 优化：如果数组提前排序完毕，所有剩余元素都已就位。
        // 我们可以添加一个 'sorted' 步骤并中断循环。
      }
    }
    algorithmSteps.value.push({
      data: arr.slice(),
      highlight: { i: -1, j: -1 },
      action: 'sorted',
    })

    currentStep.value = 1
    isPlaying.value = false
  }

  function resetPlayer(plainSourceData) {
    // plainSourceData 是一个数字数组
    const dataWithIds = plainSourceData.map((val, idx) => ({
      id: idx,
      value: val,
    }))
    initialData.value = dataWithIds.slice() // 存储带 ID 的初始状态
    generateSortSteps(dataWithIds) // 从带 ID 的数据生成步骤（传递引用，generateSortSteps 会对其进行切片）

    currentStep.value = 1
    isPlaying.value = false
    pause()
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
    isVaildStep,
    pause,
    prev,
    next,
    play,
    handlePlayToggle,
    setCurrentStep,
    generateSortSteps,
    resetPlayer,
  }
})
