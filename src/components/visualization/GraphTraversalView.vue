<script setup lang="ts">
import * as d3 from 'd3';
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import type { GraphEdge, GraphNode, GraphStep } from '@/types/algorithm';
import { resolveGraphNodeColor, VISUALIZATION_COLOR_TOKENS } from '@/visualizers/colorSemantics';

const props = defineProps<{
  step: GraphStep | null;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const viewWidth = 760;
const viewHeight = 340;

const pan = useSvgPanAndCenter(() => isPlaying.value);

function getNodeBounds(nodes: GraphNode[]) {
  const padding = 28;
  const xs = nodes.map(node => node.x);
  const ys = nodes.map(node => node.y);
  return {
    minX: Math.min(...xs) - padding,
    maxX: Math.max(...xs) + padding,
    minY: Math.min(...ys) - padding,
    maxY: Math.max(...ys) + padding,
  };
}

function renderGraph(step: GraphStep | null) {
  if (!svgRef.value || !step) {
    return;
  }

  const svg = d3.select(svgRef.value);
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${viewWidth} ${viewHeight}`).attr('class', 'h-full w-full');

  const root = svg.append('g').attr('transform', pan.transform.value);

  const nodeMap = new Map(step.nodes.map(node => [node.id, node]));

  root
    .append('g')
    .selectAll('line')
    .data(step.edges)
    .join('line')
    .attr('x1', (edge: GraphEdge) => nodeMap.get(edge.source)?.x ?? 0)
    .attr('y1', (edge: GraphEdge) => nodeMap.get(edge.source)?.y ?? 0)
    .attr('x2', (edge: GraphEdge) => nodeMap.get(edge.target)?.x ?? 0)
    .attr('y2', (edge: GraphEdge) => nodeMap.get(edge.target)?.y ?? 0)
    .attr('stroke', VISUALIZATION_COLOR_TOKENS.border)
    .attr('stroke-width', 2);

  const nodeGroup = root
    .append('g')
    .selectAll('g.node')
    .data(step.nodes)
    .join('g')
    .attr('class', 'node');

  nodeGroup
    .append('circle')
    .attr('cx', (node: GraphNode) => node.x)
    .attr('cy', (node: GraphNode) => node.y)
    .attr('r', 24)
    .attr('fill', (node: GraphNode) => resolveGraphNodeColor(step, node.id))
    .attr('stroke', VISUALIZATION_COLOR_TOKENS.border)
    .attr('stroke-width', 2);

  nodeGroup
    .append('text')
    .attr('x', (node: GraphNode) => node.x)
    .attr('y', (node: GraphNode) => node.y + 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 600)
    .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
    .text((node: GraphNode) => node.id);
}

function centerGraph(step: GraphStep | null) {
  if (!step || step.nodes.length === 0) {
    return;
  }
  pan.centerContent(viewWidth, viewHeight, getNodeBounds(step.nodes));
}

onMounted(() => {
  centerGraph(props.step);
  renderGraph(props.step);
});

watch(
  () => pan.transform.value,
  () => {
    renderGraph(props.step);
  }
);

watch(
  () => props.step,
  step => {
    if (pan.offsetX.value === 0 && pan.offsetY.value === 0) {
      centerGraph(step);
    }
    renderGraph(step);
  },
  { deep: true }
);
</script>

<template>
  <div class="h-85 w-full" @pointerdown="pan.onPointerDown">
    <svg ref="svgRef" class="h-full w-full cursor-grab active:cursor-grabbing" />
  </div>
</template>
