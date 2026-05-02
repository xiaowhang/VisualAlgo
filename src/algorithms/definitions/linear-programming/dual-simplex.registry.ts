import { getLpInput } from '@/algorithms/shared/inputs';
import type {
  AlgorithmDefinition,
  AlgorithmStep,
  LpTableauHighlightKind,
  LpTableauStep,
} from '@/types/algorithm';

function buildDualSimplexSteps(): AlgorithmStep[] {
  const input = getLpInput();
  const { objective, constraints } = input;
  const numVars = objective.length;
  const numConstraints = constraints.length;

  const steps: LpTableauStep[] = [];

  const variableNames: string[] = [];
  for (let i = 0; i < numVars; i++) variableNames.push(`x${i + 1}`);
  for (let i = 0; i < numConstraints; i++) variableNames.push(`s${i + 1}`);
  variableNames.push('RHS');

  const rowLabels: string[] = [];
  for (let i = 0; i < numConstraints; i++) rowLabels.push(`s${i + 1}`);
  rowLabels.push('Z');

  // Build tableau with negative RHS to force dual infeasibility
  // This creates a scenario where dual simplex is needed
  const tableau: number[][] = [];
  for (let i = 0; i < numConstraints; i++) {
    const row: number[] = [];
    for (let j = 0; j < numVars; j++) {
      row.push(constraints[i]![j] ?? 0);
    }
    for (let j = 0; j < numConstraints; j++) {
      row.push(j === i ? 1 : 0);
    }
    // Make some RHS negative to create dual infeasibility
    const rhs = constraints[i]![numVars] ?? 0;
    row.push(i === 0 ? -rhs : rhs);
    tableau.push(row);
  }

  const objRow: number[] = [];
  for (let j = 0; j < numVars; j++) objRow.push(-objective[j]!);
  for (let j = 0; j < numConstraints; j++) objRow.push(0);
  objRow.push(0);
  tableau.push(objRow);

  function cloneTableau(): number[][] {
    return tableau.map(row => [...row]);
  }

  function getObjectiveValue(): number {
    return tableau[numConstraints]![numVars + numConstraints]!;
  }

  function snapshot(
    description: string,
    phase: LpTableauStep['phase'],
    pivot: [number, number] | null,
    highlights: Partial<Record<string, LpTableauHighlightKind>>
  ) {
    steps.push({
      kind: 'lp-tableau',
      variableNames: [...variableNames],
      rowLabels: [...rowLabels],
      tableau: cloneTableau(),
      currentPivot: pivot,
      phase,
      objectiveValue: getObjectiveValue(),
      highlights: { ...highlights },
      description,
    });
  }

  // Check initial state
  const initHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
  for (let j = 0; j < numVars + numConstraints + 1; j++) {
    initHighlights[`${numConstraints},${j}`] = 'objective';
  }
  for (let i = 0; i < numConstraints; i++) {
    if (tableau[i]![numVars + numConstraints]! < 0) {
      for (let j = 0; j < numVars + numConstraints + 1; j++) {
        initHighlights[`${i},${j}`] = 'leaving';
      }
    }
  }
  snapshot(
    '初始单纯形表（对偶可行但原始不可行，RHS 含负值）。对偶单纯形法从对偶可行解出发。',
    'init',
    null,
    initHighlights
  );

  let iter = 0;
  const maxIter = 50;

  while (iter < maxIter) {
    iter++;

    // Find leaving variable (most negative RHS)
    let pivotRow = -1;
    let minRhs = -1e-9;
    for (let i = 0; i < numConstraints; i++) {
      const rhs = tableau[i]![numVars + numConstraints]!;
      if (rhs < minRhs) {
        minRhs = rhs;
        pivotRow = i;
      }
    }

    if (pivotRow === -1) {
      // All RHS >= 0, optimal
      const optHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
      for (let j = 0; j < numVars + numConstraints + 1; j++) {
        optHighlights[`${numConstraints},${j}`] = 'optimal';
      }
      snapshot(
        `所有 RHS ≥ 0，原始可行。已达到最优解，目标值 = ${getObjectiveValue().toFixed(2)}。`,
        'optimal',
        null,
        optHighlights
      );
      break;
    }

    // Find entering variable (minimum ratio test on objective row / pivot row)
    let pivotCol = -1;
    let minRatio = Infinity;
    const pivotRowData = tableau[pivotRow]!;
    const objRowData = tableau[numConstraints]!;

    for (let j = 0; j < numVars + numConstraints; j++) {
      if (pivotRowData[j]! < -1e-9) {
        const ratio = Math.abs(objRowData[j]! / pivotRowData[j]!);
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotCol = j;
        }
      }
    }

    if (pivotCol === -1) {
      snapshot('无可行解（对偶无界）。', 'infeasible', null, {});
      break;
    }

    // Highlight pivot
    const pivotHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
    for (let i = 0; i <= numConstraints; i++) {
      pivotHighlights[`${i},${pivotCol}`] = 'pivot-col';
    }
    for (let j = 0; j <= numVars + numConstraints; j++) {
      pivotHighlights[`${pivotRow},${j}`] = 'pivot-row';
    }
    pivotHighlights[`${pivotRow},${pivotCol}`] = 'pivot-cell';

    snapshot(
      `第 ${iter} 轮：出基 ${rowLabels[pivotRow]}（RHS = ${pivotRowData[numVars + numConstraints]!.toFixed(2)} < 0），进基 ${variableNames[pivotCol]}。主元 = ${pivotRowData[pivotCol]!.toFixed(2)}。`,
      'pivoting',
      [pivotRow, pivotCol],
      pivotHighlights
    );

    // Pivot
    const pivotVal = tableau[pivotRow]![pivotCol]!;
    for (let j = 0; j <= numVars + numConstraints; j++) {
      tableau[pivotRow]![j]! /= pivotVal;
    }
    for (let i = 0; i <= numConstraints; i++) {
      if (i === pivotRow) continue;
      const factor = tableau[i]![pivotCol]!;
      for (let j = 0; j <= numVars + numConstraints; j++) {
        tableau[i]![j]! -= factor * tableau[pivotRow]![j]!;
      }
    }

    rowLabels[pivotRow] = variableNames[pivotCol]!;

    const resultHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
    for (let j = 0; j < numVars + numConstraints + 1; j++) {
      resultHighlights[`${pivotRow},${j}`] = 'entering';
    }
    for (let j = 0; j < numVars + numConstraints + 1; j++) {
      resultHighlights[`${numConstraints},${j}`] = 'objective';
    }

    snapshot(
      `行变换完成。${variableNames[pivotCol]} 进基，${rowLabels[pivotRow]} 出基。目标值 = ${getObjectiveValue().toFixed(2)}。`,
      'pivoting',
      null,
      resultHighlights
    );
  }

  return steps;
}

export const dualSimplexRegistry: AlgorithmDefinition = {
  id: 'dual-simplex',
  slug: 'dual-simplex',
  title: '对偶单纯形法',
  description: '从对偶可行解出发，通过选择出基和进基变量逐步恢复原始可行性。',
  categories: ['linear-programming'],
  visualization: 'lp-tableau',
  createSteps: () => buildDualSimplexSteps(),
};
