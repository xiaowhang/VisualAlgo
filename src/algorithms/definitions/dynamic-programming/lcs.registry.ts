import type { AlgorithmDefinition, AlgorithmStep, DpHighlightKind } from '@/types/algorithm';
import { createDpTableStep } from '@/algorithms/shared/dp/createDpStep';
import { getDpLcsStrings } from '@/algorithms/shared/inputs';

function buildLcsSteps(x: string, y: string): AlgorithmStep[] {
  const m = x.length;
  const n = y.length;
  const steps: AlgorithmStep[] = [];

  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    Array.from<number | null>({ length: n + 1 }).fill(null)
  );

  const rowLabels = ['', ...x.split('')];
  const colLabels = ['', ...y.split('')];

  for (let j = 0; j <= n; j++) dp[0][j] = 0;
  for (let i = 0; i <= m; i++) dp[i][0] = 0;

  steps.push(
    createDpTableStep({
      table: dp,
      rowLabels,
      colLabels,
      phase: 'init',
      description: [
        `X = "${x}"\nY = "${y}"`,
        `dp[i][j] 表示 X 前 i 个字符与 Y 前 j 个字符的 LCS 长度。`,
        `若 X[i] = Y[j]：\ndp[i][j] = dp[i-1][j-1] + 1`,
        `若 X[i] ≠ Y[j]：\ndp[i][j] = max(dp[i-1][j], dp[i][j-1])`,
        `初始化第 0 行和第 0 列为 0。`,
      ].join('\n'),
    })
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const charX = x[i - 1];
      const charY = y[j - 1];
      const deps: Partial<Record<string, DpHighlightKind>> = {};

      if (charX === charY) {
        if (i > 1 && j > 1) deps[`${i - 1},${j - 1}`] = 'dependency';
      } else {
        if (i > 1) deps[`${i - 1},${j}`] = 'dependency';
        if (j > 1) deps[`${i},${j - 1}`] = 'dependency';
      }

      const match = charX === charY;
      const prevDiag = dp[i - 1]?.[j - 1] ?? 0;
      const prevUp = dp[i - 1]?.[j] ?? 0;
      const prevLeft = dp[i]?.[j - 1] ?? 0;

      let description: string;
      if (match) {
        description = [
          `X[${i}]='${charX}' = Y[${j}]='${charY}'`,
          ``,
          `dp[${i}][${j}]`,
          `= dp[${i - 1}][${j - 1}] + 1`,
          `= ${prevDiag + 1}`,
        ].join('\n');
      } else {
        const best = Math.max(prevUp, prevLeft);
        description = [
          `X[${i}]='${charX}' ≠ Y[${j}]='${charY}'`,
          ``,
          `dp[${i}][${j}] `,
          `= max(上方 ${prevUp}, 左方 ${prevLeft})`,
          `= ${best}`,
        ].join('\n');
      }

      steps.push(
        createDpTableStep({
          table: dp,
          rowLabels,
          colLabels,
          currentCell: [i, j],
          highlights: deps,
          phase: 'compute',
          description,
        })
      );

      if (match) {
        dp[i][j] = prevDiag + 1;
      } else {
        dp[i][j] = Math.max(prevUp, prevLeft);
      }
    }
  }

  // Backtrack
  const backtrackPath: [number, number][] = [];
  let bi = m;
  let bj = n;
  while (bi > 0 && bj > 0) {
    const highlights: Partial<Record<string, DpHighlightKind>> = {};
    for (const [r, c] of backtrackPath) highlights[`${r},${c}`] = 'backtrack';
    highlights[`${bi},${bj}`] = 'current';

    if (x[bi - 1] === y[bj - 1]) {
      backtrackPath.push([bi, bj]);
      const lcsSoFar = [...backtrackPath]
        .reverse()
        .map(([r]) => x[r - 1])
        .join('');

      steps.push(
        createDpTableStep({
          table: dp,
          rowLabels,
          colLabels,
          currentCell: [bi, bj],
          highlights,
          backtrackPath: [...backtrackPath],
          phase: 'backtrack',
          description: [
            `X[${bi}]='${x[bi - 1]}' = Y[${bj}]='${y[bj - 1]}'，匹配！`,
            `将 '${x[bi - 1]}' 加入 LCS`,
            `当前 LCS = "${lcsSoFar}"`,
            `移向左上方 (${bi - 1}, ${bj - 1})`,
          ].join('\n'),
        })
      );
      bi--;
      bj--;
    } else if ((dp[bi - 1]?.[bj] ?? 0) >= (dp[bi]?.[bj - 1] ?? 0)) {
      steps.push(
        createDpTableStep({
          table: dp,
          rowLabels,
          colLabels,
          currentCell: [bi, bj],
          highlights,
          backtrackPath: [...backtrackPath],
          phase: 'backtrack',
          description: [
            `X[${bi}]='${x[bi - 1]}' ≠ Y[${bj}]='${y[bj - 1]}'`,
            `上方 dp[${bi - 1}][${bj}]=${dp[bi - 1]?.[bj]} ≥ 左方 dp[${bi}][${bj - 1}]=${dp[bi]?.[bj - 1]}`,
            `移向上方 (${bi - 1}, ${bj})`,
          ].join('\n'),
        })
      );
      bi--;
    } else {
      steps.push(
        createDpTableStep({
          table: dp,
          rowLabels,
          colLabels,
          currentCell: [bi, bj],
          highlights,
          backtrackPath: [...backtrackPath],
          phase: 'backtrack',
          description: [
            `X[${bi}]='${x[bi - 1]}' ≠ Y[${bj}]='${y[bj - 1]}'`,
            `左方 dp[${bi}][${bj - 1}]=${dp[bi]?.[bj - 1]} > 上方 dp[${bi - 1}][${bj}]=${dp[bi - 1]?.[bj]}`,
            `移向左方 (${bi}, ${bj - 1})`,
          ].join('\n'),
        })
      );
      bj--;
    }
  }

  const finalPath = [...backtrackPath].reverse();
  const finalHighlights: Partial<Record<string, DpHighlightKind>> = {};
  for (const [r, c] of finalPath) finalHighlights[`${r},${c}`] = 'backtrack';
  const lcsStr = finalPath.map(([r]) => x[r - 1]).join('');

  steps.push(
    createDpTableStep({
      table: dp,
      rowLabels,
      colLabels,
      highlights: finalHighlights,
      backtrackPath: finalPath,
      phase: 'done',
      description: [
        `LCS 求解完成！`,
        `最长公共子序列长度 = ${dp[m]?.[n]}`,
        `LCS = "${lcsStr}"`,
      ].join('\n'),
    })
  );

  return steps;
}

export const lcsRegistry: AlgorithmDefinition = {
  id: 'lcs',
  slug: 'lcs',
  title: '最长公共子序列 (LCS)',
  description: '使用动态规划求两个字符串的最长公共子序列。',
  categories: ['dynamic-programming'],
  visualization: 'dp-table',
  createSteps: () => buildLcsSteps(getDpLcsStrings().x, getDpLcsStrings().y),
};
