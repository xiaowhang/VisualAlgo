import { createTreeStep } from '@/algorithms/shared/tree/createTreeStep';
import { computeTreeLayout } from '@/algorithms/shared/tree/computeTreeLayout';
import { getTreeSnapshot, getTreeTargetValue } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep, GraphEdge, GraphNode } from '@/types/algorithm';

function buildChildrenMap(edges: GraphEdge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const edge of edges) {
    const children = map.get(edge.source) ?? [];
    children.push(edge.target);
    map.set(edge.source, children);
  }
  return map;
}

function buildBSTSearchSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  target: string
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];

  const childrenMap = buildChildrenMap(edges);

  const parentMap = new Map<string, string>();
  for (const edge of edges) {
    parentMap.set(edge.target, edge.source);
  }

  const rootCandidate = nodes.find(n => !parentMap.has(n.id));
  const rootId = rootCandidate?.id ?? nodes[0]?.id;
  if (!rootId) {
    return steps;
  }

  const laidOutNodes = computeTreeLayout(nodes, edges);
  const nodeLabels: Partial<Record<string, string>> = {};
  for (const node of nodes) {
    nodeLabels[node.id] = node.id;
  }

  steps.push(
    createTreeStep({
      nodes: laidOutNodes,
      edges,
      nodeLabels,
      description: `开始查找目标值 ${target}`,
      currentIndices: [rootId],
    })
  );

  let current = rootId;

  while (current) {
    const comparison = target.localeCompare(current);

    if (comparison === 0) {
      steps.push(
        createTreeStep({
          nodes: laidOutNodes,
          edges,
          nodeLabels,
          description: `找到目标值 ${target}！当前节点 ${current} 等于目标值`,
          currentIndices: [current],
          doneIndices: [current],
        })
      );
      return steps;
    }

    const childNodes = childrenMap.get(current) ?? [];
    const leftChild = childNodes[0];
    const rightChild = childNodes[1];

    if (comparison < 0 && leftChild) {
      steps.push(
        createTreeStep({
          nodes: laidOutNodes,
          edges,
          nodeLabels,
          description: `${target} < ${current}，向左子节点 ${leftChild} 移动`,
          currentIndices: [current],
          compareIndices: [current, leftChild],
          visitedIndices: [current],
        })
      );
      current = leftChild;
    } else if (comparison > 0 && rightChild) {
      steps.push(
        createTreeStep({
          nodes: laidOutNodes,
          edges,
          nodeLabels,
          description: `${target} > ${current}，向右子节点 ${rightChild} 移动`,
          currentIndices: [current],
          compareIndices: [current, rightChild],
          visitedIndices: [current],
        })
      );
      current = rightChild;
    } else {
      steps.push(
        createTreeStep({
          nodes: laidOutNodes,
          edges,
          nodeLabels,
          description: `目标值 ${target} 不存在于树中（节点 ${current} 无对应子节点）`,
          currentIndices: [current],
          visitedIndices: [current],
        })
      );
      return steps;
    }
  }

  return steps;
}

export const bstSearchRegistry: AlgorithmDefinition = {
  id: 'bst-search',
  slug: 'bst-search',
  title: 'BST 查找',
  description: '在二叉搜索树中按照大小比较逐层查找目标值。',
  category: 'trees',
  visualization: 'tree',
  createSteps: () => {
    const { nodes, edges } = getTreeSnapshot();
    const target = getTreeTargetValue();
    return buildBSTSearchSteps(nodes, edges, target);
  },
};
