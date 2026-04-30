import type { AlgorithmDefinition, AlgorithmStep, DpHighlightKind } from '@/types/algorithm';
import { createDpTableStep } from '@/algorithms/shared/dp/createDpStep';
import { getDpKnapsackInput } from '@/algorithms/shared/inputs';

interface KnapsackItem {
  weight: number;
  value: number;
}

function buildKnapsackSteps(capacity: number, items: KnapsackItem[]): AlgorithmStep[] {
  const n = items.length;
  const steps: AlgorithmStep[] = [];

  const dp: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    Array.from<number | null>({ length: capacity + 1 }).fill(null)
  );

  const rowLabels = ['', ...items.map((it, i) => `物品${i + 1}\n(w=${it.weight}, v=${it.value})`)];
  const colLabels = Array.from({ length: capacity + 1 }, (_, j) => String(j));

  for (let j = 0; j <= capacity; j++) dp[0][j] = 0;
  for (let i = 0; i <= n; i++) dp[i][0] = 0;

  const itemInfo = items.map((it, i) => `物品${i + 1}(w=${it.weight},v=${it.value})`).join('，');

  steps.push(
    createDpTableStep({
      table: dp,
      rowLabels,
      colLabels,
      phase: 'init',
      description: `0/1 背包问题：${n} 个物品 [${itemInfo}]，背包容量 = ${capacity}。初始化边界为 0。`,
    })
  );

  for (let i = 1; i <= n; i++) {
    const { weight: w, value: v } = items[i - 1];
    for (let j = 1; j <= capacity; j++) {
      const deps: Partial<Record<string, DpHighlightKind>> = {};
      if (i > 1) deps[`${i - 1},${j}`] = 'dependency';

      const noPick = dp[i - 1]?.[j] ?? 0;
      if (w <= j) {
        if (i > 1 && j > w) deps[`${i - 1},${j - w}`] = 'dependency';
        const pick = (dp[i - 1]?.[j - w] ?? 0) + v;
        const best = Math.max(noPick, pick);
        dp[i][j] = best;

        steps.push(
          createDpTableStep({
            table: dp,
            rowLabels,
            colLabels,
            currentCell: [i, j],
            highlights: deps,
            phase: 'compute',
            description: `物品${i}(w=${w},v=${v})：容量 ${j}>=${w}。不选=${noPick}，选=${pick} → dp[${i}][${j}] = max(${noPick}, ${pick}) = ${best}`,
          })
        );
      } else {
        dp[i][j] = noPick;

        steps.push(
          createDpTableStep({
            table: dp,
            rowLabels,
            colLabels,
            currentCell: [i, j],
            highlights: deps,
            phase: 'compute',
            description: `物品${i}(w=${w},v=${v})：容量 ${j}<${w}，无法放入 → dp[${i}][${j}] = dp[${i - 1}][${j}] = ${noPick}`,
          })
        );
      }
    }
  }

  // Backtrack
  const backtrackPath: [number, number][] = [];
  let bi = n;
  let bj = capacity;
  while (bi > 0 && bj > 0) {
    const highlights: Partial<Record<string, DpHighlightKind>> = {};
    for (const [r, c] of backtrackPath) highlights[`${r},${c}`] = 'backtrack';

    if (dp[bi]?.[bj] !== dp[bi - 1]?.[bj]) {
      backtrackPath.push([bi, bj]);
      highlights[`${bi},${bj}`] = 'current';
      const it = items[bi - 1];
      steps.push(
        createDpTableStep({
          table: dp,
          rowLabels,
          colLabels,
          currentCell: [bi, bj],
          highlights,
          backtrackPath: [...backtrackPath],
          phase: 'backtrack',
          description: `回溯：选择了物品${bi}(w=${it.weight},v=${it.value})，剩余容量 ${bj - it.weight} → 走向 (${bi - 1},${bj - it.weight})`,
        })
      );
      bj -= it.weight;
    } else {
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
          description: `回溯：未选物品${bi}，走向 (${bi - 1},${bj})`,
        })
      );
    }
    bi--;
  }

  const finalHighlights: Partial<Record<string, DpHighlightKind>> = {};
  for (const [r, c] of backtrackPath) finalHighlights[`${r},${c}`] = 'backtrack';
  const selectedItems = [...backtrackPath]
    .reverse()
    .map(([r]) => `物品${r}`)
    .join('、');

  steps.push(
    createDpTableStep({
      table: dp,
      rowLabels,
      colLabels,
      highlights: finalHighlights,
      backtrackPath: [...backtrackPath],
      phase: 'done',
      description: `背包问题求解完成！最大价值 = ${dp[n]?.[capacity]}，选择了：${selectedItems || '无'}`,
    })
  );

  return steps;
}

export const knapsackRegistry: AlgorithmDefinition = {
  id: 'knapsack',
  slug: 'knapsack',
  title: '0/1 背包问题',
  description: '使用动态规划求解 0/1 背包问题的最优选择方案。',
  category: 'dynamic-programming',
  visualization: 'dp-table',
  createSteps: () => buildKnapsackSteps(getDpKnapsackInput().capacity, getDpKnapsackInput().items),
};
