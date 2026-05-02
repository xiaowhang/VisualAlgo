import { getSubsetSumInput } from '@/algorithms/shared/inputs';
import type {
  AlgorithmDefinition,
  AlgorithmStep,
  DecisionTreeHighlightKind,
  DecisionTreeNode,
  DecisionTreeStep,
} from '@/types/algorithm';

const NODE_H_SPACING = 120;
const NODE_V_SPACING = 80;

function buildSubsetSumSteps(nums: number[], target: number): AlgorithmStep[] {
  const steps: DecisionTreeStep[] = [];
  const nodes: DecisionTreeNode[] = [];
  const edges: { source: string; target: string }[] = [];
  const solutionPaths: number[][] = [];
  let nodeIdCounter = 0;

  function createNodeId(): string {
    return `n${nodeIdCounter++}`;
  }

  const rootId = createNodeId();
  const rootNode: DecisionTreeNode = {
    id: rootId,
    label: 'start',
    depth: 0,
    remaining: target,
    taken: [],
    x: 0,
    y: 0,
  };
  nodes.push(rootNode);

  function layoutTree() {
    const depthGroups = new Map<number, DecisionTreeNode[]>();
    for (const node of nodes) {
      const group = depthGroups.get(node.depth) ?? [];
      group.push(node);
      depthGroups.set(node.depth, group);
    }

    for (const [depth, group] of depthGroups) {
      const totalWidth = (group.length - 1) * NODE_H_SPACING;
      const startX = -totalWidth / 2;
      for (let i = 0; i < group.length; i++) {
        group[i].x = startX + i * NODE_H_SPACING;
        group[i].y = depth * NODE_V_SPACING;
      }
    }
  }

  function snapshot(
    description: string,
    current: string | null,
    highlights: Partial<Record<string, DecisionTreeHighlightKind>>
  ): void {
    layoutTree();
    steps.push({
      kind: 'decision-tree',
      nodes: nodes.map(n => ({ ...n })),
      edges: [...edges],
      current,
      solutionPaths: solutionPaths.map(p => [...p]),
      highlights: { ...highlights },
      description,
    });
  }

  snapshot(`目标和为 ${target}，从根节点开始探索。`, rootId, { [rootId]: 'current' });

  function backtrack(nodeId: string, index: number, taken: number[], remaining: number) {
    if (remaining === 0) {
      solutionPaths.push([...taken]);
      snapshot(
        `找到一个解：{${taken.join(', ')}}，和为 ${target}。`,
        nodeId,
        buildSolutionHighlight(taken)
      );
      return;
    }

    if (index >= nums.length) {
      return;
    }

    const num = nums[index];

    if (remaining < 0) {
      return;
    }

    // Branch: take nums[index]
    const takeNodeId = createNodeId();
    const takeNode: DecisionTreeNode = {
      id: takeNodeId,
      label: `选${num}`,
      depth: index + 1,
      remaining: remaining - num,
      taken: [...taken, num],
      x: 0,
      y: 0,
    };
    nodes.push(takeNode);
    edges.push({ source: nodeId, target: takeNodeId });

    snapshot(`考虑元素 ${num}：选择它，剩余 ${remaining - num}。`, takeNodeId, {
      [takeNodeId]: 'considering',
      [nodeId]: 'selected',
    });

    if (remaining - num >= 0) {
      backtrack(takeNodeId, index + 1, [...taken, num], remaining - num);
    } else {
      nodes[nodes.length - 1].label = `选${num}(剪枝)`;
      snapshot(`剩余 ${remaining - num} < 0，剪枝。`, takeNodeId, { [takeNodeId]: 'pruned' });
    }

    // Branch: skip nums[index]
    const skipNodeId = createNodeId();
    const skipNode: DecisionTreeNode = {
      id: skipNodeId,
      label: `跳${num}`,
      depth: index + 1,
      remaining,
      taken: [...taken],
      x: 0,
      y: 0,
    };
    nodes.push(skipNode);
    edges.push({ source: nodeId, target: skipNodeId });

    snapshot(`考虑元素 ${num}：跳过它，剩余仍为 ${remaining}。`, skipNodeId, {
      [skipNodeId]: 'considering',
      [nodeId]: 'backtrack',
    });

    backtrack(skipNodeId, index + 1, [...taken], remaining);
  }

  function buildSolutionHighlight(
    taken: number[]
  ): Partial<Record<string, DecisionTreeHighlightKind>> {
    const highlights: Partial<Record<string, DecisionTreeHighlightKind>> = {};
    for (const node of nodes) {
      if (node.remaining === 0 && node.taken.length === taken.length) {
        let isMatch = true;
        for (let i = 0; i < taken.length; i++) {
          if (node.taken[i] !== taken[i]) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          highlights[node.id] = 'solution';
        }
      }
    }
    return highlights;
  }

  backtrack(rootId, 0, [], target);

  if (solutionPaths.length === 0) {
    snapshot(`探索完毕，未找到和为 ${target} 的子集。`, null, {});
  } else {
    const solutionHighlight: Partial<Record<string, DecisionTreeHighlightKind>> = {};
    for (const node of nodes) {
      for (const path of solutionPaths) {
        if (node.remaining === 0) {
          let isSolution = true;
          for (let i = 0; i < node.taken.length; i++) {
            if (node.taken[i] !== path[i]) {
              isSolution = false;
              break;
            }
          }
          if (isSolution) {
            solutionHighlight[node.id] = 'solution';
          }
        }
      }
    }
    snapshot(`搜索完成，共找到 ${solutionPaths.length} 个解。`, null, solutionHighlight);
  }

  return steps;
}

export const subsetSumRegistry: AlgorithmDefinition = {
  id: 'subset-sum',
  slug: 'subset-sum',
  title: '子集和问题',
  description: '给定一组正整数和目标和，找出所有和为目标的子集。',
  category: 'backtracking',
  visualization: 'decision-tree',
  createSteps: () => {
    const { nums, target } = getSubsetSumInput();
    return buildSubsetSumSteps(nums, target);
  },
};
