import { createDijkstraStep } from '@/algorithms/shared/greedy/createDijkstraStep';
import { getDijkstraInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep } from '@/types/algorithm';

function buildDijkstraSteps(
  graph: {
    nodes: { id: string; x: number; y: number }[];
    edges: { source: string; target: string; weight?: number }[];
    adjacencyList: Map<string, string[]>;
  },
  startNode: string
): AlgorithmStep[] {
  const { adjacencyList } = graph;

  const edgeWeightMap = new Map<string, number>();
  for (const edge of graph.edges) {
    const key = `${edge.source}->${edge.target}`;
    const reverseKey = `${edge.target}->${edge.source}`;
    const w = edge.weight ?? 1;
    edgeWeightMap.set(key, w);
    edgeWeightMap.set(reverseKey, w);
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  const frontier: string[] = [startNode];

  for (const node of graph.nodes) {
    dist.set(node.id, node.id === startNode ? 0 : Infinity);
    prev.set(node.id, null);
  }

  function buildLabels(): Partial<Record<string, string>> {
    const labels: Partial<Record<string, string>> = {};
    for (const node of graph.nodes) {
      const d = dist.get(node.id) ?? Infinity;
      if (d === Infinity) {
        labels[node.id] = '∞';
      } else {
        labels[node.id] = String(d);
      }
    }
    return labels;
  }

  const steps: AlgorithmStep[] = [
    createDijkstraStep(
      graph,
      null,
      visited,
      frontier,
      [],
      `初始化：起点 ${startNode} 距离 = 0，其余为 ∞`,
      buildLabels()
    ),
  ];

  while (frontier.length > 0) {
    // Pick node with smallest distance from frontier
    frontier.sort((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity));
    const current = frontier.shift()!;

    if (visited.has(current)) continue;

    visited.add(current);

    steps.push(
      createDijkstraStep(
        graph,
        current,
        visited,
        frontier,
        [...visited],
        `访问节点 ${current}（距离 = ${dist.get(current)}）`,
        buildLabels()
      )
    );

    const neighbors = adjacencyList.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;

      const edgeKey = `${current}->${neighbor}`;
      const weight = edgeWeightMap.get(edgeKey) ?? 1;
      const newDist = (dist.get(current) ?? Infinity) + weight;
      const oldDist = dist.get(neighbor) ?? Infinity;

      if (newDist < oldDist) {
        dist.set(neighbor, newDist);
        prev.set(neighbor, current);
        if (!frontier.includes(neighbor)) {
          frontier.push(neighbor);
        }
        steps.push(
          createDijkstraStep(
            graph,
            current,
            visited,
            frontier,
            [...visited],
            `松弛：${current} → ${neighbor}，距离 ${oldDist === Infinity ? '∞' : oldDist} → ${newDist}`,
            buildLabels()
          )
        );
      }
    }
  }

  // Build shortest path from start to the farthest reachable node
  let farthestNode = startNode;
  let maxDist = 0;
  for (const node of graph.nodes) {
    const d = dist.get(node.id) ?? Infinity;
    if (d !== Infinity && d > maxDist) {
      maxDist = d;
      farthestNode = node.id;
    }
  }

  const pathNodes: string[] = [];
  let cur: string | null = farthestNode;
  while (cur !== null) {
    pathNodes.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  steps.push(
    createDijkstraStep(
      graph,
      null,
      visited,
      [],
      [...visited],
      `完成！最短路径树已确定。从 ${startNode} 到 ${farthestNode} 的最短路径：${pathNodes.join(' → ')}（距离 = ${maxDist}）`,
      buildLabels()
    )
  );

  return steps;
}

export const dijkstraRegistry: AlgorithmDefinition = {
  id: 'dijkstra',
  slug: 'dijkstra',
  title: 'Dijkstra 最短路径',
  description: '贪心策略求解单源最短路径，每次选择距离最小的未访问节点。',
  categories: ['greedy', 'graphs'],
  visualization: 'graph',
  createSteps: () => {
    const input = getDijkstraInput();
    return buildDijkstraSteps(input.graph, input.startNode);
  },
};
