import type { AlgorithmDefinition, AlgorithmStep, DpHighlightKind } from '@/types/algorithm';
import { createDpTableStep } from '@/algorithms/shared/dp/createDpStep';
import { getDpInvestmentInput } from '@/algorithms/shared/inputs';

function buildInvestmentSteps(n: number, M: number, returns: number[][]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];

  const dp: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    Array.from<number | null>({ length: M + 2 }).fill(null)
  );

  const rowLabels = ['', ...returns.map((r, i) => `投资${i + 1}\n(r:${r.join(',')})`)];
  const colLabels = ['', ...Array.from({ length: M + 1 }, (_, j) => String(j))];

  for (let j = 0; j <= M + 1; j++) dp[0][j] = 0;
  for (let i = 0; i <= n; i++) dp[i][0] = 0;

  steps.push(
    createDpTableStep({
      table: dp,
      rowLabels,
      colLabels,
      phase: 'init',
      description: `投资问题：${n} 项投资，总资源 = ${M}。初始化边界为 0。`,
    })
  );

  for (let i = 1; i <= n; i++) {
    const ret = returns[i - 1];
    for (let j = 1; j <= M + 1; j++) {
      let bestK = 0;
      let bestValue = -Infinity;
      const deps: Partial<Record<string, DpHighlightKind>> = {};

      for (let k = 0; k <= j - 1; k++) {
        const candidate = (ret[k] ?? 0) + (dp[i - 1]?.[j - k] ?? 0);
        if (candidate > bestValue) {
          bestValue = candidate;
          bestK = k;
        }
      }

      if (i > 1 && j > bestK) deps[`${i - 1},${j - bestK}`] = 'dependency';
      if (i > 1 && bestK > 0 && j > 0) {
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
          description: `投资${i}、资源 ${j - 1}：最优分配 ${bestK} 给投资${i}(收益=${ret[bestK]})，剩余 ${j - 1 - bestK} 给前 ${i - 1} 项(收益=${dp[i - 1]?.[j - bestK]}) → 总收益 = ${bestValue}`,
        })
      );

      dp[i][j] = bestValue;
    }
  }

  // Backtrack
  const backtrackPath: [number, number][] = [];
  let bi = n;
  let bj = M + 1;
  while (bi > 0 && bj > 0) {
    const ret = returns[bi - 1];
    let foundK = 0;
    for (let k = 0; k <= bj - 1; k++) {
      const candidate = (ret[k] ?? 0) + (dp[bi - 1]?.[bj - k] ?? 0);
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
        description: `回溯：投资${bi} 分配 ${foundK} 资源(收益=${ret[foundK]})，剩余 ${bj - 1 - foundK} 资源供前 ${bi - 1} 项投资`,
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
      description: `投资问题求解完成！最大总收益 = ${dp[n]?.[M + 1]}`,
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
