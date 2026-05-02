import * as d3 from 'd3';
import type { DecisionTreeStep } from '@/types/algorithm';
import { resolveDecisionTreeNodeColor, VISUALIZATION_COLOR_TOKENS } from './colorSemantics';
import { resolveCssColorToken } from './resolveCssColorToken';

interface DecisionTreeRenderContext {
  svgElement: SVGSVGElement;
  step: DecisionTreeStep;
  transform: string;
}

const NODE_RADIUS = 22;

export function getDecisionTreeBounds(step: DecisionTreeStep) {
  if (step.nodes.length === 0) {
    return { minX: -100, maxX: 100, minY: -50, maxY: 50 };
  }
  const xs = step.nodes.map(n => n.x);
  const ys = step.nodes.map(n => n.y);
  const padding = NODE_RADIUS + 30;
  return {
    minX: Math.min(...xs) - padding,
    maxX: Math.max(...xs) + padding,
    minY: Math.min(...ys) - padding,
    maxY: Math.max(...ys) + padding + 20,
  };
}

export function renderDecisionTree(context: DecisionTreeRenderContext): void {
  const { svgElement, step, transform } = context;
  const svg = d3.select(svgElement);

  svg.selectAll('g.decision-tree-root').remove();
  const root = svg.append('g').attr('class', 'decision-tree-root');
  root.attr('transform', transform);

  const nodeMap = new Map(step.nodes.map(n => [n.id, n]));
  const textColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.text);
  const idleColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.idle);
  const borderColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.border);

  // Draw edges
  const edgeGroup = root.append('g').attr('class', 'decision-tree-edges');
  for (const edge of step.edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) continue;

    edgeGroup
      .append('line')
      .attr('x1', source.x)
      .attr('y1', source.y)
      .attr('x2', target.x)
      .attr('y2', target.y)
      .attr('stroke', idleColor)
      .attr('stroke-width', 1.5);
  }

  // Draw nodes
  const nodeGroup = root.append('g').attr('class', 'decision-tree-nodes');
  for (const node of step.nodes) {
    const isCurrent = step.current === node.id;
    const color = resolveCssColorToken(svgElement, resolveDecisionTreeNodeColor(step, node.id));

    const g = nodeGroup.append('g').attr('transform', `translate(${node.x},${node.y})`);

    g.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', color)
      .attr('stroke', isCurrent ? textColor : borderColor)
      .attr('stroke-width', isCurrent ? 2.5 : 1.5);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('fill', textColor)
      .attr('font-size', 10)
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .style('user-select', 'none')
      .text(node.label);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', textColor)
      .attr('font-size', 9)
      .attr('pointer-events', 'none')
      .style('user-select', 'none')
      .text(`剩${node.remaining}`);
  }

  // Legend
  const legendY = (getDecisionTreeBounds(step).maxY ?? 100) + 10;
  const legendItems = [
    { label: '当前', kind: 'current' as const },
    { label: '考虑中', kind: 'considering' as const },
    { label: '已选', kind: 'selected' as const },
    { label: '剪枝', kind: 'pruned' as const },
    { label: '解', kind: 'solution' as const },
  ];

  const legendGroup = root.append('g').attr('class', 'decision-tree-legend');
  const startX = -(legendItems.length * 80) / 2;

  for (let i = 0; i < legendItems.length; i++) {
    const item = legendItems[i]!;
    const x = startX + i * 80;

    legendGroup
      .append('circle')
      .attr('cx', x)
      .attr('cy', legendY)
      .attr('r', 6)
      .attr(
        'fill',
        resolveCssColorToken(
          svgElement,
          resolveDecisionTreeNodeColor(step, `__legend_${item.kind}`)
        )
      );

    legendGroup
      .append('text')
      .attr('x', x + 12)
      .attr('y', legendY + 4)
      .attr('fill', textColor)
      .attr('font-size', 11)
      .text(item.label);
  }
}
