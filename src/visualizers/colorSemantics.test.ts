import { describe, it, expect } from 'vitest';
import {
  resolveSortingBarColor,
  resolveGraphNodeColor,
  resolveTreeNodeColor,
  resolveDpCellColor,
  resolveHuffmanNodeColor,
  resolveTimelineIntervalColor,
  resolveChessboardCellColor,
  resolveDecisionTreeNodeColor,
  resolveNetworkFlowNodeColor,
  resolveNetworkFlowEdgeColor,
  resolveLpTableauCellColor,
  VISUALIZATION_COLOR_TOKENS,
} from './colorSemantics';
import type {
  SortingStep,
  GraphStep,
  TreeStep,
  DpTableStep,
  HuffmanStep,
  TimelineStep,
  ChessboardStep,
  DecisionTreeStep,
  NetworkFlowStep,
  LpTableauStep,
} from '@/types/algorithm';

describe('colorSemantics', () => {
  describe('VISUALIZATION_COLOR_TOKENS', () => {
    it('包含所有必要的颜色 token', () => {
      expect(VISUALIZATION_COLOR_TOKENS.default).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.compare).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.swap).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.pivot).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.done).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.visited).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.frontier).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.current).toBeDefined();
      expect(VISUALIZATION_COLOR_TOKENS.idle).toBeDefined();
    });

    it('所有 token 都是 CSS var() 格式', () => {
      for (const token of Object.values(VISUALIZATION_COLOR_TOKENS)) {
        expect(token).toMatch(/^var\(--.+\)$/);
      }
    });
  });

  describe('resolveSortingBarColor', () => {
    const baseStep: SortingStep = {
      kind: 'sorting',
      description: 'test',
      values: [1, 2, 3],
      highlights: {},
    };

    it('无高亮时返回 default 颜色', () => {
      expect(resolveSortingBarColor(baseStep, 0)).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('compare 高亮返回 compare 颜色', () => {
      const step = { ...baseStep, highlights: { 0: 'compare' as const } };
      expect(resolveSortingBarColor(step, 0)).toBe(VISUALIZATION_COLOR_TOKENS.compare);
    });

    it('swap 高亮返回 swap 颜色', () => {
      const step = { ...baseStep, highlights: { 1: 'swap' as const } };
      expect(resolveSortingBarColor(step, 1)).toBe(VISUALIZATION_COLOR_TOKENS.swap);
    });

    it('pivot 高亮返回 pivot 颜色', () => {
      const step = { ...baseStep, highlights: { 2: 'pivot' as const } };
      expect(resolveSortingBarColor(step, 2)).toBe(VISUALIZATION_COLOR_TOKENS.pivot);
    });

    it('done 高亮返回 done 颜色', () => {
      const step = { ...baseStep, highlights: { 0: 'done' as const } };
      expect(resolveSortingBarColor(step, 0)).toBe(VISUALIZATION_COLOR_TOKENS.done);
    });
  });

  describe('resolveGraphNodeColor', () => {
    const baseStep: GraphStep = {
      kind: 'graph',
      description: 'test',
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 100, y: 0 },
      ],
      edges: [],
      current: null,
      visited: [],
      frontier: [],
      order: [],
    };

    it('current 节点返回 current 颜色', () => {
      const step = { ...baseStep, current: 'A' };
      expect(resolveGraphNodeColor(step, 'A')).toBe(VISUALIZATION_COLOR_TOKENS.current);
    });

    it('frontier 节点返回 frontier 颜色', () => {
      const step = { ...baseStep, frontier: ['B'] };
      expect(resolveGraphNodeColor(step, 'B')).toBe(VISUALIZATION_COLOR_TOKENS.frontier);
    });

    it('visited 节点返回 visited 颜色', () => {
      const step = { ...baseStep, visited: ['A'] };
      expect(resolveGraphNodeColor(step, 'A')).toBe(VISUALIZATION_COLOR_TOKENS.visited);
    });

    it('未访问节点返回 idle 颜色', () => {
      expect(resolveGraphNodeColor(baseStep, 'A')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });
  });

  describe('resolveTreeNodeColor', () => {
    it('无高亮返回 default', () => {
      const step: TreeStep = {
        kind: 'tree',
        description: 'test',
        nodes: [],
        edges: [],
        highlights: {},
        nodeLabels: {},
      };
      expect(resolveTreeNodeColor(step, 'node1')).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('current 高亮返回 current 颜色', () => {
      const step: TreeStep = {
        kind: 'tree',
        description: 'test',
        nodes: [],
        edges: [],
        highlights: { node1: 'current' },
        nodeLabels: {},
      };
      expect(resolveTreeNodeColor(step, 'node1')).toBe(VISUALIZATION_COLOR_TOKENS.current);
    });
  });

  describe('resolveDpCellColor', () => {
    const baseStep: DpTableStep = {
      kind: 'dp-table',
      description: 'test',
      table: [
        [null, null],
        [null, 5],
      ],
      highlights: {},
      phase: 'compute',
      rowLabels: ['', ''],
      colLabels: ['', ''],
      currentCell: null,
      backtrackPath: null,
    };

    it('有值但无高亮的单元格返回 computed 颜色', () => {
      expect(resolveDpCellColor(baseStep, 1, 1)).toBe(
        'var(--chart-5)' // done = computed
      );
    });

    it('null 单元格返回 default 颜色', () => {
      expect(resolveDpCellColor(baseStep, 0, 0)).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('有高亮时返回对应颜色', () => {
      const step = { ...baseStep, highlights: { '1,1': 'current' as const } };
      expect(resolveDpCellColor(step, 1, 1)).toBe(VISUALIZATION_COLOR_TOKENS.current);
    });
  });

  describe('resolveHuffmanNodeColor', () => {
    it('无高亮返回 default', () => {
      const step: HuffmanStep = {
        kind: 'huffman',
        description: 'test',
        nodes: [],
        edges: [],
        highlights: {},
        queue: [],
        merged: null,
        newParent: null,
      };
      expect(resolveHuffmanNodeColor(step, 'n1')).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('merging 高亮返回 compare 颜色', () => {
      const step: HuffmanStep = {
        kind: 'huffman',
        description: 'test',
        nodes: [],
        edges: [],
        highlights: { n1: 'merging' },
        queue: [],
        merged: null,
        newParent: null,
      };
      expect(resolveHuffmanNodeColor(step, 'n1')).toBe(VISUALIZATION_COLOR_TOKENS.compare);
    });
  });

  describe('resolveTimelineIntervalColor', () => {
    it('无高亮返回 idle', () => {
      const step: TimelineStep = {
        kind: 'timeline',
        description: 'test',
        intervals: [],
        highlights: {},
        currentInterval: null,
        lastSelected: null,
      };
      expect(resolveTimelineIntervalColor(step, 'i1')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('selected 返回 done 颜色', () => {
      const step: TimelineStep = {
        kind: 'timeline',
        description: 'test',
        intervals: [],
        highlights: { i1: 'selected' },
        currentInterval: null,
        lastSelected: null,
      };
      expect(resolveTimelineIntervalColor(step, 'i1')).toBe(VISUALIZATION_COLOR_TOKENS.done);
    });
  });

  describe('resolveChessboardCellColor', () => {
    it('无高亮返回 idle (default)', () => {
      const step: ChessboardStep = {
        kind: 'chessboard',
        description: 'test',
        size: 4,
        queens: [],
        current: null,
        conflicts: [],
        highlights: {},
        phase: 'placing',
      };
      expect(resolveChessboardCellColor(step, '0,0')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('queen 高亮返回 done 颜色', () => {
      const step: ChessboardStep = {
        kind: 'chessboard',
        description: 'test',
        size: 4,
        queens: [],
        current: null,
        conflicts: [],
        highlights: { '0,0': 'queen' },
        phase: 'placing',
      };
      expect(resolveChessboardCellColor(step, '0,0')).toBe(VISUALIZATION_COLOR_TOKENS.done);
    });
  });

  describe('resolveDecisionTreeNodeColor', () => {
    it('无高亮返回 idle', () => {
      const step: DecisionTreeStep = {
        kind: 'decision-tree',
        description: 'test',
        nodes: [],
        edges: [],
        highlights: {},
        current: null,
        solutionPaths: [],
      };
      expect(resolveDecisionTreeNodeColor(step, 'n1')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });
  });

  describe('resolveNetworkFlowNodeColor', () => {
    const baseStep: NetworkFlowStep = {
      kind: 'network-flow',
      description: 'test',
      nodes: [],
      edges: [],
      source: 'S',
      sink: 'T',
      currentFlow: 0,
      maxFlow: 0,
      highlights: {},
      augmentingPath: null,
      cutEdges: null,
      cutS: null,
    };

    it('source 节点返回 visited 颜色', () => {
      expect(resolveNetworkFlowNodeColor(baseStep, 'S')).toBe(VISUALIZATION_COLOR_TOKENS.visited);
    });

    it('sink 节点返回 done 颜色', () => {
      expect(resolveNetworkFlowNodeColor(baseStep, 'T')).toBe(VISUALIZATION_COLOR_TOKENS.done);
    });

    it('普通节点返回 idle 颜色', () => {
      expect(resolveNetworkFlowNodeColor(baseStep, 'A')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });
  });

  describe('resolveNetworkFlowEdgeColor', () => {
    it('饱和边返回 swap 颜色', () => {
      const step: NetworkFlowStep = {
        kind: 'network-flow',
        description: 'test',
        nodes: [],
        edges: [{ source: 'A', target: 'B', capacity: 10, flow: 10 }],
        source: 'S',
        sink: 'T',
        currentFlow: 0,
        maxFlow: 0,
        highlights: {},
        augmentingPath: null,
        cutEdges: null,
        cutS: null,
      };
      expect(resolveNetworkFlowEdgeColor(step, 'A->B')).toBe(VISUALIZATION_COLOR_TOKENS.swap);
    });

    it('非饱和边返回 border 颜色', () => {
      const step: NetworkFlowStep = {
        kind: 'network-flow',
        description: 'test',
        nodes: [],
        edges: [{ source: 'A', target: 'B', capacity: 10, flow: 5 }],
        source: 'S',
        sink: 'T',
        currentFlow: 0,
        maxFlow: 0,
        highlights: {},
        augmentingPath: null,
        cutEdges: null,
        cutS: null,
      };
      expect(resolveNetworkFlowEdgeColor(step, 'A->B')).toBe(VISUALIZATION_COLOR_TOKENS.border);
    });
  });

  describe('resolveLpTableauCellColor', () => {
    it('无高亮返回 idle', () => {
      const step: LpTableauStep = {
        kind: 'lp-tableau',
        description: 'test',
        variableNames: [],
        rowLabels: [],
        tableau: [],
        phase: 'init',
        objectiveValue: 0,
        highlights: {},
        currentPivot: null,
      };
      expect(resolveLpTableauCellColor(step, '0,0')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('pivot-cell 高亮返回 current 颜色', () => {
      const step: LpTableauStep = {
        kind: 'lp-tableau',
        description: 'test',
        variableNames: [],
        rowLabels: [],
        tableau: [],
        phase: 'pivoting',
        objectiveValue: 0,
        highlights: { '1,2': 'pivot-cell' },
        currentPivot: null,
      };
      expect(resolveLpTableauCellColor(step, '1,2')).toBe(VISUALIZATION_COLOR_TOKENS.current);
    });
  });
});
