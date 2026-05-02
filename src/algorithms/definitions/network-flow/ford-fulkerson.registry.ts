import { getNetworkFlowInput } from '@/algorithms/shared/inputs';
import type {
  AlgorithmDefinition,
  AlgorithmStep,
  NetworkFlowEdge,
  NetworkFlowHighlightKind,
  NetworkFlowStep,
} from '@/types/algorithm';

interface FlowEdge {
  source: string;
  target: string;
  capacity: number;
  flow: number;
}

function buildFordFulkersonSteps(): AlgorithmStep[] {
  const input = getNetworkFlowInput();
  const { nodes, source, sink } = input;
  const edges: FlowEdge[] = input.edges.map(e => ({
    source: e.source,
    target: e.target,
    capacity: e.capacity,
    flow: 0,
  }));

  const steps: NetworkFlowStep[] = [];

  function buildAdjacency(): Map<string, { to: string; edgeIndex: number }[]> {
    const adj = new Map<string, { to: string; edgeIndex: number }[]>();
    for (const node of nodes) {
      adj.set(node.id, []);
    }
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i]!;
      adj.get(e.source)!.push({ to: e.target, edgeIndex: i });
      // Reverse edge for residual graph
      adj.get(e.target)!.push({ to: e.source, edgeIndex: i });
    }
    return adj;
  }

  function snapshot(
    description: string,
    augmentingPath: string[] | null,
    highlights: Partial<Record<string, NetworkFlowHighlightKind>>
  ) {
    const totalFlow = edges.filter(e => e.target === sink).reduce((sum, e) => sum + e.flow, 0);

    const stepEdges: NetworkFlowEdge[] = edges.map(e => ({
      source: e.source,
      target: e.target,
      capacity: e.capacity,
      flow: e.flow,
    }));

    steps.push({
      kind: 'network-flow',
      nodes: nodes.map(n => ({ ...n })),
      edges: stepEdges,
      source,
      sink,
      currentFlow: totalFlow,
      maxFlow: null,
      augmentingPath,
      cutEdges: null,
      cutS: null,
      highlights: { ...highlights },
      description,
    });
  }

  snapshot(`初始状态，所有边流量为 0。源点 ${source}，汇点 ${sink}。`, null, {
    [source]: 'current',
    [sink]: 'current',
  });

  let iteration = 0;

  function dfs(
    current: string,
    visited: Set<string>,
    path: string[],
    pathEdgeIndices: number[],
    bottleneck: number
  ): { path: string[]; edgeIndices: number[]; bottleneck: number } | null {
    if (current === sink) {
      return { path: [...path], edgeIndices: [...pathEdgeIndices], bottleneck };
    }

    visited.add(current);
    const adj = buildAdjacency();

    for (const { to, edgeIndex } of adj.get(current) ?? []) {
      if (visited.has(to)) continue;

      const edge = edges[edgeIndex]!;
      const isForward = edge.source === current;
      const residual = isForward ? edge.capacity - edge.flow : edge.flow;

      if (residual <= 0) continue;

      const newBottleneck = Math.min(bottleneck, residual);
      path.push(to);
      pathEdgeIndices.push(edgeIndex);

      const result = dfs(to, visited, path, pathEdgeIndices, newBottleneck);
      if (result) return result;

      path.pop();
      pathEdgeIndices.pop();
    }

    return null;
  }

  while (true) {
    iteration++;
    const result = dfs(source, new Set([source]), [source], [], Infinity);

    if (!result) {
      break;
    }

    const { path, edgeIndices, bottleneck } = result;

    // Show augmenting path
    const pathHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
    for (const nodeId of path) {
      pathHighlights[nodeId] = 'augmenting';
    }
    pathHighlights[source] = 'current';
    pathHighlights[sink] = 'current';

    snapshot(
      `第 ${iteration} 轮：找到增广路径 ${path.join(' → ')}，瓶颈容量 = ${bottleneck}。`,
      path,
      pathHighlights
    );

    // Update flow
    for (const edgeIdx of edgeIndices) {
      const edge = edges[edgeIdx]!;
      const isForward = edge.source === path[edgeIndices.indexOf(edgeIdx)]!;
      if (isForward) {
        edge.flow += bottleneck;
      } else {
        edge.flow -= bottleneck;
      }
    }

    // Show updated flow
    const updatedHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
    for (const edgeIdx of edgeIndices) {
      const edge = edges[edgeIdx]!;
      if (edge.flow >= edge.capacity) {
        updatedHighlights[edge.source] = 'saturated';
      }
    }
    updatedHighlights[source] = 'current';
    updatedHighlights[sink] = 'current';

    const totalFlow = edges.filter(e => e.target === sink).reduce((sum, e) => sum + e.flow, 0);

    snapshot(
      `沿增广路径增加流量 ${bottleneck}，当前总流量 = ${totalFlow}。`,
      null,
      updatedHighlights
    );
  }

  // Find min-cut using BFS on residual graph
  const reachable = new Set<string>();
  const queue = [source];
  reachable.add(source);
  const adj = buildAdjacency();

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const { to, edgeIndex } of adj.get(current) ?? []) {
      if (reachable.has(to)) continue;
      const edge = edges[edgeIndex]!;
      const isForward = edge.source === current;
      const residual = isForward ? edge.capacity - edge.flow : edge.flow;
      if (residual > 0) {
        reachable.add(to);
        queue.push(to);
      }
    }
  }

  const cutEdges: { source: string; target: string }[] = [];
  for (const edge of edges) {
    if (reachable.has(edge.source) && !reachable.has(edge.target)) {
      cutEdges.push({ source: edge.source, target: edge.target });
    }
  }

  const totalFlow = edges.filter(e => e.target === sink).reduce((sum, e) => sum + e.flow, 0);

  const cutHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
  for (const nodeId of reachable) {
    cutHighlights[nodeId] = 'min-cut-s';
  }
  for (const node of nodes) {
    if (!reachable.has(node.id)) {
      cutHighlights[node.id] = 'min-cut-t';
    }
  }

  const finalStepEdges: NetworkFlowEdge[] = edges.map(e => ({
    source: e.source,
    target: e.target,
    capacity: e.capacity,
    flow: e.flow,
  }));

  steps.push({
    kind: 'network-flow',
    nodes: nodes.map(n => ({ ...n })),
    edges: finalStepEdges,
    source,
    sink,
    currentFlow: totalFlow,
    maxFlow: totalFlow,
    augmentingPath: null,
    cutEdges,
    cutS: [...reachable],
    highlights: cutHighlights,
    description: `最大流 = ${totalFlow}。最小割：S = {${[...reachable].join(', ')}}，割边：${cutEdges.map(e => `${e.source}→${e.target}`).join(', ')}。`,
  });

  return steps;
}

export const fordFulkersonRegistry: AlgorithmDefinition = {
  id: 'ford-fulkerson',
  slug: 'ford-fulkerson',
  title: 'Ford-Fulkerson 最大流',
  description: '基于 DFS 的增广路径方法，逐步寻找从源到汇的增广路径并更新流量。',
  categories: ['network-flow'],
  comparisonGroup: 'max-flow',
  visualization: 'network-flow',
  createSteps: () => buildFordFulkersonSteps(),
};
