<template>
  <div class="player-controls gap-2 flex flex-col items-start">
    <div class="flex items-center gap-2 flex-1 w-full">
      <span style="font-size: 16px" class="flex-none w-16">动画速度</span>
      <el-slider
        class="flex-1 px-4"
        :model-value="playerStore.playbackRate"
        @update:model-value="playerStore.setPlaybackRate"
        :step="0.01"
        :min="-2"
        :max="3"
        show-tooltip
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
        <span class="flex-none text-sm">
          进度 ({{
            playerStore.totalSteps > 0 ? playerStore.currentStepIndex + 1 : 0
          }}
          / {{ playerStore.totalSteps }})
        </span>
        <el-slider
          class="flex-1"
          :model-value="playerStore.currentStepIndex"
          @update:model-value="playerStore.setCurrentStep"
          :min="0"
          :max="playerStore.totalSteps > 0 ? playerStore.totalSteps - 1 : 0"
          :step="1"
          :disabled="playerStore.isPlaying || playerStore.totalSteps === 0"
          show-tooltip
          :format-tooltip="formatStepTooltip"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/store/usePlayerStore' // 假设 @ 指向 src 目录

const playerStore = usePlayerStore()

function formatStepTooltip(val) {
  if (playerStore.totalSteps === 0) return '0/0'
  return `${val + 1}/${playerStore.totalSteps}`
}
</script>
