<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { LpGraphicalStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderLpGraphical, getLpGraphicalBounds } from '@/visualizers/lpGraphicalVisualizer';

const LP_VIEWBOX = { width: 760, height: 500 };

const props = defineProps<{
  step: LpGraphicalStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

function renderChart(step: LpGraphicalStep | null) {
  if (!svgRef.value || !step) {
    return;
  }

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${LP_VIEWBOX.width} ${LP_VIEWBOX.height}`);

  const bounds = getLpGraphicalBounds(step);
  pan.centerContent(LP_VIEWBOX.width, LP_VIEWBOX.height, bounds);

  renderLpGraphical({
    svgElement: svg,
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
