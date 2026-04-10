import type { GraphStep, SortingHighlightKind, SortingStep } from '@/types/algorithm';

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

export const VISUALIZATION_COLOR_TOKENS = COLOR_TOKENS;
