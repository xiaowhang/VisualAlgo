<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { DecisionTreeStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderDecisionTree, getDecisionTreeBounds } from '@/visualizers/decisionTreeVisualizer';

const DECISION_TREE_VIEWBOX = { width: 760, height: 500 };

const props = defineProps<{
  step: DecisionTreeStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

function renderChart(step: DecisionTreeStep | null) {
  if (!svgRef.value || !step) {
    return;
  }

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${DECISION_TREE_VIEWBOX.width} ${DECISION_TREE_VIEWBOX.height}`);

  const bounds = getDecisionTreeBounds(step);
  pan.centerContent(DECISION_TREE_VIEWBOX.width, DECISION_TREE_VIEWBOX.height, bounds);

  renderDecisionTree({
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
