import { createGraphStep } from '@/algorithms/shared/graph/createGraphStep';
import { getGraphSnapshot, getGraphStartNode } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildBfsSteps(startNode = 'A'): AlgorithmStep[] {
  const graph = getGraphSnapshot();
  const adjacencyList = graph.adjacencyList;
  const visited = new Set<string>();
  const queue: string[] = [startNode];
  const order: string[] = [];
  const steps: AlgorithmStep[] = [
    createGraphStep(graph, null, visited, queue, order, `初始化队列：${startNode}`),
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    order.push(current);
    steps.push(createGraphStep(graph, current, visited, queue, order, `访问节点 ${current}`));

    const neighbors = adjacencyList.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && !queue.includes(neighbor)) {
        queue.push(neighbor);
      }
    }

    steps.push(
      createGraphStep(graph, current, visited, queue, order, `拓展 ${current} 的邻接节点`)
    );
  }

  steps.push(createGraphStep(graph, null, visited, [], order, '遍历完成'));
  return steps;
}

export const bfsRegistry: AlgorithmDefinition = {
  id: 'bfs',
  slug: 'bfs',
  title: '广度优先搜索（BFS）',
  description: '以队列为核心按层访问图节点。',
  categories: ['graphs'],
  comparisonGroup: 'graph-traversal',
  visualization: 'graph',
  createSteps: () => buildBfsSteps(getGraphStartNode()),
};
