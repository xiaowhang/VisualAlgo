export type AlgorithmCategory = 'sorting' | 'graphs';

export type VisualizationKind = 'sorting' | 'graph';

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

export type AlgorithmStep = SortingStep | GraphStep;

export interface AlgorithmDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AlgorithmCategory;
  visualization: VisualizationKind;
  createSteps: () => AlgorithmStep[];
}
