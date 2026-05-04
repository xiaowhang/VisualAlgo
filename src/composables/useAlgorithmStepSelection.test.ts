import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useAlgorithmStepSelection } from './useAlgorithmStepSelection';
import type {
  SortingStep,
  GraphStep,
  TreeStep,
  HanoiStep,
  DpTableStep,
  HuffmanStep,
  TimelineStep,
  ChessboardStep,
  DecisionTreeStep,
  NetworkFlowStep,
  LpTableauStep,
  LpGraphicalStep,
} from '@/types/algorithm';

const makeSortingStep = (values: number[]): SortingStep => ({
  kind: 'sorting',
  description: 'test',
  values,
  highlights: {},
});

const makeGraphStep = (nodes: string[]): GraphStep => ({
  kind: 'graph',
  description: 'test',
  nodes: nodes.map(id => ({ id, x: 0, y: 0 })),
  edges: [],
  current: null,
  visited: [],
  frontier: [],
  order: [],
});

const makeTreeStep = (): TreeStep => ({
  kind: 'tree',
  description: 'test',
  nodes: [],
  edges: [],
  highlights: {},
  nodeLabels: {},
});

const makeHanoiStep = (): HanoiStep => ({
  kind: 'hanoi',
  description: 'test',
  pegs: [
    { id: 'A', disks: [] },
    { id: 'B', disks: [] },
    { id: 'C', disks: [] },
  ],
  move: null,
});

const makeDpStep = (): DpTableStep => ({
  kind: 'dp-table',
  description: 'test',
  table: [],
  highlights: {},
  phase: 'compute',
  rowLabels: [],
  colLabels: [],
  currentCell: null,
  backtrackPath: null,
});

const makeHuffmanStep = (): HuffmanStep => ({
  kind: 'huffman',
  description: 'test',
  nodes: [],
  edges: [],
  highlights: {},
  queue: [],
  merged: null,
  newParent: null,
});

const makeTimelineStep = (): TimelineStep => ({
  kind: 'timeline',
  description: 'test',
  intervals: [],
  highlights: {},
  currentInterval: null,
  lastSelected: null,
});

const makeChessboardStep = (): ChessboardStep => ({
  kind: 'chessboard',
  description: 'test',
  size: 4,
  queens: [],
  current: null,
  conflicts: [],
  highlights: {},
  phase: 'placing',
});

const makeDecisionTreeStep = (): DecisionTreeStep => ({
  kind: 'decision-tree',
  description: 'test',
  nodes: [],
  edges: [],
  highlights: {},
  current: null,
  solutionPaths: [],
});

const makeNetworkFlowStep = (): NetworkFlowStep => ({
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
});

const makeLpTableauStep = (): LpTableauStep => ({
  kind: 'lp-tableau',
  description: 'test',
  variableNames: [],
  rowLabels: [],
  tableau: [],
  phase: 'init',
  objectiveValue: 0,
  highlights: {},
  currentPivot: null,
});

const makeLpGraphicalStep = (): LpGraphicalStep => ({
  kind: 'lp-graphical',
  description: 'test',
  constraints: [],
  feasibleRegion: [],
  objectiveA: 0,
  objectiveB: 0,
  objectiveValue: 0,
  optimalPoint: null,
  currentVertex: null,
  xRange: [0, 10],
  yRange: [0, 10],
  highlights: {},
});

describe('useAlgorithmStepSelection', () => {
  it('空 steps：stepIndex=-1，所有 accessor 返回 null', () => {
    const steps = ref([]);
    const currentStep = ref(0);
    const s = useAlgorithmStepSelection({ steps, currentStep });

    expect(s.stepIndex.value).toBe(-1);
    expect(s.step.value).toBe(null);
    expect(s.sortingStep.value).toBe(null);
    expect(s.graphStep.value).toBe(null);
    expect(s.treeStep.value).toBe(null);
    expect(s.hanoiStep.value).toBe(null);
    expect(s.dpTableStep.value).toBe(null);
    expect(s.huffmanStep.value).toBe(null);
    expect(s.timelineStep.value).toBe(null);
    expect(s.chessboardStep.value).toBe(null);
    expect(s.decisionTreeStep.value).toBe(null);
    expect(s.networkFlowStep.value).toBe(null);
    expect(s.lpTableauStep.value).toBe(null);
    expect(s.lpGraphicalStep.value).toBe(null);
  });

  it('currentStep 超限钳制', () => {
    const steps = ref([makeSortingStep([1, 2, 3])]);
    const currentStep = ref(100);
    const s = useAlgorithmStepSelection({ steps, currentStep });

    expect(s.stepIndex.value).toBe(0);
    expect(s.step.value).toBe(steps.value[0]);
  });

  it('sortingStep：kind 匹配时返回，不匹配时 null', () => {
    const sortingSteps = ref([makeSortingStep([1, 2, 3])]);
    const graphSteps = ref([makeGraphStep(['A', 'B'])]);

    const s1 = useAlgorithmStepSelection({ steps: sortingSteps, currentStep: ref(0) });
    expect(s1.sortingStep.value).not.toBe(null);
    expect(s1.graphStep.value).toBe(null);

    const s2 = useAlgorithmStepSelection({ steps: graphSteps, currentStep: ref(0) });
    expect(s2.sortingStep.value).toBe(null);
    expect(s2.graphStep.value).not.toBe(null);
  });

  it('所有 12 种 kind 的 typed accessor', () => {
    const cases = [
      { step: makeSortingStep([1]), accessor: 'sortingStep' as const },
      { step: makeGraphStep(['A']), accessor: 'graphStep' as const },
      { step: makeTreeStep(), accessor: 'treeStep' as const },
      { step: makeHanoiStep(), accessor: 'hanoiStep' as const },
      { step: makeDpStep(), accessor: 'dpTableStep' as const },
      { step: makeHuffmanStep(), accessor: 'huffmanStep' as const },
      { step: makeTimelineStep(), accessor: 'timelineStep' as const },
      { step: makeChessboardStep(), accessor: 'chessboardStep' as const },
      { step: makeDecisionTreeStep(), accessor: 'decisionTreeStep' as const },
      { step: makeNetworkFlowStep(), accessor: 'networkFlowStep' as const },
      { step: makeLpTableauStep(), accessor: 'lpTableauStep' as const },
      { step: makeLpGraphicalStep(), accessor: 'lpGraphicalStep' as const },
    ];

    for (const { step, accessor } of cases) {
      const steps = ref([step]);
      const s = useAlgorithmStepSelection({ steps, currentStep: ref(0) });

      // 匹配的 accessor 应返回非 null
      expect(s[accessor].value, `${accessor} should match kind="${step.kind}"`).not.toBe(null);

      // 其他 accessor 应返回 null
      const allAccessors = cases.map(c => c.accessor);
      for (const other of allAccessors) {
        if (other !== accessor) {
          expect(s[other].value, `${other} should be null for kind="${step.kind}"`).toBe(null);
        }
      }
    }
  });

  it('多步骤时正确按 currentStep 索引', () => {
    const steps = ref([makeSortingStep([1, 2]), makeGraphStep(['A']), makeSortingStep([3, 4])]);
    const currentStep = ref(0);
    const s = useAlgorithmStepSelection({ steps, currentStep });

    expect(s.sortingStep.value).not.toBe(null);
    expect(s.graphStep.value).toBe(null);

    currentStep.value = 1;
    expect(s.sortingStep.value).toBe(null);
    expect(s.graphStep.value).not.toBe(null);

    currentStep.value = 2;
    expect(s.sortingStep.value).not.toBe(null);
    expect(s.graphStep.value).toBe(null);
  });

  it('getter 函数作为输入', () => {
    const steps = ref([makeSortingStep([1, 2, 3])]);
    const s = useAlgorithmStepSelection({
      steps: () => steps.value,
      currentStep: () => 0,
    });
    expect(s.step.value).not.toBe(null);
    expect(s.stepIndex.value).toBe(0);
  });
});
