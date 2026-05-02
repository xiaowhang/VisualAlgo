<script setup lang="ts">
import * as d3 from 'd3';
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { NetworkFlowStep } from '@/types/algorithm';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import {
  renderNetworkFlow,
  getNetworkFlowBounds,
  type NetworkFlowRenderContext,
} from '@/visualizers/networkFlowVisualizer';

const NF_VIEWBOX = { width: 760, height: 500 };
const NF_NODE_RADIUS = 24;
const NF_DRAG_PADDING = 2;

const props = defineProps<{
  step: NetworkFlowStep | null;
  isPlayingOverride?: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const resolvedIsPlaying = computed(() => props.isPlayingOverride ?? isPlaying.value);
const pan = useSvgPanAndCenter(() => resolvedIsPlaying.value);

const draggedNodeOffsets = ref(new Map<string, { dx: number; dy: number }>());
const dragGrabOffsets = ref(new Map<string, { x: number; y: number }>());
const lastSignature = ref('');

function createSignature(step: NetworkFlowStep | null) {
  if (!step) return 'none';
  const nodeSig = step.nodes
    .map(n => `${n.id}:${n.x.toFixed(2)}:${n.y.toFixed(2)}`)
    .sort()
    .join('|');
  const edgeSig = step.edges
    .map(e => `${e.source}->${e.target}`)
    .sort()
    .join('|');
  return `${nodeSig}::${edgeSig}`;
}

function clearDragOffsets() {
  draggedNodeOffsets.value.clear();
  dragGrabOffsets.value.clear();
}

function clampNodeOffset(baseNode: { x: number; y: number }, offsetDx: number, offsetDy: number) {
  const minX = NF_NODE_RADIUS + NF_DRAG_PADDING;
  const maxX = NF_VIEWBOX.width - NF_NODE_RADIUS - NF_DRAG_PADDING;
  const minY = NF_NODE_RADIUS + NF_DRAG_PADDING;
  const maxY = NF_VIEWBOX.height - NF_NODE_RADIUS - NF_DRAG_PADDING;

  const x = Math.min(maxX, Math.max(minX, baseNode.x + offsetDx));
  const y = Math.min(maxY, Math.max(minY, baseNode.y + offsetDy));

  return {
    dx: x - baseNode.x,
    dy: y - baseNode.y,
  };
}

function resolvePointerPosition(event: unknown) {
  if (!svgRef.value || !(event instanceof MouseEvent)) return null;
  const [svgX, svgY] = d3.pointer(event, svgRef.value);
  return {
    x: svgX - pan.offsetX.value,
    y: svgY - pan.offsetY.value,
  };
}

function resolveNodePosition(step: NetworkFlowStep, nodeId: string) {
  const node = step.nodes.find(n => n.id === nodeId);
  const offset = draggedNodeOffsets.value.get(nodeId);
  return {
    x: (node?.x ?? 0) + (offset?.dx ?? 0),
    y: (node?.y ?? 0) + (offset?.dy ?? 0),
  };
}

function renderChart(step: NetworkFlowStep | null) {
  if (!svgRef.value || !step) return;

  const svg = svgRef.value;
  svg.setAttribute('viewBox', `0 0 ${NF_VIEWBOX.width} ${NF_VIEWBOX.height}`);

  const bounds = getNetworkFlowBounds(step);
  pan.centerContent(NF_VIEWBOX.width, NF_VIEWBOX.height, bounds);

  const context: NetworkFlowRenderContext = {
    svgElement: svg,
    step,
    transform: pan.transform.value,
    draggedNodeOffsets: draggedNodeOffsets.value,
  };

  renderNetworkFlow(context);

  // Add drag behavior if not playing
  if (!resolvedIsPlaying.value) {
    setupDragBehavior(step);
  }
}

function setupDragBehavior(step: NetworkFlowStep) {
  if (!svgRef.value) return;

  const svg = d3.select(svgRef.value);
  const nodeGroups = svg.selectAll<SVGGElement, unknown>('g.nf-nodes > g');

  const dragBehavior = d3
    .drag<SVGGElement, unknown>()
    .filter(event => event.button === 0)
    .on('start', function (event) {
      event.sourceEvent?.stopPropagation();
      d3.select(this).interrupt();

      const nodeId = d3.select(this).select('text').text();
      if (!nodeId) return;

      if (!draggedNodeOffsets.value.has(nodeId)) {
        draggedNodeOffsets.value.set(nodeId, { dx: 0, dy: 0 });
      }

      const pointer = resolvePointerPosition(event.sourceEvent);
      const pos = resolveNodePosition(step, nodeId);
      if (pointer) {
        dragGrabOffsets.value.set(nodeId, {
          x: pointer.x - pos.x,
          y: pointer.y - pos.y,
        });
      }
    })
    .on('drag', function (event) {
      const nodeId = d3.select(this).select('text').text();
      if (!nodeId) return;

      const pointer = resolvePointerPosition(event.sourceEvent);
      if (!pointer) return;

      const grabOffset = dragGrabOffsets.value.get(nodeId) ?? { x: 0, y: 0 };
      const baseNode = step.nodes.find(n => n.id === nodeId);
      if (!baseNode) return;

      const nextOffset = clampNodeOffset(
        baseNode,
        pointer.x - grabOffset.x - baseNode.x,
        pointer.y - grabOffset.y - baseNode.y
      );
      draggedNodeOffsets.value.set(nodeId, nextOffset);

      const pos = resolveNodePosition(step, nodeId);
      d3.select(this).attr('transform', `translate(${pos.x}, ${pos.y})`);

      // Update edge positions
      updateEdgePositions(step);
    })
    .on('end', function () {
      const nodeId = d3.select(this).select('text').text();
      if (nodeId) dragGrabOffsets.value.delete(nodeId);
    });

  nodeGroups.call(dragBehavior);
}

function updateEdgePositions(step: NetworkFlowStep) {
  if (!svgRef.value) return;

  const svg = d3.select(svgRef.value);
  const edges = svg.selectAll<SVGLineElement, unknown>('g.nf-edges > line');

  edges.each(function (_, i) {
    const edge = step.edges[i];
    if (!edge) return;

    const source = resolveNodePosition(step, edge.source);
    const target = resolveNodePosition(step, edge.target);
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    d3.select(this)
      .attr('x1', source.x + ux * NF_NODE_RADIUS)
      .attr('y1', source.y + uy * NF_NODE_RADIUS)
      .attr('x2', target.x - ux * NF_NODE_RADIUS)
      .attr('y2', target.y - uy * NF_NODE_RADIUS);
  });

  // Update edge labels
  const labels = svg.selectAll<SVGTextElement, unknown>('g.nf-edges > text');
  labels.each(function (_, i) {
    const edge = step.edges[i];
    if (!edge) return;

    const source = resolveNodePosition(step, edge.source);
    const target = resolveNodePosition(step, edge.target);
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    d3.select(this)
      .attr('x', midX - uy * 12)
      .attr('y', midY + ux * 12);
  });
}

function handlePanPointerDown(event: PointerEvent) {
  const target = event.target;
  if (target instanceof Element && target.closest('g.nf-nodes > g')) {
    return;
  }
  pan.onPointerDown(event);
}

onMounted(() => {
  lastSignature.value = createSignature(props.step);
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
    const nextSig = createSignature(step);
    if (lastSignature.value !== nextSig) {
      clearDragOffsets();
      lastSignature.value = nextSig;
    }
    renderChart(step);
  },
  { deep: true }
);
</script>

<template>
  <div class="h-full w-full" @pointerdown="handlePanPointerDown">
    <svg ref="svgRef" class="h-full w-full cursor-grab active:cursor-grabbing" />
  </div>
</template>
