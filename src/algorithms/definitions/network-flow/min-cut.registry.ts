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

function buildMinCutSteps(): AlgorithmStep[] {
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
    highlights: Partial<Record<string, NetworkFlowHighlightKind>>,
    cutEdges: { source: string; target: string }[] | null = null,
    cutS: string[] | null = null
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
      cutEdges,
      cutS,
      highlights: { ...highlights },
      description,
    });
  }

  snapshot(`初始状态。通过最大流-最小割定理求最小割：先计算最大流。`, null, {
    [source]: 'current',
    [sink]: 'current',
  });

  // Compute max-flow using BFS (Edmonds-Karp)
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

    const pathHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
    for (const nodeId of path) pathHighlights[nodeId] = 'augmenting';
    pathHighlights[source] = 'current';
    pathHighlights[sink] = 'current';

    snapshot(
      `第 ${iteration} 轮：增广路径 ${path.join(' → ')}，流量 += ${bottleneck}。`,
      path,
      pathHighlights
    );

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

    snapshot(`当前总流量 = ${totalFlow}。`, null, {
      [source]: 'current',
      [sink]: 'current',
    });
  }

  // Find min-cut via residual graph BFS
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

  // Show the cut
  const cutHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
  for (const nodeId of reachable) cutHighlights[nodeId] = 'min-cut-s';
  for (const node of nodes) {
    if (!reachable.has(node.id)) cutHighlights[node.id] = 'min-cut-t';
  }

  snapshot(
    `最大流 = ${totalFlow}。在残余图中从 ${source} 可达的节点集合 S = {${[...reachable].join(', ')}}。`,
    null,
    cutHighlights,
    cutEdges,
    [...reachable]
  );

  // Highlight cut edges
  const cutEdgeHighlights: Partial<Record<string, NetworkFlowHighlightKind>> = {};
  for (const nodeId of reachable) cutEdgeHighlights[nodeId] = 'min-cut-s';
  for (const node of nodes) {
    if (!reachable.has(node.id)) cutEdgeHighlights[node.id] = 'min-cut-t';
  }
  for (const ce of cutEdges) {
    cutEdgeHighlights[ce.source] = 'bottleneck';
  }

  const cutCapacity = cutEdges.reduce((sum, ce) => {
    const edge = edges.find(e => e.source === ce.source && e.target === ce.target);
    return sum + (edge?.capacity ?? 0);
  }, 0);

  snapshot(
    `最小割边：${cutEdges.map(e => `${e.source}→${e.target}`).join(', ')}，割容量 = ${cutCapacity} = 最大流 = ${totalFlow}。`,
    null,
    cutEdgeHighlights,
    cutEdges,
    [...reachable]
  );

  return steps;
}

export const minCutRegistry: AlgorithmDefinition = {
  id: 'min-cut',
  slug: 'min-cut',
  title: '最小割',
  description: '通过最大流-最小割定理，先计算最大流再在残余图中找最小割。',
  categories: ['network-flow'],
  visualization: 'network-flow',
  createSteps: () => buildMinCutSteps(),
};
