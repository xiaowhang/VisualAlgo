import * as d3 from 'd3';
import type { GraphEdge, TreeStep } from '@/types/algorithm';
import { resolveCssColorToken } from '@/visualizers/resolveCssColorToken';
import { resolveTreeNodeColor } from '@/visualizers/colorSemantics';

interface TreeRenderContext {
  svgElement: SVGSVGElement;
  step: TreeStep;
  transform: string;
}

export const TREE_NODE_RADIUS = 20;

export function getTreeBounds(nodes: { x: number; y: number }[]) {
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const padding = TREE_NODE_RADIUS + 8;
  return {
    minX: Math.min(...xs) - padding,
    maxX: Math.max(...xs) + padding,
    minY: Math.min(...ys) - padding,
    maxY: Math.max(...ys) + padding,
  };
}

export function renderTree(context: TreeRenderContext): void {
  const { svgElement, step, transform } = context;

  const svg = d3.select(svgElement);
  const nodeMap = new Map(step.nodes.map(n => [n.id, n]));

  svg.selectAll('g.tree-root').remove();

  const rootGroup = svg.append('g').attr('class', 'tree-root');
  rootGroup.attr('transform', transform);

  const edgeGroup = rootGroup.append('g').attr('class', 'tree-edges');

  edgeGroup
    .selectAll('line')
    .data(step.edges)
    .join('line')
    .attr('x1', d => nodeMap.get((d as GraphEdge).source)?.x ?? 0)
    .attr('y1', d => nodeMap.get((d as GraphEdge).source)?.y ?? 0)
    .attr('x2', d => nodeMap.get((d as GraphEdge).target)?.x ?? 0)
    .attr('y2', d => nodeMap.get((d as GraphEdge).target)?.y ?? 0)
    .attr('stroke', resolveCssColorToken(svgElement, 'var(--border)'))
    .attr('stroke-width', 2);

  const nodeGroup = rootGroup.append('g').attr('class', 'tree-nodes');

  const nodeSelection = nodeGroup
    .selectAll('g.tree-node')
    .data(step.nodes, (d: unknown) => (d as { id: string }).id)
    .join('g')
    .attr('class', 'tree-node')
    .attr('transform', d => `translate(${(d as { x: number }).x},${(d as { y: number }).y})`);

  nodeSelection
    .selectAll('circle')
    .data((d: unknown) => [d])
    .join('circle')
    .attr('r', TREE_NODE_RADIUS)
    .attr('fill', d =>
      resolveCssColorToken(svgElement, resolveTreeNodeColor(step, (d as { id: string }).id))
    )
    .attr('stroke', resolveCssColorToken(svgElement, 'var(--border)'))
    .attr('stroke-width', 1.5);

  nodeSelection
    .selectAll('text')
    .data((d: unknown) => [d])
    .join('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', resolveCssColorToken(svgElement, 'var(--foreground)'))
    .attr('font-size', 12)
    .text(d => step.nodeLabels[(d as { id: string }).id] ?? (d as { id: string }).id);
}
