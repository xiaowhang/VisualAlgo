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

function buildEdmondsKarpSteps(): AlgorithmStep[] {
  const input = getNetworkFlowInput();
  const { nodes, source, sink } = input;
  const edges: FlowEdge[] = input.edges.map(e => ({
    source: e.source,
    target: e.target,
    capacity: e.capacity,
    flow: 0,
  }));

  const steps: NetworkFlowStep[] = [];

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

  snapshot(`初始状态，所有边流量为 0。使用 BFS 寻找最短增广路径。`, null, {
    [source]: 'current',
    [sink]: 'current',
  });

  let iteration = 0;

  function bfsAugmentingPath(): {
    path: string[];
    edgeIndices: number[];
    bottleneck: number;
  } | null {
    const adj = new Map<string, { to: string; edgeIndex: number }[]>();
    for (const node of nodes) adj.set(node.id, []);
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i]!;
      adj.get(e.source)!.push({ to: e.target, edgeIndex: i });
      adj.get(e.target)!.push({ to: e.source, edgeIndex: i });
    }

    const visited = new Set<string>([source]);
    const parent = new Map<string, { from: string; edgeIndex: number }>();
    const queue: string[] = [source];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === sink) break;

      for (const { to, edgeIndex } of adj.get(current) ?? []) {
        if (visited.has(to)) continue;
        const edge = edges[edgeIndex]!;
        const isForward = edge.source === current;
        const residual = isForward ? edge.capacity - edge.flow : edge.flow;
        if (residual <= 0) continue;

        visited.add(to);
        parent.set(to, { from: current, edgeIndex });
        queue.push(to);
      }
    }

    if (!parent.has(sink)) return null;

    // Reconstruct path
    const path: string[] = [sink];
    const edgeIndices: number[] = [];
    let current = sink;
    while (current !== source) {
      const p = parent.get(current)!;
      edgeIndices.push(p.edgeIndex);
      path.push(p.from);
      current = p.from;
    }
    path.reverse();
    edgeIndices.reverse();

    // Find bottleneck
    let bottleneck = Infinity;
    for (let i = 0; i < edgeIndices.length; i++) {
      const edge = edges[edgeIndices[i]!]!;
      const isForward = edge.source === path[i]!;
      const residual = isForward ? edge.capacity - edge.flow : edge.flow;
      bottleneck = Math.min(bottleneck, residual);
    }

    return { path, edgeIndices, bottleneck };
  }

  while (true) {
    iteration++;
    const result = bfsAugmentingPath();

    if (!result) break;

    const { path, edgeIndices, bottleneck } = result;

    // Show augmenting path
    const pathHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
    for (const nodeId of path) pathHighlights[nodeId] = 'augmenting';
    pathHighlights[source] = 'current';
    pathHighlights[sink] = 'current';

    snapshot(
      `第 ${iteration} 轮：BFS 找到最短增广路径 ${path.join(' → ')}，瓶颈 = ${bottleneck}。`,
      path,
      pathHighlights
    );

    // Update flow
    for (let i = 0; i < edgeIndices.length; i++) {
      const edge = edges[edgeIndices[i]!]!;
      const isForward = edge.source === path[i]!;
      if (isForward) {
        edge.flow += bottleneck;
      } else {
        edge.flow -= bottleneck;
      }
    }

    const totalFlow = edges.filter(e => e.target === sink).reduce((sum, e) => sum + e.flow, 0);

    const updatedHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
    for (const edgeIdx of edgeIndices) {
      const edge = edges[edgeIdx]!;
      if (edge.flow >= edge.capacity) {
        updatedHighlights[edge.source] = 'saturated';
      }
    }
    updatedHighlights[source] = 'current';
    updatedHighlights[sink] = 'current';

    snapshot(
      `增广路径增加流量 ${bottleneck}，当前总流量 = ${totalFlow}。`,
      null,
      updatedHighlights
    );
  }

  // Find min-cut
  const adj = new Map<string, { to: string; edgeIndex: number }[]>();
  for (const node of nodes) adj.set(node.id, []);
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i]!;
    adj.get(e.source)!.push({ to: e.target, edgeIndex: i });
    adj.get(e.target)!.push({ to: e.source, edgeIndex: i });
  }

  const reachable = new Set<string>();
  const queue = [source];
  reachable.add(source);
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
  for (const nodeId of reachable) cutHighlights[nodeId] = 'min-cut-s';
  for (const node of nodes) {
    if (!reachable.has(node.id)) cutHighlights[node.id] = 'min-cut-t';
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

export const edmondsKarpRegistry: AlgorithmDefinition = {
  id: 'edmonds-karp',
  slug: 'edmonds-karp',
  title: 'Edmonds-Karp 最大流',
  description: 'Ford-Fulkerson 的 BFS 变体，每次用 BFS 寻找最短增广路径。',
  categories: ['network-flow'],
  comparisonGroup: 'max-flow',
  visualization: 'network-flow',
  createSteps: () => buildEdmondsKarpSteps(),
};
