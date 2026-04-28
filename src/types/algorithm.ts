export type AlgorithmCategory = 'sorting' | 'graphs' | 'trees';

export type VisualizationKind = 'sorting' | 'graph' | 'tree';

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

export type AlgorithmStep = SortingStep | GraphStep | TreeStep;

export interface AlgorithmDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AlgorithmCategory;
  visualization: VisualizationKind;
  createSteps: () => AlgorithmStep[];
}
