import { z } from 'zod';
import type { GraphEdge, GraphNode } from '@/types/algorithm';

export const TREE_SNAPSHOT_FORMAT_VERSION = 2;
export const TREE_MIN_NODES = 3;
export const TREE_MAX_NODES = 32;
export const TREE_VALUE_MIN = 1;
export const TREE_VALUE_MAX = 99;

const treeSnapshotSchema = z
  .object({
    formatVersion: z.number().int().optional(),
    nodes: z
      .array(z.string().min(1))
      .min(TREE_MIN_NODES, `至少需要 ${TREE_MIN_NODES} 个节点。`)
      .max(TREE_MAX_NODES, `最多支持 ${TREE_MAX_NODES} 个节点。`),
    edges: z.array(z.tuple([z.string().min(1), z.string().min(1)])),
    treeTargetValue: z.string().optional(),
  })
  .strict();

function getFirstIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? '输入数据格式无效。';
}

export function parseTreeImportJson(
  rawText: string
):
  | { ok: true; nodes: GraphNode[]; edges: GraphEdge[]; treeTargetValue: string }
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
        'JSON 格式已升级，请使用对象格式：{ "formatVersion": 2, "nodes": ["8", "3", ...], "edges": [["8", "3"], ...] }。',
    };
  }

  const parseResult = treeSnapshotSchema.safeParse(parsed);

  if (!parseResult.success) {
    return { ok: false, message: getFirstIssueMessage(parseResult.error) };
  }

  const { nodes: nodeIds, edges: edgeTuples, treeTargetValue } = parseResult.data;
  const nodes: GraphNode[] = nodeIds.map(id => ({ id, x: 0, y: 0 }));
  const edges: GraphEdge[] = edgeTuples.map(([source, target]) => ({ source, target }));

  return {
    ok: true,
    nodes,
    edges,
    treeTargetValue: treeTargetValue ?? nodeIds[0] ?? '1',
  };
}
