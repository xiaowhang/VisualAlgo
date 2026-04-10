import { defineStore } from 'pinia';
import { usePlaybackController } from '@/composables/usePlaybackController';

export const useAlgorithmPlaybackStore = defineStore('algorithm-playback', () => {
  return usePlaybackController();
});
