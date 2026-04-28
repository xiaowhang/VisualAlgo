export type AlgorithmCategory =
  | 'sorting'
  | 'graphs'
  | 'trees'
  | 'divide-conquer'
  | 'dynamic-programming';

export type VisualizationKind = 'sorting' | 'graph' | 'tree' | 'hanoi' | 'dp-table';

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

export type AlgorithmStep = SortingStep | GraphStep | TreeStep | HanoiStep | DpTableStep;

export interface AlgorithmDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AlgorithmCategory;
  visualization: VisualizationKind;
  createSteps: () => AlgorithmStep[];
}
