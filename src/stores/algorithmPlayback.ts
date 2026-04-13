import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePlaybackController } from '@/composables/usePlaybackController';

export const useAlgorithmPlaybackStore = defineStore('algorithm-playback', () => {
  const playback = usePlaybackController();
  const compareContinueLonger = ref(true);

  function setCompareContinueLonger(value: boolean) {
    compareContinueLonger.value = value;
  }

  return {
    ...playback,
    compareContinueLonger,
    setCompareContinueLonger,
  };
});
