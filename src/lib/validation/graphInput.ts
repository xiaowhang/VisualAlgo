import { z } from 'zod';
import type { GraphEdge } from '@/types/algorithm';

export const GRAPH_SNAPSHOT_FORMAT_VERSION = 2;

const graphSnapshotSchema = z
  .object({
    formatVersion: z.number().int().optional(),
    nodes: z.array(z.string().min(1)).min(2, '至少需要 2 个节点。').max(26, '最多支持 26 个节点。'),
    edges: z.array(
      z.union([
        z.tuple([z.string().min(1), z.string().min(1)]),
        z.tuple([z.string().min(1), z.string().min(1), z.number()]),
      ])
    ),
    startNode: z.string().min(1).optional(),
  })
  .strict();

function getFirstIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? '输入数据格式无效。';
}

export function parseGraphImportJson(
  rawText: string
):
  | { ok: true; nodeIds: string[]; edges: GraphEdge[]; startNode: string }
  | { ok: false; message: string } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, message: 'JSON 解析失败，请检查文件内容。' };
  }

  if (Array.isArray(parsed)) {
    return {
      ok: false,
      message:
        'JSON 格式已升级，请使用对象格式：{ "formatVersion": 2, "nodes": ["A", "B"], "edges": [["A", "B"]] }。',
    };
  }

  const parseResult = graphSnapshotSchema.safeParse(parsed);

  if (!parseResult.success) {
    return { ok: false, message: getFirstIssueMessage(parseResult.error) };
  }

  const { nodes: nodeIds, edges: edgeTuples, startNode } = parseResult.data;
  const edges: GraphEdge[] = edgeTuples.map(tuple => {
    const [source, target, weight] = tuple;
    return weight != null ? { source, target, weight } : { source, target };
  });

  return {
    ok: true,
    nodeIds,
    edges,
    startNode: startNode ?? nodeIds[0] ?? 'A',
  };
}
