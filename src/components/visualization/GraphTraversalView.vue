<script setup lang="ts">
import * as d3 from 'd3';
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { useSvgPanAndCenter } from '@/composables/useSvgPanAndCenter';
import type { GraphEdge, GraphNode, GraphStep } from '@/types/algorithm';
import { resolveGraphNodeColor, VISUALIZATION_COLOR_TOKENS } from '@/visualizers/colorSemantics';
import { resolveCssColorToken } from '@/visualizers/resolveCssColorToken';

const GRAPH_VIEWBOX = {
  width: 760,
  height: 340,
} as const;
const GRAPH_ANIMATION_DURATION = 260;
const GRAPH_NODE_RADIUS = 24;
const GRAPH_BOUNDS_PADDING = GRAPH_NODE_RADIUS + 10;
const GRAPH_DRAG_PADDING = 2;

const props = defineProps<{
  step: GraphStep | null;
  algorithmKey: string | null;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const playbackStore = useAlgorithmPlaybackStore();
const { isPlaying } = storeToRefs(playbackStore);
const draggedNodeOffsets = ref(new Map<string, { dx: number; dy: number }>());
const dragGrabOffsets = ref(new Map<string, { x: number; y: number }>());
const lastGraphSignature = ref('');

const pan = useSvgPanAndCenter(() => isPlaying.value);

function getNodeBounds(nodes: GraphNode[]) {
  const xs = nodes.map(node => node.x);
  const ys = nodes.map(node => node.y);
  return {
    minX: Math.min(...xs) - GRAPH_BOUNDS_PADDING,
    maxX: Math.max(...xs) + GRAPH_BOUNDS_PADDING,
    minY: Math.min(...ys) - GRAPH_BOUNDS_PADDING,
    maxY: Math.max(...ys) + GRAPH_BOUNDS_PADDING,
  };
}

function getEdgeKey(edge: GraphEdge) {
  return `${edge.source}->${edge.target}`;
}

function resolveNodePosition(nodeMap: Map<string, GraphNode>, nodeId: string) {
  const node = nodeMap.get(nodeId);
  const offset = draggedNodeOffsets.value.get(nodeId);
  return {
    x: (node?.x ?? 0) + (offset?.dx ?? 0),
    y: (node?.y ?? 0) + (offset?.dy ?? 0),
  };
}

function createGraphSignature(step: GraphStep | null) {
  if (!step) {
    return 'none';
  }

  const nodeSignature = [...step.nodes]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(node => `${node.id}:${node.x.toFixed(2)}:${node.y.toFixed(2)}`)
    .join('|');

  const edgeSignature = [...step.edges]
    .map(edge => getEdgeKey(edge))
    .sort((left, right) => left.localeCompare(right))
    .join('|');

  return `${nodeSignature}::${edgeSignature}`;
}

function clearDraggedNodeOffsets() {
  draggedNodeOffsets.value.clear();
  dragGrabOffsets.value.clear();
}

function clampNodePosition(baseNode: GraphNode, offsetDx: number, offsetDy: number) {
  const minX = GRAPH_NODE_RADIUS + GRAPH_DRAG_PADDING;
  const maxX = GRAPH_VIEWBOX.width - GRAPH_NODE_RADIUS - GRAPH_DRAG_PADDING;
  const minY = GRAPH_NODE_RADIUS + GRAPH_DRAG_PADDING;
  const maxY = GRAPH_VIEWBOX.height - GRAPH_NODE_RADIUS - GRAPH_DRAG_PADDING;

  const x = Math.min(maxX, Math.max(minX, baseNode.x + offsetDx));
  const y = Math.min(maxY, Math.max(minY, baseNode.y + offsetDy));

  return {
    dx: x - baseNode.x,
    dy: y - baseNode.y,
  };
}

function resolvePointerGraphPosition(sourceEvent: unknown) {
  if (!svgRef.value || !(sourceEvent instanceof MouseEvent)) {
    return null;
  }

  const [svgX, svgY] = d3.pointer(sourceEvent, svgRef.value);
  return {
    x: svgX - pan.offsetX.value,
    y: svgY - pan.offsetY.value,
  };
}

function resolveEdgeMidpoint(nodeMap: Map<string, GraphNode>, edge: GraphEdge) {
  const source = resolveNodePosition(nodeMap, edge.source);
  const target = resolveNodePosition(nodeMap, edge.target);

  return {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2,
  };
}

function resolveNodeFill(step: GraphStep | null, nodeId: string) {
  if (!step) {
    return VISUALIZATION_COLOR_TOKENS.idle;
  }
  return resolveGraphNodeColor(step, nodeId);
}

function resolveNodeFillColor(svgElement: SVGSVGElement, step: GraphStep | null, nodeId: string) {
  return resolveCssColorToken(svgElement, resolveNodeFill(step, nodeId));
}

function renderGraph(step: GraphStep | null) {
  if (!svgRef.value) {
    return;
  }

  const nodes = step?.nodes ?? [];
  const edges = step?.edges ?? [];

  const svg = d3.select(svgRef.value);
  svg.attr('viewBox', `0 0 ${GRAPH_VIEWBOX.width} ${GRAPH_VIEWBOX.height}`);

  const root = svg
    .selectAll<SVGGElement, null>('g.graph-root')
    .data([null])
    .join('g')
    .attr('class', 'graph-root')
    .attr('transform', pan.transform.value);

  const transition = d3.transition().duration(GRAPH_ANIMATION_DURATION).ease(d3.easeCubicOut);

  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  const edgeLayer = root
    .selectAll<SVGGElement, null>('g.graph-edges')
    .data([null])
    .join('g')
    .attr('class', 'graph-edges');

  const edgeSelection = edgeLayer
    .selectAll<SVGLineElement, GraphEdge>('line.edge')
    .data(edges, edge => getEdgeKey(edge))
    .join(
      enter =>
        enter
          .append('line')
          .attr('class', 'edge')
          .attr('x1', (edge: GraphEdge) => resolveEdgeMidpoint(nodeMap, edge).x)
          .attr('y1', (edge: GraphEdge) => resolveEdgeMidpoint(nodeMap, edge).y)
          .attr('x2', (edge: GraphEdge) => resolveEdgeMidpoint(nodeMap, edge).x)
          .attr('y2', (edge: GraphEdge) => resolveEdgeMidpoint(nodeMap, edge).y)
          .attr('stroke', VISUALIZATION_COLOR_TOKENS.border)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0),
      update => update,
      exit => exit.interrupt().transition(transition).attr('stroke-opacity', 0).remove()
    );

  edgeSelection
    .interrupt()
    .transition(transition)
    .attr('x1', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.source).x)
    .attr('y1', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.source).y)
    .attr('x2', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.target).x)
    .attr('y2', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.target).y)
    .attr('stroke', VISUALIZATION_COLOR_TOKENS.border)
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 1);

  function updateEdgePositions() {
    edgeSelection
      .attr('x1', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.source).x)
      .attr('y1', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.source).y)
      .attr('x2', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.target).x)
      .attr('y2', (edge: GraphEdge) => resolveNodePosition(nodeMap, edge.target).y);
  }

  const nodeLayer = root
    .selectAll<SVGGElement, null>('g.graph-nodes')
    .data([null])
    .join('g')
    .attr('class', 'graph-nodes');

  const nodeGroup = nodeLayer
    .selectAll<SVGGElement, GraphNode>('g.node')
    .data(nodes, (node: GraphNode) => node.id)
    .join(
      enter => {
        const group = enter
          .append('g')
          .attr('class', 'node')
          .attr('transform', (node: GraphNode) => `translate(${node.x}, ${node.y})`)
          .attr('opacity', 0);

        group
          .append('circle')
          .attr('r', 0)
          .attr('fill', (node: GraphNode) =>
            resolveNodeFillColor(svgRef.value as SVGSVGElement, step, node.id)
          )
          .attr('stroke', VISUALIZATION_COLOR_TOKENS.border)
          .attr('stroke-width', 2);

        group
          .append('text')
          .attr('x', 0)
          .attr('y', 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', 14)
          .attr('font-weight', 600)
          .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
          .text((node: GraphNode) => node.id);

        return group;
      },
      update => update,
      exit => {
        exit.select('circle').interrupt().transition(transition).attr('r', 0);

        return exit.interrupt().transition(transition).attr('opacity', 0).remove();
      }
    );

  nodeGroup
    .interrupt()
    .transition(transition)
    .attr('transform', (node: GraphNode) => {
      const position = resolveNodePosition(nodeMap, node.id);
      return `translate(${position.x}, ${position.y})`;
    })
    .attr('opacity', 1);

  nodeGroup
    .select('circle')
    .interrupt()
    .transition(transition)
    .attr('r', GRAPH_NODE_RADIUS)
    .attr('fill', (node: GraphNode) =>
      resolveNodeFillColor(svgRef.value as SVGSVGElement, step, node.id)
    )
    .attr('stroke', VISUALIZATION_COLOR_TOKENS.border)
    .attr('stroke-width', 2);

  nodeGroup
    .select('text')
    .interrupt()
    .transition(transition)
    .attr('x', 0)
    .attr('y', 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 600)
    .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
    .text((node: GraphNode) => node.id);

  if (!isPlaying.value) {
    const dragBehavior = d3
      .drag<SVGGElement, GraphNode>()
      .filter(event => event.button === 0)
      .on('start', function (event, node) {
        event.sourceEvent?.stopPropagation();
        d3.select(this).interrupt();

        if (!draggedNodeOffsets.value.has(node.id)) {
          draggedNodeOffsets.value.set(node.id, { dx: 0, dy: 0 });
        }

        const pointer = resolvePointerGraphPosition(event.sourceEvent);
        const nodePosition = resolveNodePosition(nodeMap, node.id);
        if (pointer) {
          dragGrabOffsets.value.set(node.id, {
            x: pointer.x - nodePosition.x,
            y: pointer.y - nodePosition.y,
          });
        }
      })
      .on('drag', function (event, node) {
        const pointer = resolvePointerGraphPosition(event.sourceEvent);
        if (!pointer) {
          return;
        }

        const grabOffset = dragGrabOffsets.value.get(node.id) ?? { x: 0, y: 0 };
        const nextOffset = clampNodePosition(
          node,
          pointer.x - grabOffset.x - node.x,
          pointer.y - grabOffset.y - node.y
        );
        draggedNodeOffsets.value.set(node.id, nextOffset);

        const position = resolveNodePosition(nodeMap, node.id);
        d3.select(this).attr('transform', `translate(${position.x}, ${position.y})`);
        updateEdgePositions();
      })
      .on('end', (_, node) => {
        dragGrabOffsets.value.delete(node.id);
      });

    nodeGroup.call(dragBehavior);
  } else {
    nodeGroup.on('.drag', null);
  }
}

function centerGraph(step: GraphStep | null) {
  if (!step || step.nodes.length === 0) {
    return;
  }
  pan.centerContent(GRAPH_VIEWBOX.width, GRAPH_VIEWBOX.height, getNodeBounds(step.nodes));
}

function handlePanPointerDown(event: PointerEvent) {
  const target = event.target;
  if (target instanceof Element && target.closest('g.node')) {
    return;
  }

  pan.onPointerDown(event);
}

onMounted(() => {
  lastGraphSignature.value = createGraphSignature(props.step);
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
    const nextSignature = createGraphSignature(step);
    if (lastGraphSignature.value !== nextSignature) {
      clearDraggedNodeOffsets();
      lastGraphSignature.value = nextSignature;
    }

    renderGraph(step);
  },
  { deep: true }
);

watch(
  () => props.algorithmKey,
  () => {
    clearDraggedNodeOffsets();
    lastGraphSignature.value = createGraphSignature(props.step);
    centerGraph(props.step);
    renderGraph(props.step);
  }
);
</script>

<template>
  <div class="h-full w-full" @pointerdown="handlePanPointerDown">
    <svg ref="svgRef" class="h-full w-full cursor-grab active:cursor-grabbing" />
  </div>
</template>
