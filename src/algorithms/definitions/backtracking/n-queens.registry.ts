import { getNQueensSize } from '@/algorithms/shared/inputs';
import type {
  AlgorithmDefinition,
  AlgorithmStep,
  ChessboardHighlightKind,
  ChessboardStep,
} from '@/types/algorithm';

function buildNQueensSteps(n: number): AlgorithmStep[] {
  const steps: ChessboardStep[] = [];
  const queens: [number, number][] = [];
  const cols = new Set<number>();
  const diag1 = new Set<number>();
  const diag2 = new Set<number>();

  function cellKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  function getConflicts(row: number, col: number): [number, number][] {
    const conflicts: [number, number][] = [];
    for (const [qr, qc] of queens) {
      if (qr === row || qc === col || Math.abs(qr - row) === Math.abs(qc - col)) {
        conflicts.push([qr, qc]);
      }
    }
    return conflicts;
  }

  function buildHighlights(
    current: [number, number] | null,
    conflictCells: [number, number][]
  ): Partial<Record<string, ChessboardHighlightKind>> {
    const highlights: Partial<Record<string, ChessboardHighlightKind>> = {};
    for (const [r, c] of queens) {
      highlights[cellKey(r, c)] = 'queen';
    }
    if (current) {
      highlights[cellKey(current[0], current[1])] =
        conflictCells.length > 0 ? 'conflict' : 'current';
    }
    for (const [r, c] of conflictCells) {
      highlights[cellKey(r, c)] = 'conflict';
    }
    return highlights;
  }

  steps.push({
    kind: 'chessboard',
    size: n,
    queens: [],
    current: null,
    conflicts: [],
    highlights: {},
    phase: 'placing',
    description: `初始化 ${n}×${n} 棋盘，开始逐行放置皇后。`,
  });

  function backtrack(row: number): boolean {
    if (row === n) {
      const highlights: Partial<Record<string, ChessboardHighlightKind>> = {};
      for (const [r, c] of queens) {
        highlights[cellKey(r, c)] = 'queen';
      }
      steps.push({
        kind: 'chessboard',
        size: n,
        queens: [...queens],
        current: null,
        conflicts: [],
        highlights,
        phase: 'done',
        description: `找到解！已成功在 ${n}×${n} 棋盘上放置 ${n} 个皇后。`,
      });
      return true;
    }

    for (let col = 0; col < n; col++) {
      const conflicts = getConflicts(row, col);

      steps.push({
        kind: 'chessboard',
        size: n,
        queens: [...queens],
        current: [row, col],
        conflicts,
        highlights: buildHighlights([row, col], conflicts),
        phase: 'placing',
        description: `尝试在 (${row}, ${col}) 放置皇后${conflicts.length > 0 ? `，与 ${conflicts.length} 个皇后冲突` : '，位置安全'}`,
      });

      if (conflicts.length > 0) {
        continue;
      }

      queens.push([row, col]);
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);

      steps.push({
        kind: 'chessboard',
        size: n,
        queens: [...queens],
        current: [row, col],
        conflicts: [],
        highlights: buildHighlights(null, []),
        phase: 'placing',
        description: `在 (${row}, ${col}) 放置皇后，继续处理下一行。`,
      });

      if (backtrack(row + 1)) {
        return true;
      }

      queens.pop();
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);

      steps.push({
        kind: 'chessboard',
        size: n,
        queens: [...queens],
        current: [row, col],
        conflicts: [],
        highlights: buildHighlights(null, []),
        phase: 'backtracking',
        description: `回溯：移除 (${row}, ${col}) 的皇后，尝试下一列。`,
      });
    }

    return false;
  }

  backtrack(0);

  if (steps.length > 0 && steps[steps.length - 1].phase !== 'done') {
    steps.push({
      kind: 'chessboard',
      size: n,
      queens: [],
      current: null,
      conflicts: [],
      highlights: {},
      phase: 'done',
      description: `${n}×${n} 棋盘上无解。`,
    });
  }

  return steps;
}

export const nQueensRegistry: AlgorithmDefinition = {
  id: 'n-queens',
  slug: 'n-queens',
  title: 'N 皇后',
  description: '在 N×N 棋盘上放置 N 个皇后，使它们互不攻击。',
  categories: ['backtracking'],
  visualization: 'chessboard',
  createSteps: () => buildNQueensSteps(getNQueensSize()),
};
