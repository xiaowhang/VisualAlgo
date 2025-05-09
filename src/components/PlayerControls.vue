<template>
  <div class="player-controls gap-2 flex flex-col items-start">
    <div class="flex items-center gap-2 flex-1 w-full">
      <span style="font-size: 16px" class="flex-none w-16">动画速度</span>
      <el-slider
        class="flex-1 px-4"
        :model-value="playerStore.playbackRate"
        @update:model-value="playerStore.setPlaybackRate"
        :step="1"
        :min="-2"
        :max="3"
        :show-tooltip="false"
      />
    </div>

    <div class="w-full border-t pt-2">
      <div class="flex items-center justify-center gap-2 mb-2">
        <el-button
          @click="playerStore.prevStep"
          :disabled="playerStore.isPlaying || playerStore.currentStepIndex <= 0"
          >上一步</el-button
        >
        <el-button
          @click="playerStore.togglePlay"
          :disabled="playerStore.totalSteps === 0"
        >
          {{ playerStore.isPlaying ? '暂停' : '播放' }}
        </el-button>
        <el-button
          @click="playerStore.nextStep"
          :disabled="
            playerStore.isPlaying ||
            playerStore.currentStepIndex >= playerStore.totalSteps - 1
          "
          >下一步</el-button
        >
      </div>
      <div class="flex items-center gap-2 w-full">
        <Progress
          class="flex-1"
          v-model:current-step="playerStore.currentStepIndex"
          :total-steps="playerStore.totalSteps"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/store/usePlayerStore'
import Progress from '@/components/Progress.vue'

const playerStore = usePlayerStore()
</script>
