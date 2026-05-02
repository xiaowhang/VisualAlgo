import * as d3 from 'd3';
import type { HuffmanNode, HuffmanStep } from '@/types/algorithm';
import { resolveCssColorToken } from '@/visualizers/resolveCssColorToken';
import { resolveHuffmanNodeColor, VISUALIZATION_COLOR_TOKENS } from '@/visualizers/colorSemantics';

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 70;
const MIN_NODE_SPACING = 56;

interface TreeLayoutNode extends HuffmanNode {
  layoutX: number;
  layoutY: number;
}

export function getHuffmanTreeBounds(step: HuffmanStep): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (step.nodes.length === 0) {
    return { minX: 0, maxX: 760, minY: 0, maxY: 400 };
  }

  const positions = computeLayout(step);
  const xs = positions.map(p => p.layoutX);
  const ys = positions.map(p => p.layoutY);
  const padding = NODE_RADIUS + 16;

  return {
    minX: Math.min(...xs) - padding,
    maxX: Math.max(...xs) + padding,
    minY: Math.min(...ys) - padding,
    maxY: Math.max(...ys) + padding + 60,
  };
}

function computeLayout(step: HuffmanStep): TreeLayoutNode[] {
  const nodeMap = new Map(step.nodes.map(n => [n.id, { ...n }]));
  const positions: TreeLayoutNode[] = [];

  // Find root (node that is not a child of any other node)
  const childIds = new Set<string>();
  for (const node of step.nodes) {
    if (node.left) childIds.add(node.left);
    if (node.right) childIds.add(node.right);
  }

  const roots = step.nodes.filter(n => !childIds.has(n.id));
  const root = roots[roots.length - 1] ?? step.nodes[step.nodes.length - 1];

  if (!root) return positions;

  // Compute subtree widths recursively
  const widthCache = new Map<string, number>();

  function subtreeWidth(nodeId: string): number {
    if (widthCache.has(nodeId)) return widthCache.get(nodeId)!;
    const node = nodeMap.get(nodeId);
    if (!node || (!node.left && !node.right)) {
      widthCache.set(nodeId, MIN_NODE_SPACING);
      return MIN_NODE_SPACING;
    }
    const leftW = node.left ? subtreeWidth(node.left) : 0;
    const rightW = node.right ? subtreeWidth(node.right) : 0;
    const w = leftW + rightW;
    widthCache.set(nodeId, Math.max(w, MIN_NODE_SPACING));
    return widthCache.get(nodeId)!;
  }

  function assignPositions(nodeId: string, centerX: number, depth: number) {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    positions.push({
      ...node,
      layoutX: centerX,
      layoutY: depth * LEVEL_HEIGHT + NODE_RADIUS + 10,
    });

    const leftW = node.left ? subtreeWidth(node.left) : 0;
    const rightW = node.right ? subtreeWidth(node.right) : 0;
    const totalW = leftW + rightW;

    if (node.left) {
      assignPositions(node.left, centerX - totalW / 2 + leftW / 2, depth + 1);
    }
    if (node.right) {
      assignPositions(node.right, centerX + totalW / 2 - rightW / 2, depth + 1);
    }
  }

  subtreeWidth(root.id);
  assignPositions(root.id, 380, 0);

  return positions;
}

export function renderHuffmanTree(context: {
  svgElement: SVGSVGElement;
  step: HuffmanStep;
  transform: string;
}): void {
  const { svgElement, step, transform } = context;
  const svg = d3.select(svgElement);

  svg.selectAll('g.huffman-root').remove();

  const layoutNodes = computeLayout(step);
  const layoutMap = new Map(layoutNodes.map(n => [n.id, n]));
  const nodeMap = new Map(step.nodes.map(n => [n.id, n]));

  const rootGroup = svg.append('g').attr('class', 'huffman-root');
  rootGroup.attr('transform', transform);

  const edgeGroup = rootGroup.append('g').attr('class', 'huffman-edges');
  const isMerging = step.merged !== null;

  // Draw edges
  edgeGroup
    .selectAll('line')
    .data(step.edges)
    .join('line')
    .attr('x1', d => layoutMap.get(d.source)?.layoutX ?? 0)
    .attr('y1', d => layoutMap.get(d.source)?.layoutY ?? 0)
    .attr('x2', d => layoutMap.get(d.target)?.layoutX ?? 0)
    .attr('y2', d => layoutMap.get(d.target)?.layoutY ?? 0)
    .attr('stroke', d => {
      if (
        isMerging &&
        step.merged &&
        (d.target === step.merged[0] || d.target === step.merged[1])
      ) {
        return resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.compare);
      }
      return resolveCssColorToken(svgElement, 'var(--border)');
    })
    .attr('stroke-width', d => {
      if (
        isMerging &&
        step.merged &&
        (d.target === step.merged[0] || d.target === step.merged[1])
      ) {
        return 3;
      }
      return 2;
    });

  // Draw edge labels (0 for left, 1 for right)
  const parentMap = new Map<string, { parentId: string; side: 'left' | 'right' }>();
  for (const node of step.nodes) {
    if (node.left) parentMap.set(node.left, { parentId: node.id, side: 'left' });
    if (node.right) parentMap.set(node.right, { parentId: node.id, side: 'right' });
  }

  edgeGroup
    .selectAll('text.edge-label')
    .data(step.edges.filter(e => parentMap.has(e.target)))
    .join('text')
    .attr('class', 'edge-label')
    .attr('x', d => {
      const src = layoutMap.get(d.source);
      const tgt = layoutMap.get(d.target);
      return ((src?.layoutX ?? 0) + (tgt?.layoutX ?? 0)) / 2 - 10;
    })
    .attr('y', d => {
      const src = layoutMap.get(d.source);
      const tgt = layoutMap.get(d.target);
      return ((src?.layoutY ?? 0) + (tgt?.layoutY ?? 0)) / 2;
    })
    .attr('text-anchor', 'middle')
    .attr('fill', resolveCssColorToken(svgElement, 'var(--muted-foreground)'))
    .attr('font-size', 11)
    .attr('font-weight', 600)
    .text(d => (parentMap.get(d.target)?.side === 'left' ? '0' : '1'));

  // Draw nodes
  const nodeGroup = rootGroup.append('g').attr('class', 'huffman-nodes');

  const nodeSelection = nodeGroup
    .selectAll('g.huffman-node')
    .data(layoutNodes, (d: unknown) => (d as TreeLayoutNode).id)
    .join('g')
    .attr('class', 'huffman-node')
    .attr('transform', d => `translate(${d.layoutX},${d.layoutY})`);

  // Leaf nodes: rounded rect with char; internal nodes: circle with weight
  nodeSelection.each(function (d: unknown) {
    const node = d as TreeLayoutNode;
    const g = d3.select(this);
    const color = resolveCssColorToken(svgElement, resolveHuffmanNodeColor(step, node.id));
    const borderColor = resolveCssColorToken(svgElement, 'var(--border)');
    const textColor = resolveCssColorToken(svgElement, 'var(--foreground)');
    const mutedColor = resolveCssColorToken(svgElement, 'var(--muted-foreground)');

    if (node.char) {
      // Leaf node: rounded rectangle
      g.selectAll('rect')
        .data([node])
        .join('rect')
        .attr('x', -NODE_RADIUS)
        .attr('y', -NODE_RADIUS * 0.8)
        .attr('width', NODE_RADIUS * 2)
        .attr('height', NODE_RADIUS * 1.6)
        .attr('rx', 6)
        .attr('fill', color)
        .attr('stroke', borderColor)
        .attr('stroke-width', 1.5);

      g.selectAll('text.char-label')
        .data([node])
        .join('text')
        .attr('class', 'char-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.1em')
        .attr('fill', textColor)
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .text(`'${node.char}'`);

      g.selectAll('text.weight-label')
        .data([node])
        .join('text')
        .attr('class', 'weight-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('fill', mutedColor)
        .attr('font-size', 10)
        .text(node.weight);
    } else {
      // Internal node: circle
      g.selectAll('circle')
        .data([node])
        .join('circle')
        .attr('r', NODE_RADIUS * 0.7)
        .attr('fill', color)
        .attr('stroke', borderColor)
        .attr('stroke-width', 1.5);

      g.selectAll('text.weight-label')
        .data([node])
        .join('text')
        .attr('class', 'weight-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', textColor)
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .text(node.weight);
    }
  });

  // Draw queue at the bottom
  if (step.queue.length > 0) {
    const queueY = (Math.max(...layoutNodes.map(n => n.layoutY)) || 0) + NODE_RADIUS + 50;
    const queueGroup = rootGroup.append('g').attr('class', 'huffman-queue');

    queueGroup
      .append('text')
      .attr('x', 20)
      .attr('y', queueY)
      .attr('fill', resolveCssColorToken(svgElement, 'var(--muted-foreground)'))
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text('优先队列：');

    const queueNodes = step.queue.map(id => nodeMap.get(id)).filter(Boolean) as HuffmanNode[];

    const sortedQueue = [...queueNodes].sort((a, b) => a.weight - b.weight);

    queueGroup
      .selectAll('text.queue-item')
      .data(sortedQueue)
      .join('text')
      .attr('class', 'queue-item')
      .attr('x', (_, i) => 100 + i * 60)
      .attr('y', queueY)
      .attr('text-anchor', 'middle')
      .attr('fill', resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.frontier))
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text(d => `${d.char ?? '*'}(${d.weight})`);
  }
}
