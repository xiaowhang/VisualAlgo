import { describe, it, expect } from 'vitest';
import { parseSortingImportJson } from './sortingInput';
import { parseGraphImportJson } from './graphInput';
import { parseTreeImportJson } from './treeInput';
import { parseDpImportJson } from './dpInput';

describe('strictMode 兼容性', () => {
  describe('额外字段拒绝', () => {
    it('sorting + extraField → ok=false', () => {
      const result = parseSortingImportJson(
        JSON.stringify({ sortingInput: [5, 3, 8, 1, 9], extraField: 'bad' })
      );
      expect(result.ok).toBe(false);
    });

    it('graph + extraField → ok=false', () => {
      const result = parseGraphImportJson(
        JSON.stringify({
          nodes: ['A', 'B', 'C'],
          edges: [['A', 'B']],
          extraField: 'bad',
        })
      );
      expect(result.ok).toBe(false);
    });

    it('tree + extraField → ok=false', () => {
      const result = parseTreeImportJson(
        JSON.stringify({
          nodes: ['8', '3', '10', '1'],
          edges: [
            ['8', '3'],
            ['8', '10'],
          ],
          extraField: 'bad',
        })
      );
      expect(result.ok).toBe(false);
    });

    it('dp-lcs + extraField → ok=false', () => {
      const result = parseDpImportJson(
        JSON.stringify({ type: 'lcs', x: 'ABC', y: 'BCD', extraField: 'bad' })
      );
      expect(result.ok).toBe(false);
    });

    it('dp-knapsack + extraField → ok=false', () => {
      const result = parseDpImportJson(
        JSON.stringify({
          type: 'knapsack',
          capacity: 10,
          items: [{ weight: 3, value: 5 }],
          extraField: 'bad',
        })
      );
      expect(result.ok).toBe(false);
    });

    it('dp-investment + extraField → ok=false', () => {
      const result = parseDpImportJson(
        JSON.stringify({
          type: 'investment',
          investmentCount: 3,
          resources: 5,
          returns: [[0, 1, 2]],
          extraField: 'bad',
        })
      );
      expect(result.ok).toBe(false);
    });
  });

  describe('错误消息质量', () => {
    it('错误消息非空', () => {
      const result = parseSortingImportJson(
        JSON.stringify({ sortingInput: [5, 3, 8, 1, 9], extra: true })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('sorting 元素太少 → 中文错误消息', () => {
      const result = parseSortingImportJson(JSON.stringify({ sortingInput: [1] }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toMatch(/[一-鿿]/);
      }
    });
  });

  describe('合法数据通过', () => {
    it('sorting 无 extra → ok=true', () => {
      const result = parseSortingImportJson(JSON.stringify({ sortingInput: [5, 3, 8, 1, 9] }));
      expect(result.ok).toBe(true);
    });

    it('graph 无 extra → ok=true', () => {
      const result = parseGraphImportJson(
        JSON.stringify({ nodes: ['A', 'B', 'C'], edges: [['A', 'B']] })
      );
      expect(result.ok).toBe(true);
    });
  });
});
