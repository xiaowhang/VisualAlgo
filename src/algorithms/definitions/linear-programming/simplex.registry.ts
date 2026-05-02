import { getLpInput } from '@/algorithms/shared/inputs';
import type {
  AlgorithmDefinition,
  AlgorithmStep,
  LpTableauHighlightKind,
  LpTableauStep,
} from '@/types/algorithm';

function buildSimplexSteps(): AlgorithmStep[] {
  const input = getLpInput();
  const { objective, constraints } = input;
  const numVars = objective.length;
  const numConstraints = constraints.length;

  const steps: LpTableauStep[] = [];

  // Build initial tableau
  // Columns: x1, x2, ..., xn, s1, s2, ..., sm, RHS
  // Rows: constraint rows + objective row
  const variableNames: string[] = [];
  for (let i = 0; i < numVars; i++) variableNames.push(`x${i + 1}`);
  for (let i = 0; i < numConstraints; i++) variableNames.push(`s${i + 1}`);
  variableNames.push('RHS');

  const rowLabels: string[] = [];
  for (let i = 0; i < numConstraints; i++) rowLabels.push(`s${i + 1}`);
  rowLabels.push('Z');

  // Initialize tableau
  const tableau: number[][] = [];
  for (let i = 0; i < numConstraints; i++) {
    const row: number[] = [];
    for (let j = 0; j < numVars; j++) {
      row.push(constraints[i]![j] ?? 0);
    }
    // Slack variables
    for (let j = 0; j < numConstraints; j++) {
      row.push(j === i ? 1 : 0);
    }
    // RHS
    row.push(constraints[i]![numVars] ?? 0);
    tableau.push(row);
  }

  // Objective row (negated for maximization)
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

  // Initial tableau
  const initHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
  for (let j = 0; j < numVars + numConstraints + 1; j++) {
    initHighlights[`${numConstraints},${j}`] = 'objective';
  }
  snapshot('初始单纯形表。目标函数行已取反。', 'init', null, initHighlights);

  let iter = 0;
  const maxIter = 50;

  while (iter < maxIter) {
    iter++;

    // Find pivot column (most negative in objective row)
    const objRowData = tableau[numConstraints]!;
    let pivotCol = -1;
    let minVal = -1e-9; // tolerance
    for (let j = 0; j < numVars + numConstraints; j++) {
      if (objRowData[j]! < minVal) {
        minVal = objRowData[j]!;
        pivotCol = j;
      }
    }

    if (pivotCol === -1) {
      // Optimal
      const optHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
      for (let j = 0; j < numVars + numConstraints + 1; j++) {
        optHighlights[`${numConstraints},${j}`] = 'optimal';
      }
      snapshot(
        `所有检验数 ≥ 0，已达到最优解。目标函数值 = ${getObjectiveValue().toFixed(2)}。`,
        'optimal',
        null,
        optHighlights
      );
      break;
    }

    // Find pivot row (minimum ratio test)
    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 0; i < numConstraints; i++) {
      const aij = tableau[i]![pivotCol]!;
      const bi = tableau[i]![numVars + numConstraints]!;
      if (aij > 1e-9) {
        const ratio = bi / aij;
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }

    if (pivotRow === -1) {
      snapshot('无可行解（无界问题）。', 'unbounded', null, {});
      break;
    }

    // Highlight entering variable
    const enteringHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
    for (let i = 0; i <= numConstraints; i++) {
      enteringHighlights[`${i},${pivotCol}`] = 'pivot-col';
    }
    for (let j = 0; j <= numVars + numConstraints; j++) {
      enteringHighlights[`${pivotRow},${j}`] = 'pivot-row';
    }
    enteringHighlights[`${pivotRow},${pivotCol}`] = 'pivot-cell';

    snapshot(
      `第 ${iter} 轮：进基变量 ${variableNames[pivotCol]}，出基变量 ${rowLabels[pivotRow]}。主元 = ${tableau[pivotRow]![pivotCol]!.toFixed(2)}。`,
      'pivoting',
      [pivotRow, pivotCol],
      enteringHighlights
    );

    // Pivot operation
    const pivotVal = tableau[pivotRow]![pivotCol]!;

    // Scale pivot row
    for (let j = 0; j <= numVars + numConstraints; j++) {
      tableau[pivotRow]![j]! /= pivotVal;
    }

    // Eliminate other rows
    for (let i = 0; i <= numConstraints; i++) {
      if (i === pivotRow) continue;
      const factor = tableau[i]![pivotCol]!;
      for (let j = 0; j <= numVars + numConstraints; j++) {
        tableau[i]![j]! -= factor * tableau[pivotRow]![j]!;
      }
    }

    // Update row label
    rowLabels[pivotRow] = variableNames[pivotCol]!;

    // Show result
    const resultHighlights: Partial<Record<string, LpTableauHighlightKind>> = {};
    for (let j = 0; j < numVars + numConstraints + 1; j++) {
      resultHighlights[`${pivotRow},${j}`] = 'entering';
    }
    for (let j = 0; j < numVars + numConstraints + 1; j++) {
      resultHighlights[`${numConstraints},${j}`] = 'objective';
    }

    snapshot(
      `行变换完成。${variableNames[pivotCol]} 进基，当前目标值 = ${getObjectiveValue().toFixed(2)}。`,
      'pivoting',
      null,
      resultHighlights
    );
  }

  return steps;
}

export const simplexRegistry: AlgorithmDefinition = {
  id: 'simplex',
  slug: 'simplex',
  title: '单纯形法',
  description: '标准单纯形法，通过选择进基和出基变量迭代求解线性规划问题。',
  category: 'linear-programming',
  visualization: 'lp-tableau',
  createSteps: () => buildSimplexSteps(),
};
