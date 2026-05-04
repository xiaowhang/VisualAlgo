import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmComparisonStore } from './algorithmComparison';

const mockGetItem = vi.fn();
const mockSetItem = vi.fn();

vi.stubGlobal('localStorage', {
  getItem: mockGetItem,
  setItem: mockSetItem,
});

vi.mock('@/algorithms/registry', () => ({
  COMPARE_DEFAULT_GROUP: 'sorting',
  isComparisonGroup: vi.fn(
    (value: string) => value === 'sorting' || value === 'graph-traversal' || value === 'max-flow'
  ),
  normalizeComparePair: vi.fn(
    (input: { leftSlug: string; rightSlug: string; preferredGroup?: string }) => {
      // 简单实现：如果 slug 有效则使用，否则回退到默认
      const left = input.leftSlug || 'bubble-sort';
      const right = input.rightSlug || 'quick-sort';
      return {
        group: (input.preferredGroup as string) || 'sorting',
        left,
        right: left === right ? 'quick-sort' : right,
      };
    }
  ),
}));

describe('useAlgorithmComparisonStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockGetItem.mockReset();
    mockSetItem.mockReset();
  });

  describe('初始状态', () => {
    it('leftSlug="", rightSlug="", compareGroup 默认为 "sorting"', () => {
      mockGetItem.mockReturnValue(null);

      const store = useAlgorithmComparisonStore();
      expect(store.leftSlug).toBe('');
      expect(store.rightSlug).toBe('');
      expect(store.compareGroup).toBe('sorting');
    });
  });

  describe('setPreferredGroup', () => {
    it('写入 localStorage', () => {
      mockGetItem.mockReturnValue(null);

      const store = useAlgorithmComparisonStore();
      store.setPreferredGroup('graph-traversal');

      expect(store.compareGroup).toBe('graph-traversal');
      expect(mockSetItem).toHaveBeenCalledWith('algo-compare:last-group', 'graph-traversal');
    });
  });

  describe('applyRouteQuery', () => {
    it('合法 query 更新 slug', () => {
      mockGetItem.mockReturnValue(null);

      const store = useAlgorithmComparisonStore();
      const result = store.applyRouteQuery('bubble-sort', 'quick-sort');

      expect(result.left).toBe('bubble-sort');
      expect(result.right).toBe('quick-sort');
      expect(result.category).toBe('sorting');
      expect(store.leftSlug).toBe('bubble-sort');
      expect(store.rightSlug).toBe('quick-sort');
    });

    it('空 query 使用默认值', () => {
      mockGetItem.mockReturnValue(null);

      const store = useAlgorithmComparisonStore();
      const result = store.applyRouteQuery(undefined, undefined);

      expect(result.left).toBe('bubble-sort');
      expect(result.right).toBe('quick-sort');
    });
  });

  describe('applySelectionChange', () => {
    it('左右相同时的碰撞处理：左变右不变时，右回退到之前的左', () => {
      mockGetItem.mockReturnValue(null);

      const store = useAlgorithmComparisonStore();
      store.applyRouteQuery('bubble-sort', 'quick-sort');

      const result = store.applySelectionChange({
        nextLeft: 'quick-sort',
        nextRight: 'quick-sort',
        prevLeft: 'bubble-sort',
        prevRight: 'quick-sort',
        queryLeft: 'bubble-sort',
        queryRight: 'quick-sort',
      });

      // 左变为 quick-sort（与右相同），右不变 => 右回退到之前的左 (bubble-sort)
      expect(result.left).toBe('quick-sort');
      expect(result.right).toBe('bubble-sort');
    });

    it('左右相同时的碰撞处理：右变左不变时，左回退到之前的右', () => {
      mockGetItem.mockReturnValue(null);

      const store = useAlgorithmComparisonStore();
      store.applyRouteQuery('bubble-sort', 'quick-sort');

      const result = store.applySelectionChange({
        nextLeft: 'bubble-sort',
        nextRight: 'bubble-sort',
        prevLeft: 'bubble-sort',
        prevRight: 'quick-sort',
        queryLeft: 'bubble-sort',
        queryRight: 'quick-sort',
      });

      // 右变为 bubble-sort（与左相同），左不变 => 左回退到之前的右 (quick-sort)
      expect(result.left).toBe('quick-sort');
      expect(result.right).toBe('bubble-sort');
    });

    it('左右不同时正常更新', () => {
      mockGetItem.mockReturnValue(null);

      const store = useAlgorithmComparisonStore();

      const result = store.applySelectionChange({
        nextLeft: 'bubble-sort',
        nextRight: 'quick-sort',
        prevLeft: 'bubble-sort',
        prevRight: 'quick-sort',
        queryLeft: undefined,
        queryRight: undefined,
      });

      expect(result.left).toBe('bubble-sort');
      expect(result.right).toBe('quick-sort');
    });
  });
});
