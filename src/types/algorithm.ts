export type AlgorithmCategory =
  | 'sorting'
  | 'graphs'
  | 'trees'
  | 'divide-conquer'
  | 'dynamic-programming'
  | 'greedy'
  | 'backtracking';

export type VisualizationKind =
  | 'sorting'
  | 'graph'
  | 'tree'
  | 'hanoi'
  | 'dp-table'
  | 'huffman'
  | 'timeline'
  | 'chessboard'
  | 'decision-tree';

export type SortingHighlightKind = 'default' | 'compare' | 'swap' | 'pivot' | 'done';

export interface SortingStep {
  kind: 'sorting';
  values: number[];
  highlights: Partial<Record<number, SortingHighlightKind>>;
  description: string;
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

export interface GraphStep {
  kind: 'graph';
  nodes: GraphNode[];
  edges: GraphEdge[];
  current: string | null;
  visited: string[];
  frontier: string[];
  order: string[];
  description: string;
  nodeLabels?: Partial<Record<string, string>>;
}

export type TreeHighlightKind = 'default' | 'current' | 'compare' | 'swap' | 'visited' | 'done';

export interface TreeStep {
  kind: 'tree';
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlights: Partial<Record<string, TreeHighlightKind>>;
  nodeLabels: Partial<Record<string, string>>;
  description: string;
}

export interface HanoiPeg {
  id: string;
  disks: number[];
}

export interface HanoiMove {
  from: string;
  to: string;
  disk: number;
}

export interface HanoiStep {
  kind: 'hanoi';
  pegs: [HanoiPeg, HanoiPeg, HanoiPeg];
  move: HanoiMove | null;
  description: string;
}

export type DpHighlightKind = 'default' | 'current' | 'dependency' | 'computed' | 'backtrack';

export interface DpTableStep {
  kind: 'dp-table';
  table: (number | null)[][];
  rowLabels: string[];
  colLabels: string[];
  currentCell: [number, number] | null;
  highlights: Partial<Record<string, DpHighlightKind>>;
  backtrackPath: [number, number][] | null;
  phase: 'init' | 'compute' | 'backtrack' | 'done';
  description: string;
}

export type HuffmanHighlightKind = 'default' | 'queue' | 'merging' | 'merged' | 'done';

export interface HuffmanNode {
  id: string;
  char: string | null;
  weight: number;
  x: number;
  y: number;
  left: string | null;
  right: string | null;
}

export interface HuffmanStep {
  kind: 'huffman';
  nodes: HuffmanNode[];
  edges: { source: string; target: string }[];
  queue: string[];
  merged: [string, string] | null;
  newParent: string | null;
  highlights: Partial<Record<string, HuffmanHighlightKind>>;
  description: string;
}

export interface TimelineInterval {
  id: string;
  start: number;
  end: number;
  label: string;
}

export type TimelineIntervalState = 'idle' | 'considering' | 'selected' | 'rejected';

export interface TimelineStep {
  kind: 'timeline';
  intervals: TimelineInterval[];
  highlights: Partial<Record<string, TimelineIntervalState>>;
  currentInterval: string | null;
  lastSelected: string | null;
  description: string;
}

export type ChessboardHighlightKind =
  | 'default'
  | 'queen'
  | 'current'
  | 'conflict'
  | 'safe'
  | 'backtrack';

export interface ChessboardStep {
  kind: 'chessboard';
  size: number;
  queens: [number, number][];
  current: [number, number] | null;
  conflicts: [number, number][];
  highlights: Partial<Record<string, ChessboardHighlightKind>>;
  phase: 'placing' | 'backtracking' | 'done';
  description: string;
}

export type DecisionTreeHighlightKind =
  | 'default'
  | 'current'
  | 'considering'
  | 'selected'
  | 'pruned'
  | 'solution'
  | 'backtrack';

export interface DecisionTreeNode {
  id: string;
  label: string;
  depth: number;
  remaining: number;
  taken: number[];
  x: number;
  y: number;
}

export interface DecisionTreeStep {
  kind: 'decision-tree';
  nodes: DecisionTreeNode[];
  edges: { source: string; target: string }[];
  current: string | null;
  solutionPaths: number[][];
  highlights: Partial<Record<string, DecisionTreeHighlightKind>>;
  description: string;
}

export type AlgorithmStep =
  | SortingStep
  | GraphStep
  | TreeStep
  | HanoiStep
  | DpTableStep
  | HuffmanStep
  | TimelineStep
  | ChessboardStep
  | DecisionTreeStep;

export interface AlgorithmDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AlgorithmCategory;
  visualization: VisualizationKind;
  createSteps: () => AlgorithmStep[];
}
