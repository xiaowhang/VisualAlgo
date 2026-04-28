export type AlgorithmCategory = 'sorting' | 'graphs' | 'trees' | 'divide-conquer';

export type VisualizationKind = 'sorting' | 'graph' | 'tree' | 'hanoi';

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

export type AlgorithmStep = SortingStep | GraphStep | TreeStep | HanoiStep;

export interface AlgorithmDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AlgorithmCategory;
  visualization: VisualizationKind;
  createSteps: () => AlgorithmStep[];
}
