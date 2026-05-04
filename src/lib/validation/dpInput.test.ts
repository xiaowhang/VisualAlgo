import { describe, it, expect } from 'vitest';
import { DP_SNAPSHOT_FORMAT_VERSION, parseDpImportJson } from './dpInput.ts';

describe('DP input validator', () => {
  describe('DP_SNAPSHOT_FORMAT_VERSION', () => {
    it('is 1', () => {
      expect(DP_SNAPSHOT_FORMAT_VERSION).toBe(1);
    });
  });

  describe('LCS type', () => {
    it('accepts valid LCS input', () => {
      const raw = JSON.stringify({ type: 'lcs', x: 'ABC', y: 'BCD' });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(true);
      if (result.ok && result.type === 'lcs') {
        expect(result.x).toBe('ABC');
        expect(result.y).toBe('BCD');
      }
    });

    it('rejects empty x', () => {
      const raw = JSON.stringify({ type: 'lcs', x: '', y: 'BCD' });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('字符串 X 不能为空。');
      }
    });

    it('rejects empty y', () => {
      const raw = JSON.stringify({ type: 'lcs', x: 'ABC', y: '' });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('字符串 Y 不能为空。');
      }
    });

    it('rejects missing type field', () => {
      const raw = JSON.stringify({ x: 'ABC', y: 'BCD' });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
    });
  });

  describe('Knapsack type', () => {
    it('accepts valid knapsack input', () => {
      const raw = JSON.stringify({
        type: 'knapsack',
        capacity: 10,
        items: [{ weight: 2, value: 3 }],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(true);
      if (result.ok && result.type === 'knapsack') {
        expect(result.capacity).toBe(10);
        expect(result.items).toEqual([{ weight: 2, value: 3 }]);
      }
    });

    it('rejects zero capacity', () => {
      const raw = JSON.stringify({
        type: 'knapsack',
        capacity: 0,
        items: [{ weight: 2, value: 3 }],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('背包容量必须为正整数。');
      }
    });

    it('rejects empty items array', () => {
      const raw = JSON.stringify({
        type: 'knapsack',
        capacity: 10,
        items: [],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('至少需要 1 个物品。');
      }
    });

    it('rejects zero weight', () => {
      const raw = JSON.stringify({
        type: 'knapsack',
        capacity: 10,
        items: [{ weight: 0, value: 3 }],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('重量必须为正整数。');
      }
    });

    it('rejects zero value', () => {
      const raw = JSON.stringify({
        type: 'knapsack',
        capacity: 10,
        items: [{ weight: 2, value: 0 }],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('价值必须为正整数。');
      }
    });
  });

  describe('Investment type', () => {
    it('accepts valid investment input', () => {
      const raw = JSON.stringify({
        type: 'investment',
        investmentCount: 3,
        resources: 5,
        returns: [
          [0, 1, 2],
          [0, 3, 4],
        ],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(true);
      if (result.ok && result.type === 'investment') {
        expect(result.investmentCount).toBe(3);
        expect(result.resources).toBe(5);
        expect(result.returns).toEqual([
          [0, 1, 2],
          [0, 3, 4],
        ]);
      }
    });

    it('rejects investmentCount less than 2', () => {
      const raw = JSON.stringify({
        type: 'investment',
        investmentCount: 1,
        resources: 5,
        returns: [
          [0, 1, 2],
          [0, 3, 4],
        ],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('投资项目数至少为 2。');
      }
    });

    it('rejects resources less than 3', () => {
      const raw = JSON.stringify({
        type: 'investment',
        investmentCount: 3,
        resources: 2,
        returns: [
          [0, 1, 2],
          [0, 3, 4],
        ],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('资源总量至少为 3。');
      }
    });

    it('rejects empty returns matrix', () => {
      const raw = JSON.stringify({
        type: 'investment',
        investmentCount: 3,
        resources: 5,
        returns: [],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('收益矩阵不能为空。');
      }
    });

    it('rejects negative values in returns', () => {
      const raw = JSON.stringify({
        type: 'investment',
        investmentCount: 3,
        resources: 5,
        returns: [[0, -1, 2]],
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
    });
  });

  describe('general validation', () => {
    it('returns JSON parse error for malformed JSON', () => {
      const result = parseDpImportJson('{invalid json}}}');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('JSON 解析失败，请检查文件内容。');
      }
    });

    it('rejects unknown type field', () => {
      const raw = JSON.stringify({ type: 'unknown', data: 123 });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('rejects extra fields due to strict mode (LCS)', () => {
      const raw = JSON.stringify({
        type: 'lcs',
        x: 'ABC',
        y: 'BCD',
        extra: 'field',
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('rejects extra fields due to strict mode (knapsack)', () => {
      const raw = JSON.stringify({
        type: 'knapsack',
        capacity: 10,
        items: [{ weight: 2, value: 3 }],
        extra: true,
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('rejects extra fields due to strict mode (investment)', () => {
      const raw = JSON.stringify({
        type: 'investment',
        investmentCount: 3,
        resources: 5,
        returns: [[0, 1, 2]],
        extra: 42,
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('accepts input with optional formatVersion', () => {
      const raw = JSON.stringify({
        formatVersion: 1,
        type: 'lcs',
        x: 'ABC',
        y: 'BCD',
      });
      const result = parseDpImportJson(raw);

      expect(result.ok).toBe(true);
    });
  });
});
