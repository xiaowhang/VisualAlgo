<template>
  <div class="player-controls gap-2 flex flex-col items-start">
    <div class="flex items-center gap-2 flex-1 w-full">
      <span style="font-size: 16px" class="flex-none w-16">动画速度</span>
      <el-slider
        class="flex-1 px-4"
        v-model="playbackRate"
        :step="1"
        :min="-2"
        :max="3"
        :show-tooltip="true"
      />
    </div>

    <div class="w-full border-t pt-2">
      <div class="flex items-center justify-center gap-2 mb-2">
        <el-button @click="prev" :disabled="isPlaying || currentStep <= 1"
          >上一步</el-button
        >
        <el-button @click="handlePlayToggle">
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
        <el-button
          @click="next"
          :disabled="isPlaying || currentStep >= totalSteps"
        >
          下一步
        </el-button>
      </div>
      <div class="flex items-center gap-2 w-full">
        <ProgressBar
          class="flex-1"
          v-model:current-step="currentStep"
          :total-steps="totalSteps"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/store/usePlayerStore'
import ProgressBar from '@/components/ProgressBar.vue'
import { storeToRefs } from 'pinia'

const playerStore = usePlayerStore()

const { currentStep, isPlaying, playbackRate, totalSteps } =
  storeToRefs(playerStore)
const { prev, next, handlePlayToggle } = playerStore
</script>
