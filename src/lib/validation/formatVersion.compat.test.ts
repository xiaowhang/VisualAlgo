import { describe, it, expect } from 'vitest';
import { parseSortingImportJson, SORTING_SNAPSHOT_FORMAT_VERSION } from './sortingInput.ts';
import { parseGraphImportJson, GRAPH_SNAPSHOT_FORMAT_VERSION } from './graphInput.ts';
import { parseTreeImportJson, TREE_SNAPSHOT_FORMAT_VERSION } from './treeInput.ts';
import { parseDpImportJson, DP_SNAPSHOT_FORMAT_VERSION } from './dpInput.ts';

describe('formatVersion 兼容性', () => {
  describe('常量值验证', () => {
    it('SORTING_SNAPSHOT_FORMAT_VERSION === 1', () => {
      expect(SORTING_SNAPSHOT_FORMAT_VERSION).toBe(1);
    });

    it('GRAPH_SNAPSHOT_FORMAT_VERSION === 2', () => {
      expect(GRAPH_SNAPSHOT_FORMAT_VERSION).toBe(2);
    });

    it('TREE_SNAPSHOT_FORMAT_VERSION === 2', () => {
      expect(TREE_SNAPSHOT_FORMAT_VERSION).toBe(2);
    });

    it('DP_SNAPSHOT_FORMAT_VERSION === 1', () => {
      expect(DP_SNAPSHOT_FORMAT_VERSION).toBe(1);
    });
  });

  describe('裸数组旧格式拒绝', () => {
    it('排序裸数组 → ok=false，消息含格式升级提示', () => {
      const result = parseSortingImportJson('[1,2,3,4,5]');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('格式已升级');
        expect(result.message).toContain('formatVersion');
      }
    });

    it('图裸数组 → ok=false，消息含格式升级提示', () => {
      const result = parseGraphImportJson('[["A","B"],["B","C"]]');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('格式已升级');
      }
    });

    it('树裸数组 → ok=false，消息含格式升级提示', () => {
      const result = parseTreeImportJson('["8","3","10","1","6"]');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('格式已升级');
      }
    });
  });

  describe('formatVersion 可选', () => {
    it('排序不含 formatVersion → ok=true', () => {
      const result = parseSortingImportJson(JSON.stringify({ sortingInput: [5, 3, 8, 1, 9] }));
      expect(result.ok).toBe(true);
    });

    it('图不含 formatVersion → ok=true', () => {
      const result = parseGraphImportJson(
        JSON.stringify({ nodes: ['A', 'B', 'C'], edges: [['A', 'B']] })
      );
      expect(result.ok).toBe(true);
    });

    it('树不含 formatVersion → ok=true', () => {
      const result = parseTreeImportJson(
        JSON.stringify({
          nodes: ['8', '3', '10'],
          edges: [
            ['8', '3'],
            ['8', '10'],
          ],
        })
      );
      expect(result.ok).toBe(true);
    });

    it('DP-LCS 不含 formatVersion → ok=true', () => {
      const result = parseDpImportJson(JSON.stringify({ type: 'lcs', x: 'ABC', y: 'BCD' }));
      expect(result.ok).toBe(true);
    });
  });

  describe('formatVersion 版本号校验', () => {
    it('formatVersion=999 → ok=true（当前不校验版本号）', () => {
      const result = parseSortingImportJson(
        JSON.stringify({ formatVersion: 999, sortingInput: [5, 3, 8, 1, 9] })
      );
      expect(result.ok).toBe(true);
    });

    it('formatVersion 为字符串 → ok=false', () => {
      const result = parseSortingImportJson(
        JSON.stringify({ formatVersion: '1', sortingInput: [5, 3, 8, 1, 9] })
      );
      expect(result.ok).toBe(false);
    });

    it('formatVersion 为小数 → ok=false', () => {
      const result = parseSortingImportJson(
        JSON.stringify({ formatVersion: 1.5, sortingInput: [5, 3, 8, 1, 9] })
      );
      expect(result.ok).toBe(false);
    });
  });

  describe('导出包含 formatVersion', () => {
    it('排序导出包含 formatVersion=1', () => {
      const data = { sortingInput: [5, 3, 8, 1, 9] };
      const exported = JSON.stringify({
        formatVersion: SORTING_SNAPSHOT_FORMAT_VERSION,
        ...data,
      });
      const parsed = JSON.parse(exported);
      expect(parsed.formatVersion).toBe(1);
      const result = parseSortingImportJson(exported);
      expect(result.ok).toBe(true);
    });

    it('图导出包含 formatVersion=2', () => {
      const data = { nodes: ['A', 'B', 'C'], edges: [['A', 'B']] };
      const exported = JSON.stringify({
        formatVersion: GRAPH_SNAPSHOT_FORMAT_VERSION,
        ...data,
      });
      const parsed = JSON.parse(exported);
      expect(parsed.formatVersion).toBe(2);
      const result = parseGraphImportJson(exported);
      expect(result.ok).toBe(true);
    });

    it('树导出包含 formatVersion=2', () => {
      const data = {
        nodes: ['8', '3', '10'],
        edges: [
          ['8', '3'],
          ['8', '10'],
        ],
      };
      const exported = JSON.stringify({
        formatVersion: TREE_SNAPSHOT_FORMAT_VERSION,
        ...data,
      });
      const parsed = JSON.parse(exported);
      expect(parsed.formatVersion).toBe(2);
      const result = parseTreeImportJson(exported);
      expect(result.ok).toBe(true);
    });

    it('DP 导出包含 formatVersion=1', () => {
      const data = { type: 'lcs', x: 'ABC', y: 'BCD' };
      const exported = JSON.stringify({
        formatVersion: DP_SNAPSHOT_FORMAT_VERSION,
        ...data,
      });
      const parsed = JSON.parse(exported);
      expect(parsed.formatVersion).toBe(1);
      const result = parseDpImportJson(exported);
      expect(result.ok).toBe(true);
    });
  });

  describe('往返一致性', () => {
    it('排序：导出→导入→再导出，formatVersion 不变', () => {
      const original = JSON.stringify({
        formatVersion: 1,
        sortingInput: [9, 5, 3, 8, 1, 7, 2, 4, 6],
      });
      const imported = parseSortingImportJson(original);
      expect(imported.ok).toBe(true);
      if (imported.ok) {
        const reExported = JSON.stringify({
          formatVersion: SORTING_SNAPSHOT_FORMAT_VERSION,
          sortingInput: [9, 5, 3, 8, 1, 7, 2, 4, 6],
        });
        expect(JSON.parse(reExported).formatVersion).toBe(JSON.parse(original).formatVersion);
      }
    });

    it('图：导出→导入→再导出，formatVersion 不变', () => {
      const original = JSON.stringify({
        formatVersion: 2,
        nodes: ['A', 'B', 'C'],
        edges: [
          ['A', 'B'],
          ['B', 'C'],
        ],
      });
      const imported = parseGraphImportJson(original);
      expect(imported.ok).toBe(true);
      if (imported.ok) {
        const reExported = JSON.stringify({
          formatVersion: GRAPH_SNAPSHOT_FORMAT_VERSION,
          nodes: imported.nodeIds,
          edges: imported.edges.map(e => [e.source, e.target]),
        });
        expect(JSON.parse(reExported).formatVersion).toBe(JSON.parse(original).formatVersion);
      }
    });
  });
});
