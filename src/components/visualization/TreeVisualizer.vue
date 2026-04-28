<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { TreeStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderTree, getTreeBounds } from '@/visualizers/treeVisualizer';

const TREE_VIEWBOX = { width: 760, height: 400 };

const props = defineProps<{
  step: TreeStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

function render(step: TreeStep | null) {
  if (!svgRef.value || !step) return;

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${TREE_VIEWBOX.width} ${TREE_VIEWBOX.height}`);

  const bounds = getTreeBounds(step.nodes);
  pan.centerContent(TREE_VIEWBOX.width, TREE_VIEWBOX.height, bounds);

  renderTree({
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
