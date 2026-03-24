import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export const useAlgorithmPlaybackStore = defineStore('algorithm-playback', () => {
  const currentStep = ref(0);
  const totalSteps = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);

  let timerId: number | null = null;

  const intervalMs = computed(() => Math.max(120, Math.round(850 / speed.value)));

  function clearTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function stepForward() {
    if (currentStep.value >= totalSteps.value - 1) {
      pause();
      return;
    }
    currentStep.value += 1;
  }

  function stepBackward() {
    if (currentStep.value <= 0) {
      return;
    }
    currentStep.value -= 1;
  }

  function startTimer() {
    clearTimer();
    if (!isPlaying.value || totalSteps.value <= 1) {
      return;
    }
    timerId = window.setInterval(stepForward, intervalMs.value);
  }

  watch([isPlaying, speed, totalSteps], startTimer);

  function setTotalSteps(steps: number) {
    totalSteps.value = Math.max(0, steps);
    currentStep.value = Math.min(currentStep.value, Math.max(steps - 1, 0));

    if (steps <= 1) {
      pause();
    }
  }

  function setCurrentStep(stepIndex: number) {
    const maxIndex = Math.max(totalSteps.value - 1, 0);
    currentStep.value = Math.min(Math.max(stepIndex, 0), maxIndex);
  }

  function seekTo(stepIndex: number) {
    pause();
    setCurrentStep(stepIndex);
  }

  function setSpeed(nextSpeed: number) {
    speed.value = Math.min(2, Math.max(0.5, Number(nextSpeed)));
  }

  function play() {
    if (totalSteps.value <= 1 || currentStep.value >= totalSteps.value - 1) {
      return;
    }
    isPlaying.value = true;
  }

  function pause() {
    isPlaying.value = false;
    clearTimer();
  }

  function reset() {
    pause();
    currentStep.value = 0;
  }

  function step() {
    pause();
    stepForward();
  }

  function stepBack() {
    pause();
    stepBackward();
  }

  const canPlay = computed(() => totalSteps.value > 1 && currentStep.value < totalSteps.value - 1);
  const canStep = computed(() => totalSteps.value > 1 && currentStep.value < totalSteps.value - 1);
  const canStepBack = computed(() => totalSteps.value > 1 && currentStep.value > 0);
  const progressPercent = computed(() => {
    if (totalSteps.value <= 1) {
      return 0;
    }
    return (currentStep.value / (totalSteps.value - 1)) * 100;
  });

  return {
    currentStep,
    totalSteps,
    isPlaying,
    speed,
    canPlay,
    canStep,
    canStepBack,
    progressPercent,
    setTotalSteps,
    setCurrentStep,
    seekTo,
    setSpeed,
    play,
    pause,
    reset,
    step,
    stepBack,
  };
});
