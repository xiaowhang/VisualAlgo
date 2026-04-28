<script setup lang="ts">
import CompareSideCard from '@/components/CompareSideCard.vue';
import { useCompareViewModel } from '@/features/compare/composables/useCompareViewModel';

const {
  playback,
  leftSide,
  rightSide,
  leftVisualization,
  rightVisualization,
  compareTitle,
  compareDescription,
  leftTitle,
  rightTitle,
  leftStepDescription,
  rightStepDescription,
  leftStatusText,
  rightStatusText,
} = useCompareViewModel();
</script>

<template>
  <div class="mx-auto flex h-full w-full flex-col gap-5 px-6 py-6 md:px-10 md:py-8">
    <Card>
      <CardHeader>
        <CardTitle>{{ compareTitle }}</CardTitle>
        <CardDescription>{{ compareDescription }}</CardDescription>
      </CardHeader>
    </Card>

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <CompareSideCard
        :title="leftTitle"
        :status-text="leftStatusText"
        :description="leftStepDescription"
        :visualization="leftVisualization"
        :sorting-step="leftSide.sortingStep.value"
        :graph-step="leftSide.graphStep.value"
        :tree-step="leftSide.treeStep.value"
        :hanoi-step="leftSide.hanoiStep.value"
        :graph-algorithm-key="leftSide.graphAlgorithmKey.value"
        :is-playing="playback.isPlaying.value"
      />

      <CompareSideCard
        :title="rightTitle"
        :status-text="rightStatusText"
        :description="rightStepDescription"
        :visualization="rightVisualization"
        :sorting-step="rightSide.sortingStep.value"
        :graph-step="rightSide.graphStep.value"
        :tree-step="rightSide.treeStep.value"
        :hanoi-step="rightSide.hanoiStep.value"
        :graph-algorithm-key="rightSide.graphAlgorithmKey.value"
        :is-playing="playback.isPlaying.value"
      />
    </div>
  </div>
</template>
