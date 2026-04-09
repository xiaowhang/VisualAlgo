<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import GraphTraversalView from '@/components/visualization/GraphTraversalView.vue';
import SortingChart from '@/components/visualization/SortingChart.vue';
import { findAlgorithm } from '@/algorithms/registry';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import type { GraphStep, SortingStep } from '@/types/algorithm';

const route = useRoute();
const playbackStore = useAlgorithmPlaybackStore();
const algorithmInputsStore = useAlgorithmInputsStore();

const playbackRefs = storeToRefs(playbackStore);
const algorithmInputsRefs = storeToRefs(algorithmInputsStore);

const playback = {
  ...playbackRefs,
  reset: playbackStore.reset,
  setTotalSteps: playbackStore.setTotalSteps,
};

const algorithmInputs = {
  ...algorithmInputsRefs,
};

const activeAlgorithm = computed(() => {
  const category = String(route.params.category ?? '');
  const slug = String(route.params.slug ?? '');
  return findAlgorithm(category, slug);
});

const steps = computed(() => activeAlgorithm.value?.createSteps() ?? []);

const currentStepData = computed(() => {
  if (steps.value.length === 0) {
    return null;
  }
  return steps.value[playback.currentStep.value] ?? steps.value[0];
});

const sortingStep = computed(() => {
  const step = currentStepData.value;
  if (!step || step.kind !== 'sorting') {
    return null;
  }
  return step as SortingStep;
});

const graphStep = computed(() => {
  const step = currentStepData.value;
  if (!step || step.kind !== 'graph') {
    return null;
  }
  return step as GraphStep;
});

const graphAlgorithmKey = computed(() => {
  if (!activeAlgorithm.value || activeAlgorithm.value.visualization !== 'graph') {
    return null;
  }
  return `${activeAlgorithm.value.category}:${activeAlgorithm.value.id}`;
});

watch(
  [() => activeAlgorithm.value?.id, () => algorithmInputs.dataVersion.value],
  () => {
    playback.reset();
    playback.setTotalSteps(steps.value.length);
  },
  { immediate: true }
);
</script>

<template>
  <div class="mx-auto flex h-full w-full flex-col p-6">
    <SortingChart
      v-if="activeAlgorithm && activeAlgorithm.visualization === 'sorting'"
      :step="sortingStep"
    />
    <GraphTraversalView
      v-else-if="activeAlgorithm"
      :step="graphStep"
      :algorithm-key="graphAlgorithmKey"
    />
    <div v-else class="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
      算法未找到，请从左侧重新选择算法。
    </div>
  </div>
</template>
