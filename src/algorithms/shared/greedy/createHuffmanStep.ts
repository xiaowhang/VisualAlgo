import type { AlgorithmStep, HuffmanHighlightKind, HuffmanNode } from '@/types/algorithm';

interface CreateHuffmanStepConfig {
  nodes: HuffmanNode[];
  edges: { source: string; target: string }[];
  queue: string[];
  merged?: [string, string] | null;
  newParent?: string | null;
  highlights?: Partial<Record<string, HuffmanHighlightKind>>;
  description: string;
}

export function createHuffmanStep(config: CreateHuffmanStepConfig): AlgorithmStep {
  return {
    kind: 'huffman',
    nodes: config.nodes.map(node => ({ ...node })),
    edges: config.edges.map(edge => ({ ...edge })),
    queue: [...config.queue],
    merged: config.merged ?? null,
    newParent: config.newParent ?? null,
    highlights: { ...config.highlights },
    description: config.description,
  };
}
