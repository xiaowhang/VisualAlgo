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
  <div class="mx-auto flex h-full w-full max-w-300 flex-col px-6 py-6 md:px-10 md:py-8">
    <Card v-if="activeAlgorithm" class="min-h-0 flex-1 px-4 py-4 md:px-5 md:py-5">
      <SortingChart v-if="activeAlgorithm.visualization === 'sorting'" :step="sortingStep" />
      <GraphTraversalView v-else :step="graphStep" :algorithm-key="graphAlgorithmKey" />
    </Card>

    <div
      v-else
      class="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground shadow-sm ring-1 ring-border/60"
    >
      算法未找到，请从左侧重新选择算法。
    </div>
  </div>
</template>
