import { describe, it, expect } from 'vitest';
import { computeStableForceLayout } from './graphLayout';

describe('computeStableForceLayout', () => {
  const nodeIds = ['A', 'B', 'C', 'D'];
  const edges = [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'A' },
  ];

  it('返回与输入相同数量的节点', () => {
    const result = computeStableForceLayout(nodeIds, edges);
    expect(result).toHaveLength(4);
  });

  it('每个节点包含 id, x, y', () => {
    const result = computeStableForceLayout(nodeIds, edges);
    for (const node of result) {
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('x');
      expect(node).toHaveProperty('y');
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
  });

  it('返回的节点 id 与输入一致', () => {
    const result = computeStableForceLayout(nodeIds, edges);
    const resultIds = result.map(n => n.id).sort();
    expect(resultIds).toEqual(['A', 'B', 'C', 'D']);
  });

  it('确定性：相同输入两次调用结果一致', () => {
    const result1 = computeStableForceLayout(nodeIds, edges);
    const result2 = computeStableForceLayout(nodeIds, edges);
    expect(result1).toEqual(result2);
  });

  it('空节点列表返回空数组', () => {
    const result = computeStableForceLayout([], []);
    expect(result).toEqual([]);
  });

  it('单节点返回一个节点', () => {
    const result = computeStableForceLayout(['A'], []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('A');
  });

  it('节点坐标在合理范围内', () => {
    const result = computeStableForceLayout(nodeIds, edges);
    for (const node of result) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(760);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(340);
    }
  });

  it('无边时也能正常布局', () => {
    const result = computeStableForceLayout(['X', 'Y', 'Z'], []);
    expect(result).toHaveLength(3);
  });
});
