<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { SortingStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderSortingBars } from '@/visualizers/sortingBarVisualizer';

const props = defineProps<{
  step: SortingStep | null;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const pan = useSvgPanAndCenter(() => isPlaying.value);

function renderChart(step: SortingStep | null) {
  if (!svgRef.value || !step) {
    return;
  }

  renderSortingBars({
    svgElement: svgRef.value,
    step,
    transform: pan.transform.value,
  });
}

onMounted(() => {
  renderChart(props.step);
});

watch(
  () => pan.transform.value,
  () => {
    renderChart(props.step);
  }
);

watch(
  () => props.step,
  step => {
    renderChart(step);
  },
  { deep: true }
);
</script>

<template>
  <svg
    ref="svgRef"
    class="h-full w-full cursor-grab active:cursor-grabbing"
    @pointerdown="pan.onPointerDown"
  />
</template>
