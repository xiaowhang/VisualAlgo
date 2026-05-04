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

describe('colorSemantics 兼容性', () => {
  describe('各算法 fallback 到默认颜色', () => {
    it('sorting：无高亮 → default', () => {
      const step: SortingStep = {
        kind: 'sorting',
        values: [3, 1, 2],
        highlights: {},
        description: '',
      };
      expect(resolveSortingBarColor(step, 0)).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('graph：普通节点 → idle', () => {
      const step: GraphStep = {
        kind: 'graph',
        nodes: [],
        edges: [],
        current: null,
        frontier: [],
        visited: [],
        order: [],
        description: '',
      };
      expect(resolveGraphNodeColor(step, 'A')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('graph：current > frontier > visited 优先级', () => {
      const step: GraphStep = {
        kind: 'graph',
        nodes: [],
        edges: [],
        current: 'A',
        frontier: ['A'],
        visited: ['A'],
        order: [],
        description: '',
      };
      expect(resolveGraphNodeColor(step, 'A')).toBe(VISUALIZATION_COLOR_TOKENS.current);
    });

    it('tree：无高亮 → default', () => {
      const step: TreeStep = {
        kind: 'tree',
        nodes: [],
        edges: [],
        highlights: {},
        nodeLabels: {},
        description: '',
      };
      expect(resolveTreeNodeColor(step, '0')).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('dp：有值无高亮 → computed', () => {
      const step: DpTableStep = {
        kind: 'dp-table',
        table: [
          [1, 2],
          [3, 4],
        ],
        highlights: {},
        rowLabels: [],
        colLabels: [],
        currentCell: null,
        backtrackPath: null,
        phase: 'compute',
        description: '',
      };
      expect(resolveDpCellColor(step, 0, 0)).toBe(VISUALIZATION_COLOR_TOKENS.done);
    });

    it('dp：null 值 → default', () => {
      const step: DpTableStep = {
        kind: 'dp-table',
        table: [
          [null, null],
          [null, null],
        ],
        highlights: {},
        rowLabels: [],
        colLabels: [],
        currentCell: null,
        backtrackPath: null,
        phase: 'init',
        description: '',
      };
      expect(resolveDpCellColor(step, 0, 0)).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('huffman：无高亮 → default', () => {
      const step: HuffmanStep = {
        kind: 'huffman',
        nodes: [],
        edges: [],
        queue: [],
        highlights: {},
        merged: null,
        newParent: null,
        description: '',
      };
      expect(resolveHuffmanNodeColor(step, 'n0')).toBe(VISUALIZATION_COLOR_TOKENS.default);
    });

    it('timeline：无高亮 → idle', () => {
      const step: TimelineStep = {
        kind: 'timeline',
        intervals: [],
        highlights: {},
        currentInterval: null,
        lastSelected: null,
        description: '',
      };
      expect(resolveTimelineIntervalColor(step, 'i0')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('chessboard：无高亮 → idle', () => {
      const step: ChessboardStep = {
        kind: 'chessboard',
        size: 4,
        queens: [],
        current: null,
        conflicts: [],
        highlights: {},
        phase: 'placing',
        description: '',
      };
      expect(resolveChessboardCellColor(step, '0,0')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('decision-tree：无高亮 → idle', () => {
      const step: DecisionTreeStep = {
        kind: 'decision-tree',
        nodes: [],
        edges: [],
        highlights: {},
        current: null,
        solutionPaths: [],
        description: '',
      };
      expect(resolveDecisionTreeNodeColor(step, 'n0')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('network-flow：普通节点 → idle', () => {
      const step: NetworkFlowStep = {
        kind: 'network-flow',
        nodes: [],
        edges: [],
        highlights: {},
        source: 'S',
        sink: 'T',
        currentFlow: 0,
        maxFlow: null,
        augmentingPath: null,
        cutEdges: null,
        cutS: null,
        description: '',
      };
      expect(resolveNetworkFlowNodeColor(step, 'X')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });

    it('network-flow：非饱和边 → border', () => {
      const step: NetworkFlowStep = {
        kind: 'network-flow',
        nodes: [],
        edges: [{ source: 'A', target: 'B', capacity: 10, flow: 3 }],
        highlights: {},
        source: 'S',
        sink: 'T',
        currentFlow: 3,
        maxFlow: null,
        augmentingPath: null,
        cutEdges: null,
        cutS: null,
        description: '',
      };
      expect(resolveNetworkFlowEdgeColor(step, 'A->B')).toBe(VISUALIZATION_COLOR_TOKENS.border);
    });

    it('lp-tableau：无高亮 → idle', () => {
      const step: LpTableauStep = {
        kind: 'lp-tableau',
        variableNames: [],
        rowLabels: [],
        tableau: [],
        highlights: {},
        objectiveValue: 0,
        currentPivot: null,
        phase: 'init',
        description: '',
      };
      expect(resolveLpTableauCellColor(step, 'cell-0-0')).toBe(VISUALIZATION_COLOR_TOKENS.idle);
    });
  });

  describe('VISUALIZATION_COLOR_TOKENS 完整性', () => {
    const expectedKeys = [
      'default',
      'compare',
      'swap',
      'pivot',
      'done',
      'visited',
      'frontier',
      'current',
      'idle',
      'border',
      'text',
    ] as const;

    it('包含全部 11 个 key', () => {
      expect(Object.keys(VISUALIZATION_COLOR_TOKENS)).toHaveLength(expectedKeys.length);
    });

    for (const key of expectedKeys) {
      it(`${key} 格式为 var(--...)`, () => {
        expect(VISUALIZATION_COLOR_TOKENS[key]).toMatch(/^var\(--.+\)$/);
      });
    }
  });
});
