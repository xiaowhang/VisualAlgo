import { z } from 'zod';

export const DP_SNAPSHOT_FORMAT_VERSION = 1;

const dpLcsSchema = z
  .object({
    formatVersion: z.number().int().optional(),
    type: z.literal('lcs'),
    x: z.string().min(1, '字符串 X 不能为空。'),
    y: z.string().min(1, '字符串 Y 不能为空。'),
  })
  .strict();

const dpKnapsackItemSchema = z.object({
  weight: z.number().int().positive('重量必须为正整数。'),
  value: z.number().int().positive('价值必须为正整数。'),
});

const dpKnapsackSchema = z
  .object({
    formatVersion: z.number().int().optional(),
    type: z.literal('knapsack'),
    capacity: z.number().int().positive('背包容量必须为正整数。'),
    items: z.array(dpKnapsackItemSchema).min(1, '至少需要 1 个物品。'),
  })
  .strict();

const dpInvestmentSchema = z
  .object({
    formatVersion: z.number().int().optional(),
    type: z.literal('investment'),
    investmentCount: z.number().int().min(2, '投资项目数至少为 2。'),
    resources: z.number().int().min(3, '资源总量至少为 3。'),
    returns: z.array(z.array(z.number().int().min(0))).min(1, '收益矩阵不能为空。'),
  })
  .strict();

const dpSnapshotSchema = z.union([dpLcsSchema, dpKnapsackSchema, dpInvestmentSchema]);

function getFirstIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? '输入数据格式无效。';
}

export type DpImportResult =
  | { ok: true; type: 'lcs'; x: string; y: string }
  | { ok: true; type: 'knapsack'; capacity: number; items: { weight: number; value: number }[] }
  | {
      ok: true;
      type: 'investment';
      investmentCount: number;
      resources: number;
      returns: number[][];
    }
  | { ok: false; message: string };

export function parseDpImportJson(rawText: string): DpImportResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, message: 'JSON 解析失败，请检查文件内容。' };
  }

  const parseResult = dpSnapshotSchema.safeParse(parsed);

  if (!parseResult.success) {
    return { ok: false, message: getFirstIssueMessage(parseResult.error) };
  }

  const data = parseResult.data;

  if (data.type === 'lcs') {
    return { ok: true, type: 'lcs', x: data.x, y: data.y };
  }

  if (data.type === 'knapsack') {
    return { ok: true, type: 'knapsack', capacity: data.capacity, items: data.items };
  }

  return {
    ok: true,
    type: 'investment',
    investmentCount: data.investmentCount,
    resources: data.resources,
    returns: data.returns,
  };
}
