import type { AlgorithmDefinition, AlgorithmStep, DpHighlightKind } from '@/types/algorithm';
import { createDpTableStep } from '@/algorithms/shared/dp/createDpStep';
import { getDpInvestmentInput } from '@/algorithms/shared/inputs';

function buildInvestmentSteps(n: number, M: number, returns: number[][]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];

  const dp: (number | null)[][] = Array.from({ length: n }, () =>
    Array.from<number | null>({ length: M + 1 }).fill(null)
  );

  const rowLabels = Array.from({ length: n }, (_, i) => `投资${i + 1}`);
  const colLabels = Array.from({ length: M + 1 }, (_, j) => String(j));

  // Init first row
  for (let j = 0; j <= M; j++) {
    dp[0][j] = returns[0]?.[j] ?? 0;
  }

  steps.push(
    createDpTableStep({
      table: dp,
      rowLabels,
      colLabels,
      phase: 'init',
      description: `投资问题：${n} 项投资，总资源 = ${M}。第一行：投资 1 在各资源量下的直接收益。`,
    })
  );

  // Fill remaining rows
  for (let i = 1; i < n; i++) {
    for (let j = 0; j <= M; j++) {
      let bestK = 0;
      let bestValue = -Infinity;
      const deps: Partial<Record<string, DpHighlightKind>> = {};

      for (let k = 0; k <= j; k++) {
        const candidate = (returns[i]?.[k] ?? 0) + (dp[i - 1]?.[j - k] ?? 0);
        if (candidate > bestValue) {
          bestValue = candidate;
          bestK = k;
        }
      }

      deps[`${i - 1},${j - bestK}`] = 'dependency';
      if (bestK > 0 && j - bestK !== j) {
        deps[`${i - 1},${j}`] = 'dependency';
      }

      steps.push(
        createDpTableStep({
          table: dp,
          rowLabels,
          colLabels,
          currentCell: [i, j],
          highlights: deps,
          phase: 'compute',
          description: `投资${i + 1}、资源 ${j}：最优分配 ${bestK} 给投资${i + 1}(收益=${returns[i]?.[bestK]})，剩余 ${j - bestK} 给前 ${i} 项(收益=${dp[i - 1]?.[j - bestK]}) → 总收益 = ${bestValue}`,
        })
      );

      dp[i][j] = bestValue;
    }
  }

  // Backtrack
  const backtrackPath: [number, number][] = [];
  let bi = n - 1;
  let bj = M;
  while (bi >= 0) {
    let foundK = 0;
    for (let k = 0; k <= bj; k++) {
      const candidate = (returns[bi]?.[k] ?? 0) + ((bi > 0 ? dp[bi - 1]?.[bj - k] : 0) ?? 0);
      if (candidate === dp[bi]?.[bj]) {
        foundK = k;
        break;
      }
    }

    backtrackPath.push([bi, bj]);
    const highlights: Partial<Record<string, DpHighlightKind>> = {};
    for (const [r, c] of backtrackPath) highlights[`${r},${c}`] = 'backtrack';
    highlights[`${bi},${bj}`] = 'current';

    steps.push(
      createDpTableStep({
        table: dp,
        rowLabels,
        colLabels,
        currentCell: [bi, bj],
        highlights,
        backtrackPath: [...backtrackPath],
        phase: 'backtrack',
        description: `回溯：投资${bi + 1} 分配 ${foundK} 资源(收益=${returns[bi]?.[foundK]})，剩余 ${bj - foundK} 资源供前 ${bi} 项投资`,
      })
    );

    bj -= foundK;
    bi--;
  }

  const finalHighlights: Partial<Record<string, DpHighlightKind>> = {};
  for (const [r, c] of backtrackPath) finalHighlights[`${r},${c}`] = 'backtrack';

  steps.push(
    createDpTableStep({
      table: dp,
      rowLabels,
      colLabels,
      highlights: finalHighlights,
      backtrackPath: [...backtrackPath],
      phase: 'done',
      description: `投资问题求解完成！最大总收益 = ${dp[n - 1]?.[M]}`,
    })
  );

  return steps;
}

export const investmentRegistry: AlgorithmDefinition = {
  id: 'investment',
  slug: 'investment',
  title: '投资问题',
  description: '使用动态规划求解多阶段投资的最优资源分配方案。',
  category: 'dynamic-programming',
  visualization: 'dp-table',
  createSteps: () =>
    buildInvestmentSteps(
      getDpInvestmentInput().investmentCount,
      getDpInvestmentInput().resources,
      getDpInvestmentInput().returns
    ),
};
