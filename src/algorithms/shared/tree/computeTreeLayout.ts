import * as d3 from 'd3';
import type { GraphEdge, GraphNode } from '@/types/algorithm';

interface TreeLayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
}

interface HierarchyDatum {
  id: string;
  children?: HierarchyDatum[];
}

export function computeTreeLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: TreeLayoutOptions = {}
): GraphNode[] {
  const { nodeWidth = 72, nodeHeight = 72 } = options;

  if (nodes.length === 0) {
    return [];
  }

  const childrenMap = new Map<string, string[]>();
  for (const edge of edges) {
    const children = childrenMap.get(edge.source) ?? [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  }

  const rootId = nodes[0].id;

  function buildHierarchyNode(id: string): HierarchyDatum {
    const childIds = childrenMap.get(id) ?? [];
    return {
      id,
      children:
        childIds.length > 0 ? childIds.map(childId => buildHierarchyNode(childId)) : undefined,
    };
  }

  const root = d3.hierarchy<HierarchyDatum>(buildHierarchyNode(rootId));

  const layout = d3
    .tree<HierarchyDatum>()
    .nodeSize([nodeWidth, nodeHeight])
    .separation(() => 0.7);

  const laidOut = layout(root);

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  const positionMap = new Map<string, { x: number; y: number }>();
  for (const desc of laidOut.descendants()) {
    if (desc.x < minX) minX = desc.x;
    if (desc.x > maxX) maxX = desc.x;
    positionMap.set(desc.data.id, { x: desc.x, y: desc.y });
  }

  const centerX = (minX + maxX) / 2;

  return nodes.map(node => {
    const pos = positionMap.get(node.id);
    return {
      ...node,
      x: pos ? Math.round((pos.x - centerX) * 100) / 100 : node.x,
      y: pos ? Math.round(pos.y * 100) / 100 : node.y,
    };
  });
}
