import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3';
import type { GraphEdge, GraphNode } from '@/types/algorithm';

interface GraphLayoutOptions {
  width?: number;
  height?: number;
  margin?: number;
  nodeRadius?: number;
  collisionPadding?: number;
  linkDistance?: number;
  linkStrength?: number;
  chargeStrength?: number;
  collideIterations?: number;
  ticks?: number;
}

interface LayoutNode extends SimulationNodeDatum {
  id: string;
}

interface LayoutLink extends SimulationLinkDatum<LayoutNode> {
  source: string;
  target: string;
}

interface LayoutConfig extends Required<GraphLayoutOptions> {}

const FIXED_DEFAULTS = {
  width: 760,
  height: 340,
  margin: 56,
  nodeRadius: 24,
  collisionPadding: 8,
};

function getAdaptiveDefaults(nodeCount: number): LayoutConfig {
  const normalized = clamp((nodeCount - 4) / 8, 0, 1);

  return {
    ...FIXED_DEFAULTS,
    linkDistance: clamp(84 + normalized * 26, 60, 110),
    linkStrength: 0.74 - normalized * 0.18,
    chargeStrength: -220 - normalized * 180,
    collideIterations: nodeCount < 10 ? 6 : 8,
    ticks: Math.round(320 + normalized * 300),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeEdgeKey(edge: GraphEdge) {
  return edge.source < edge.target
    ? `${edge.source}|${edge.target}`
    : `${edge.target}|${edge.source}`;
}

function createLayoutSeed(nodeIds: readonly string[], edges: readonly GraphEdge[]) {
  const edgeSignature = edges.map(normalizeEdgeKey).sort().join(',');
  return hashString(`${nodeIds.join(',')}::${edgeSignature}`);
}

function createInitialNodes(
  nodeIds: readonly string[],
  width: number,
  height: number,
  random: () => number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.28;

  return nodeIds.map((id, index) => {
    const angle = (Math.PI * 2 * index) / nodeIds.length;
    const angleJitter = (random() - 0.5) * 0.4;
    const radialJitter = radius * (random() * 0.2 - 0.1);

    return {
      id,
      x: centerX + Math.cos(angle + angleJitter) * (radius + radialJitter),
      y: centerY + Math.sin(angle + angleJitter) * (radius + radialJitter),
      vx: 0,
      vy: 0,
    } satisfies LayoutNode;
  });
}

function constrainNodesToBoundary(
  nodes: LayoutNode[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) {
  for (const node of nodes) {
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    if (x < minX) {
      node.x = minX;
      if ((node.vx ?? 0) < 0) {
        node.vx = 0;
      }
    } else if (x > maxX) {
      node.x = maxX;
      if ((node.vx ?? 0) > 0) {
        node.vx = 0;
      }
    }

    if (y < minY) {
      node.y = minY;
      if ((node.vy ?? 0) < 0) {
        node.vy = 0;
      }
    } else if (y > maxY) {
      node.y = maxY;
      if ((node.vy ?? 0) > 0) {
        node.vy = 0;
      }
    }
  }
}

function hasOverlap(nodes: readonly LayoutNode[], minDistance: number) {
  const minDistanceSquared = minDistance * minDistance;

  for (let left = 0; left < nodes.length; left += 1) {
    for (let right = left + 1; right < nodes.length; right += 1) {
      const dx = (nodes[right].x ?? 0) - (nodes[left].x ?? 0);
      const dy = (nodes[right].y ?? 0) - (nodes[left].y ?? 0);
      if (dx * dx + dy * dy < minDistanceSquared) {
        return true;
      }
    }
  }

  return false;
}

function resolveResidualOverlaps(
  nodes: LayoutNode[],
  minDistance: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  random: () => number,
  maxIterations = 12
) {
  const minDistanceSquared = minDistance * minDistance;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let moved = false;

    for (let left = 0; left < nodes.length; left += 1) {
      for (let right = left + 1; right < nodes.length; right += 1) {
        const first = nodes[left];
        const second = nodes[right];
        const dx = (second.x ?? 0) - (first.x ?? 0);
        const dy = (second.y ?? 0) - (first.y ?? 0);
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared >= minDistanceSquared) {
          continue;
        }

        const distance = Math.sqrt(distanceSquared);
        let ux = dx;
        let uy = dy;

        if (distance <= 1e-6) {
          const angle = random() * Math.PI * 2;
          ux = Math.cos(angle);
          uy = Math.sin(angle);
        } else {
          ux /= distance;
          uy /= distance;
        }

        const overlap = minDistance - Math.max(distance, 1e-6);
        const shift = overlap * 0.5 + 0.05;

        first.x = (first.x ?? 0) - ux * shift;
        first.y = (first.y ?? 0) - uy * shift;
        second.x = (second.x ?? 0) + ux * shift;
        second.y = (second.y ?? 0) + uy * shift;

        moved = true;
      }
    }

    constrainNodesToBoundary(nodes, minX, maxX, minY, maxY);

    if (!moved) {
      break;
    }
  }
}

export function computeStableForceLayout(
  nodeIds: readonly string[],
  edges: readonly GraphEdge[],
  options: GraphLayoutOptions = {}
): GraphNode[] {
  if (nodeIds.length === 0) {
    return [];
  }

  const config = { ...getAdaptiveDefaults(nodeIds.length), ...options };
  const seed = createLayoutSeed(nodeIds, edges);
  const random = createSeededRandom(seed);

  const nodes = createInitialNodes(nodeIds, config.width, config.height, random);
  const links: LayoutLink[] = edges.map(edge => ({
    source: edge.source,
    target: edge.target,
  }));

  const collisionRadius = config.nodeRadius + config.collisionPadding;
  const safeMargin = config.margin + collisionRadius;
  const minX = safeMargin;
  const maxX = config.width - safeMargin;
  const minY = safeMargin;
  const maxY = config.height - safeMargin;

  const simulation = forceSimulation<LayoutNode>(nodes)
    .randomSource(createSeededRandom(seed ^ 0x9e3779b9))
    .force(
      'link',
      forceLink<LayoutNode, LayoutLink>(links)
        .id(node => node.id)
        .distance(config.linkDistance)
        .strength(config.linkStrength)
    )
    .force(
      'charge',
      forceManyBody<LayoutNode>()
        .strength(config.chargeStrength)
        .distanceMin(config.nodeRadius)
        .distanceMax(Math.max(config.width, config.height))
    )
    .force(
      'collide',
      forceCollide<LayoutNode>(collisionRadius).iterations(config.collideIterations)
    )
    .force('center', forceCenter(config.width / 2, config.height / 2))
    .stop();

  for (let tick = 0; tick < config.ticks; tick += 1) {
    simulation.tick();
    constrainNodesToBoundary(nodes, minX, maxX, minY, maxY);
  }

  const minDistance = collisionRadius * 2;
  if (hasOverlap(nodes, minDistance)) {
    resolveResidualOverlaps(nodes, minDistance, minX, maxX, minY, maxY, random, 12);
  }

  return nodes.map(node => {
    const x = clamp(node.x ?? config.width / 2, minX, maxX);
    const y = clamp(node.y ?? config.height / 2, minY, maxY);

    return {
      id: node.id,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    };
  });
}
