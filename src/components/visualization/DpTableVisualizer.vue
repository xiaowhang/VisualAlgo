<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { DpTableStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderDpTable, getDpTableBounds } from '@/visualizers/dpTableVisualizer';

const DP_VIEWBOX = { width: 760, height: 480 };

const props = defineProps<{
  step: DpTableStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

function render(step: DpTableStep | null) {
  if (!svgRef.value || !step) return;

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${DP_VIEWBOX.width} ${DP_VIEWBOX.height}`);

  const bounds = getDpTableBounds(step);
  pan.centerContent(DP_VIEWBOX.width, DP_VIEWBOX.height, bounds);

  renderDpTable({
    svgElement: svg,
    step,
    transform: pan.transform.value,
  });
}

onMounted(() => render(props.step));

watch(
  () => props.step,
  step => render(step),
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
