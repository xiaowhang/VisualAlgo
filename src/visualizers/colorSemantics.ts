import type {
  DpHighlightKind,
  DpTableStep,
  GraphStep,
  HuffmanHighlightKind,
  HuffmanStep,
  SortingHighlightKind,
  SortingStep,
  TimelineIntervalState,
  TimelineStep,
  TreeHighlightKind,
  TreeStep,
} from '@/types/algorithm';

// Keep algorithm semantics colors independent from the grayscale UI brand palette.
// UI shell (cards, typography, surfaces) follows DESIGN.md monochrome tokens,
// while data states (compare/swap/pivot/frontier/current) stay chromatic for readability.
// If you need to animate colors in D3, resolve CSS variables before transition.
const COLOR_TOKENS = {
  default: 'var(--chart-1)',
  compare: 'var(--chart-2)',
  swap: 'var(--chart-4)',
  pivot: 'var(--chart-3)',
  done: 'var(--chart-5)',
  visited: 'var(--chart-1)',
  frontier: 'var(--chart-2)',
  current: 'var(--chart-4)',
  idle: 'var(--muted)',
  border: 'var(--border)',
  text: 'var(--foreground)',
} as const;

const SORTING_COLOR_BY_KIND: Record<SortingHighlightKind, string> = {
  default: COLOR_TOKENS.default,
  compare: COLOR_TOKENS.compare,
  swap: COLOR_TOKENS.swap,
  pivot: COLOR_TOKENS.pivot,
  done: COLOR_TOKENS.done,
};

export function resolveSortingBarColor(step: SortingStep, index: number) {
  const highlightKind = step.highlights[index] ?? 'default';
  return SORTING_COLOR_BY_KIND[highlightKind];
}

export function resolveGraphNodeColor(step: GraphStep, nodeId: string) {
  if (step.current === nodeId) {
    return COLOR_TOKENS.current;
  }

  if (step.frontier.includes(nodeId)) {
    return COLOR_TOKENS.frontier;
  }

  if (step.visited.includes(nodeId)) {
    return COLOR_TOKENS.visited;
  }

  return COLOR_TOKENS.idle;
}

const TREE_COLOR_BY_KIND: Record<TreeHighlightKind, string> = {
  default: COLOR_TOKENS.default,
  current: COLOR_TOKENS.current,
  compare: COLOR_TOKENS.compare,
  swap: COLOR_TOKENS.swap,
  visited: COLOR_TOKENS.visited,
  done: COLOR_TOKENS.done,
};

export function resolveTreeNodeColor(step: TreeStep, nodeId: string) {
  const highlightKind = step.highlights[nodeId] ?? 'default';
  return TREE_COLOR_BY_KIND[highlightKind];
}

const DP_COLOR_BY_KIND: Record<DpHighlightKind, string> = {
  default: COLOR_TOKENS.default,
  current: COLOR_TOKENS.current,
  dependency: COLOR_TOKENS.compare,
  computed: COLOR_TOKENS.done,
  backtrack: COLOR_TOKENS.swap,
};

export function resolveDpCellColor(step: DpTableStep, row: number, col: number): string {
  const key = `${row},${col}`;
  const highlightKind = step.highlights[key];
  if (highlightKind) return DP_COLOR_BY_KIND[highlightKind];

  const value = step.table[row]?.[col];
  if (value !== null && value !== undefined) return DP_COLOR_BY_KIND.computed;
  return DP_COLOR_BY_KIND.default;
}

const HUFFMAN_COLOR_BY_KIND: Record<HuffmanHighlightKind, string> = {
  default: COLOR_TOKENS.default,
  queue: COLOR_TOKENS.idle,
  merging: COLOR_TOKENS.compare,
  merged: COLOR_TOKENS.done,
  done: COLOR_TOKENS.done,
};

export function resolveHuffmanNodeColor(step: HuffmanStep, nodeId: string): string {
  const highlightKind = step.highlights[nodeId] ?? 'default';
  return HUFFMAN_COLOR_BY_KIND[highlightKind];
}

const TIMELINE_COLOR_BY_STATE: Record<TimelineIntervalState, string> = {
  idle: COLOR_TOKENS.idle,
  considering: COLOR_TOKENS.current,
  selected: COLOR_TOKENS.done,
  rejected: COLOR_TOKENS.swap,
};

export function resolveTimelineIntervalColor(step: TimelineStep, intervalId: string): string {
  const state = step.highlights[intervalId] ?? 'idle';
  return TIMELINE_COLOR_BY_STATE[state];
}

export const VISUALIZATION_COLOR_TOKENS = COLOR_TOKENS;
