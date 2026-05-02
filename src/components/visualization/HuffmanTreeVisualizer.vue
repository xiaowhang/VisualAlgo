<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { HuffmanStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import { renderHuffmanTree, getHuffmanTreeBounds } from '@/visualizers/huffmanTreeVisualizer';

const HUFFMAN_VIEWBOX = { width: 760, height: 480 };

const props = defineProps<{
  step: HuffmanStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

function render(step: HuffmanStep | null) {
  if (!svgRef.value || !step) return;

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${HUFFMAN_VIEWBOX.width} ${HUFFMAN_VIEWBOX.height}`);

  const bounds = getHuffmanTreeBounds(step);
  pan.centerContent(HUFFMAN_VIEWBOX.width, HUFFMAN_VIEWBOX.height, bounds);

  renderHuffmanTree({
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
