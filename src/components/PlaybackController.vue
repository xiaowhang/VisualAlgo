<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-vue-next';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';

const playbackStore = useAlgorithmPlaybackStore();
const playbackRefs = storeToRefs(playbackStore);

const playback = {
  ...playbackRefs,
  seekTo: playbackStore.seekTo,
  setSpeed: playbackStore.setSpeed,
  play: playbackStore.play,
  pause: playbackStore.pause,
  reset: playbackStore.reset,
  step: playbackStore.step,
  stepBack: playbackStore.stepBack,
};

const progressLabel = computed(() => {
  if (playback.totalSteps.value === 0) {
    return '0 / 0';
  }
  return `${playback.currentStep.value + 1} / ${playback.totalSteps.value}`;
});

const seekMax = computed(() => Math.max(playback.totalSteps.value - 1, 0));

function handleSeek(value: string | number) {
  playback.seekTo(Number(value));
}
</script>

<template>
  <div class="flex h-20 w-full items-center gap-3 border-t bg-background px-4">
    <Button variant="outline" size="sm" :disabled="!playback.canPlay.value" @click="playback.play">
      <Play class="mr-1 h-4 w-4" />
      Play
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="!playback.canStepBack.value"
      @click="playback.stepBack"
    >
      <StepForward class="mr-1 h-4 w-4 rotate-180" />
      Prev
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="!playback.isPlaying.value"
      @click="playback.pause"
    >
      <Pause class="mr-1 h-4 w-4" />
      Pause
    </Button>
    <Button variant="outline" size="sm" :disabled="!playback.canStep.value" @click="playback.step">
      <StepForward class="mr-1 h-4 w-4" />
      Step
    </Button>
    <Button variant="ghost" size="sm" @click="playback.reset">
      <RotateCcw class="mr-1 h-4 w-4" />
      Reset
    </Button>

    <div class="ml-2 flex min-w-36 items-center gap-2 text-sm text-muted-foreground">
      <span>Speed</span>
      <Input
        :model-value="playback.speed.value"
        type="range"
        min="0.5"
        max="2"
        step="0.25"
        class="h-8 w-28"
        @update:model-value="value => playback.setSpeed(Number(value))"
      />
      <span>{{ playback.speed.value.toFixed(2) }}x</span>
    </div>

    <div class="flex min-w-64 items-center gap-2 text-sm text-muted-foreground">
      <span>Progress</span>
      <Input
        :model-value="playback.currentStep.value"
        type="range"
        min="0"
        :max="seekMax"
        :step="1"
        class="h-8 w-44"
        :disabled="playback.totalSteps.value <= 1"
        @update:model-value="handleSeek"
      />
      <span>{{ playback.progressPercent.value.toFixed(0) }}%</span>
    </div>

    <div class="ml-auto rounded-md border bg-muted/30 px-3 py-1 text-sm text-muted-foreground">
      Step {{ progressLabel }}
    </div>
  </div>
</template>
