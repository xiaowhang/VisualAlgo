import * as d3 from 'd3';
import type { NetworkFlowStep } from '@/types/algorithm';
import { resolveCssColorToken } from './resolveCssColorToken';
import {
  resolveNetworkFlowNodeColor,
  resolveNetworkFlowEdgeColor,
  VISUALIZATION_COLOR_TOKENS,
} from './colorSemantics';

export interface NetworkFlowRenderContext {
  svgElement: SVGSVGElement;
  step: NetworkFlowStep;
  transform: string;
  draggedNodeOffsets?: Map<string, { dx: number; dy: number }>;
}

const NODE_RADIUS = 24;
const MARGIN = 50;

export function getNetworkFlowBounds(step: NetworkFlowStep) {
  const xs = step.nodes.map(n => n.x);
  const ys = step.nodes.map(n => n.y);
  return {
    minX: Math.min(...xs) - MARGIN,
    maxX: Math.max(...xs) + MARGIN,
    minY: Math.min(...ys) - MARGIN,
    maxY: Math.max(...ys) + MARGIN + 30,
  };
}

export function renderNetworkFlow(context: NetworkFlowRenderContext): void {
  const { svgElement, step, transform, draggedNodeOffsets } = context;
  const svg = d3.select(svgElement);

  svg.selectAll('g.nf-root').remove();
  const root = svg.append('g').attr('class', 'nf-root');
  root.attr('transform', transform);

  const nodeMap = new Map(step.nodes.map(n => [n.id, n]));
  const textColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.text);
  const borderColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.border);

  function resolvePos(nodeId: string) {
    const node = nodeMap.get(nodeId);
    const offset = draggedNodeOffsets?.get(nodeId);
    return {
      x: (node?.x ?? 0) + (offset?.dx ?? 0),
      y: (node?.y ?? 0) + (offset?.dy ?? 0),
    };
  }

  // Arrow marker
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  d3.select(defs.node()!).selectAll('marker').remove();

  defs
    .append('marker')
    .attr('id', 'nf-arrow')
    .attr('viewBox', '0 0 10 7')
    .attr('refX', 10)
    .attr('refY', 3.5)
    .attr('markerWidth', 8)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('polygon')
    .attr('points', '0 0, 10 3.5, 0 7')
    .attr('fill', borderColor);

  defs
    .append('marker')
    .attr('id', 'nf-arrow-augment')
    .attr('viewBox', '0 0 10 7')
    .attr('refX', 10)
    .attr('refY', 3.5)
    .attr('markerWidth', 8)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('polygon')
    .attr('points', '0 0, 10 3.5, 0 7')
    .attr('fill', resolveCssColorToken(svgElement, 'var(--chart-4)'));

  // Edge layer
  const edgeLayer = root.append('g').attr('class', 'nf-edges');

  // Draw edges as straight lines (same as graph algorithms)
  for (const edge of step.edges) {
    const source = resolvePos(edge.source);
    const target = resolvePos(edge.target);

    // Shorten edge to stop at node boundary
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const x1 = source.x + ux * NODE_RADIUS;
    const y1 = source.y + uy * NODE_RADIUS;
    const x2 = target.x - ux * NODE_RADIUS;
    const y2 = target.y - uy * NODE_RADIUS;

    const edgeKey = `${edge.source}->${edge.target}`;
    const edgeColor = resolveCssColorToken(svgElement, resolveNetworkFlowEdgeColor(step, edgeKey));
    const isAugmenting = step.augmentingPath && isEdgeOnPath(edge, step.augmentingPath);
    const isSaturated = edge.flow >= edge.capacity;

    edgeLayer
      .append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('stroke', edgeColor)
      .attr('stroke-width', isAugmenting ? 3 : 2)
      .attr('stroke-dasharray', isSaturated && !isAugmenting ? '6,3' : 'none')
      .attr('marker-end', isAugmenting ? 'url(#nf-arrow-augment)' : 'url(#nf-arrow)');

    // Edge label: flow/capacity at midpoint
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    edgeLayer
      .append('text')
      .attr('x', midX - uy * 12)
      .attr('y', midY + ux * 12)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .attr('fill', edge.flow > 0 ? edgeColor : textColor)
      .text(`${edge.flow}/${edge.capacity}`);
  }

  // Cut edges (dashed red)
  if (step.cutEdges) {
    for (const cutEdge of step.cutEdges) {
      const source = resolvePos(cutEdge.source);
      const target = resolvePos(cutEdge.target);

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      edgeLayer
        .append('line')
        .attr('x1', source.x + ux * NODE_RADIUS)
        .attr('y1', source.y + uy * NODE_RADIUS)
        .attr('x2', target.x - ux * NODE_RADIUS)
        .attr('y2', target.y - uy * NODE_RADIUS)
        .attr('stroke', resolveCssColorToken(svgElement, 'var(--destructive)'))
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4')
        .attr('marker-end', 'url(#nf-arrow)');
    }
  }

  // Node layer
  const nodeLayer = root.append('g').attr('class', 'nf-nodes');

  for (const node of step.nodes) {
    const pos = resolvePos(node.id);
    const g = nodeLayer.append('g').attr('transform', `translate(${pos.x}, ${pos.y})`);

    const nodeColor = resolveCssColorToken(svgElement, resolveNetworkFlowNodeColor(step, node.id));

    g.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', nodeColor)
      .attr('stroke', borderColor)
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', 0)
      .attr('y', 1)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 14)
      .attr('font-weight', 700)
      .attr('fill', textColor)
      .text(node.id);

    // Source/Sink labels
    if (node.id === step.source) {
      g.append('text')
        .attr('x', 0)
        .attr('y', -NODE_RADIUS - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', 600)
        .attr('fill', textColor)
        .text('源点');
    } else if (node.id === step.sink) {
      g.append('text')
        .attr('x', 0)
        .attr('y', -NODE_RADIUS - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', 600)
        .attr('fill', textColor)
        .text('汇点');
    }
  }

  // Flow value display
  const bounds = getNetworkFlowBounds(step);
  root
    .append('text')
    .attr('x', (bounds.minX + bounds.maxX) / 2)
    .attr('y', bounds.maxY - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 700)
    .attr('fill', textColor)
    .text(step.maxFlow != null ? `最大流 = ${step.maxFlow}` : `当前流量 = ${step.currentFlow}`);
}

function isEdgeOnPath(edge: { source: string; target: string }, path: string[]): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i] === edge.source && path[i + 1] === edge.target) return true;
    if (path[i] === edge.target && path[i + 1] === edge.source) return true;
  }
  return false;
}
