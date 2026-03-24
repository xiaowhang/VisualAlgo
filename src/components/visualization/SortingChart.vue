<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { SortingStep } from '@/types/algorithm';
import { renderSortingBars } from '@/visualizers/sortingBarVisualizer';

const props = defineProps<{
  step: SortingStep | null;
}>();

const svgRef = ref<SVGSVGElement | null>(null);

function renderChart(step: SortingStep | null) {
  if (!svgRef.value || !step) {
    return;
  }

  renderSortingBars({
    svgElement: svgRef.value,
    step,
  });
}

onMounted(() => {
  renderChart(props.step);
});

watch(
  () => props.step,
  step => {
    renderChart(step);
  },
  { deep: true }
);
</script>

<template>
  <svg ref="svgRef" class="h-full w-full" />
</template>
