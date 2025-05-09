import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  // 状态
  const algorithmSteps = ref([]) // 数组，每个元素格式为 { data: [{id, value}, ...], highlight: {i,j}, action: string }
  const currentStepIndex = ref(0)
  const isPlaying = ref(false)
  const playbackRate = ref(0) // 影响 playerInterval 以控制播放速度

  // 从中生成步骤的原始数据，现在存储 {id, value} 对象
  const initialData = ref([])

  // Getters
  const totalSteps = computed(() => algorithmSteps.value.length)
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

    currentStepIndex.value = 0
    isPlaying.value = false
  }

  let playIntervalId = null
  function togglePlay() {
    if (totalSteps.value === 0) return
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
      if (
        currentStepIndex.value >= totalSteps.value - 1 &&
        totalSteps.value > 0
      ) {
        currentStepIndex.value = 0 // 循环播放
      }
      clearInterval(playIntervalId) // 清除任何现有的计时器
      playIntervalId = setInterval(() => {
        if (currentStepIndex.value < totalSteps.value - 1) {
          currentStepIndex.value++
        } else {
          isPlaying.value = false // 播放到末尾停止
          clearInterval(playIntervalId)
        }
      }, playerInterval.value)
    } else {
      clearInterval(playIntervalId)
    }
  }

  function prevStep() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
      if (isPlaying.value) {
        // 如果正在播放，暂停并清除计时器
        isPlaying.value = false
        clearInterval(playIntervalId)
      }
    }
  }

  function nextStep() {
    if (currentStepIndex.value < totalSteps.value - 1) {
      currentStepIndex.value++
      if (isPlaying.value) {
        // 如果正在播放，暂停并清除计时器
        isPlaying.value = false
        clearInterval(playIntervalId)
      }
    }
  }

  function setCurrentStep(index) {
    if (index >= 0 && index < totalSteps.value) {
      currentStepIndex.value = index
      if (isPlaying.value) {
        // 如果正在播放，暂停并清除计时器
        isPlaying.value = false
        clearInterval(playIntervalId)
      }
    }
  }

  function setPlaybackRate(rate) {
    playbackRate.value = rate
    if (isPlaying.value) {
      // 如果正在播放，则以新的速度重新启动计时器
      // 停止
      clearInterval(playIntervalId)
      // 并以新的间隔重新开始
      playIntervalId = setInterval(() => {
        if (currentStepIndex.value < totalSteps.value - 1) {
          currentStepIndex.value++
        } else {
          isPlaying.value = false // 播放到末尾停止
          clearInterval(playIntervalId)
        }
      }, playerInterval.value)
    }
  }

  function resetPlayer(plainSourceData) {
    // plainSourceData 是一个数字数组
    const dataWithIds = plainSourceData.map((val, idx) => ({
      id: idx,
      value: val,
    }))
    initialData.value = dataWithIds.slice() // 存储带 ID 的初始状态
    generateSortSteps(dataWithIds) // 从带 ID 的数据生成步骤（传递引用，generateSortSteps 会对其进行切片）
    currentStepIndex.value = 0
    isPlaying.value = false
    if (playIntervalId) {
      // 确保清除计时器
      clearInterval(playIntervalId)
      playIntervalId = null
    }
  }

  return {
    // 状态
    algorithmSteps,
    currentStepIndex,
    isPlaying,
    playbackRate,
    initialData,

    // Getters
    totalSteps,
    playerInterval,
    playerData,
    playerHighlight,
    currentAction,
    currentStepData,

    // Actions
    generateSortSteps,
    togglePlay,
    prevStep,
    nextStep,
    setCurrentStep,
    setPlaybackRate,
    resetPlayer,
  }
})
