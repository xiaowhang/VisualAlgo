<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { ChessboardStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderChessboard, getChessboardBounds } from '@/visualizers/chessboardVisualizer';

const CHESSBOARD_VIEWBOX = { width: 760, height: 500 };

const props = defineProps<{
  step: ChessboardStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

function renderChart(step: ChessboardStep | null) {
  if (!svgRef.value || !step) {
    return;
  }

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${CHESSBOARD_VIEWBOX.width} ${CHESSBOARD_VIEWBOX.height}`);

  const bounds = getChessboardBounds(step.size);
  pan.centerContent(CHESSBOARD_VIEWBOX.width, CHESSBOARD_VIEWBOX.height, bounds);

  renderChessboard({
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
