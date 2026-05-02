<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { TimelineStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderTimeline, getTimelineBounds } from '@/visualizers/timelineVisualizer';

const TIMELINE_VIEWBOX = { width: 760, height: 400 };

const props = defineProps<{
  step: TimelineStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

function render(step: TimelineStep | null) {
  if (!svgRef.value || !step) return;

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${TIMELINE_VIEWBOX.width} ${TIMELINE_VIEWBOX.height}`);

  const bounds = getTimelineBounds(step);
  pan.centerContent(TIMELINE_VIEWBOX.width, TIMELINE_VIEWBOX.height, bounds);

  renderTimeline({
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
