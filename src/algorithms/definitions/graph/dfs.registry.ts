import { createGraphStep } from '@/algorithms/shared/graph/createGraphStep';
import { getGraphSnapshot, getGraphStartNode } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildDfsSteps(startNode = 'A'): AlgorithmStep[] {
  const graph = getGraphSnapshot();
  const adjacencyList = graph.adjacencyList;
  const visited = new Set<string>();
  const stack: string[] = [startNode];
  const order: string[] = [];
  const steps: AlgorithmStep[] = [
    createGraphStep(graph, null, visited, stack, order, `初始化栈：${startNode}`),
  ];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    order.push(current);
    steps.push(createGraphStep(graph, current, visited, stack, order, `访问节点 ${current}`));

    const neighbors = (adjacencyList.get(current) ?? []).toReversed();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && !stack.includes(neighbor)) {
        stack.push(neighbor);
      }
    }

    steps.push(
      createGraphStep(graph, current, visited, stack, order, `深入 ${current} 的邻接节点`)
    );
  }

  steps.push(createGraphStep(graph, null, visited, [], order, '遍历完成'));
  return steps;
}

export const dfsRegistry: AlgorithmDefinition = {
  id: 'dfs',
  slug: 'dfs',
  title: '深度优先搜索（DFS）',
  description: '以栈/递归为核心沿路径深入访问图节点。',
  categories: ['graphs'],
  visualization: 'graph',
  createSteps: () => buildDfsSteps(getGraphStartNode()),
};
