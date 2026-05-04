import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/visualizers/graphLayout', () => ({
  computeStableForceLayout: vi.fn((nodeIds: string[]) =>
    nodeIds.map(id => ({ id, x: 100, y: 100 }))
  ),
}));

vi.mock('@/algorithms/shared/tree/fixtures', () => ({
  createRandomBSTData: vi.fn(() => ({
    nodes: [{ id: '1', x: 0, y: 0 }],
    edges: [],
  })),
  getDefaultBST: vi.fn(() => ({
    nodes: [{ id: '1', x: 0, y: 0 }],
    edges: [],
  })),
}));

import {
  useAlgorithmInputsStore,
  HANOI_MIN_DISKS,
  HANOI_MAX_DISKS,
  NQUEENS_MIN_SIZE,
  NQUEENS_MAX_SIZE,
  DP_KNAPSACK_CAPACITY_MIN,
  DP_KNAPSACK_CAPACITY_MAX,
  DP_KNAPSACK_ITEMS_MIN,
  DP_KNAPSACK_ITEMS_MAX,
} from './algorithmInputs';

describe('useAlgorithmInputsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('setHanoiDiskCount', () => {
    it('钳制到 [2, 8]，超出范围的值被钳制', () => {
      const store = useAlgorithmInputsStore();

      store.setHanoiDiskCount(1);
      expect(store.hanoiDiskCount).toBe(HANOI_MIN_DISKS);

      store.setHanoiDiskCount(10);
      expect(store.hanoiDiskCount).toBe(HANOI_MAX_DISKS);

      store.setHanoiDiskCount(5);
      expect(store.hanoiDiskCount).toBe(5);
    });

    it('截断小数部分', () => {
      const store = useAlgorithmInputsStore();

      store.setHanoiDiskCount(3.7);
      expect(store.hanoiDiskCount).toBe(3);
    });
  });

  describe('setNQueensSize', () => {
    it('钳制到 [4, 8]', () => {
      const store = useAlgorithmInputsStore();

      store.setNQueensSize(2);
      expect(store.nQueensSize).toBe(NQUEENS_MIN_SIZE);

      store.setNQueensSize(12);
      expect(store.nQueensSize).toBe(NQUEENS_MAX_SIZE);

      store.setNQueensSize(6);
      expect(store.nQueensSize).toBe(6);
    });
  });

  describe('setDpKnapsackCapacity', () => {
    it('钳制到 [3, 15]', () => {
      const store = useAlgorithmInputsStore();

      store.setDpKnapsackCapacity(1);
      expect(store.dpKnapsackCapacity).toBe(DP_KNAPSACK_CAPACITY_MIN);

      store.setDpKnapsackCapacity(20);
      expect(store.dpKnapsackCapacity).toBe(DP_KNAPSACK_CAPACITY_MAX);

      store.setDpKnapsackCapacity(10);
      expect(store.dpKnapsackCapacity).toBe(10);
    });
  });

  describe('setDpKnapsackItemCount', () => {
    it('钳制到 [2, 6]，仅在数量变化时更新', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      // 默认 4 个物品，设置相同数量不更新
      store.setDpKnapsackItemCount(4);
      expect(store.dpKnapsackItems).toHaveLength(4);
      expect(store.dataVersion).toBe(initialVersion);

      store.setDpKnapsackItemCount(1);
      expect(store.dpKnapsackItems).toHaveLength(DP_KNAPSACK_ITEMS_MIN);

      store.setDpKnapsackItemCount(10);
      expect(store.dpKnapsackItems).toHaveLength(DP_KNAPSACK_ITEMS_MAX);
    });
  });

  describe('setGraphStartNode', () => {
    it('已选中时无变化', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      // 默认 startNode 为 'A'
      store.setGraphStartNode('A');
      expect(store.graphStartNode).toBe('A');
      expect(store.dataVersion).toBe(initialVersion);
    });
  });

  describe('setTreeTargetValue', () => {
    it('设置值并递增 dataVersion', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      store.setTreeTargetValue('42');
      expect(store.treeTargetValue).toBe('42');
      expect(store.dataVersion).toBe(initialVersion + 1);
    });
  });

  describe('setDpLcsStringX / setDpLcsStringY', () => {
    it('设置值，相同值不递增 dataVersion', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      store.setDpLcsStringX('XYZ');
      expect(store.dpLcsStringX).toBe('XYZ');
      expect(store.dataVersion).toBe(initialVersion + 1);

      // 相同值不递增
      store.setDpLcsStringX('XYZ');
      expect(store.dataVersion).toBe(initialVersion + 1);

      store.setDpLcsStringY('PQR');
      expect(store.dpLcsStringY).toBe('PQR');
      expect(store.dataVersion).toBe(initialVersion + 2);

      // 相同值不递增
      store.setDpLcsStringY('PQR');
      expect(store.dataVersion).toBe(initialVersion + 2);
    });
  });

  describe('setHuffmanInput', () => {
    it('直接设置，相同值不递增 dataVersion', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      store.setHuffmanInput('hello');
      expect(store.huffmanInput).toBe('hello');
      expect(store.dataVersion).toBe(initialVersion + 1);

      // 相同值不递增
      store.setHuffmanInput('hello');
      expect(store.dataVersion).toBe(initialVersion + 1);
    });
  });

  describe('setActivityIntervalCount', () => {
    it('设置区间数量', () => {
      const store = useAlgorithmInputsStore();

      store.setActivityIntervalCount(6);
      expect(store.activityIntervals).toHaveLength(6);
    });
  });

  describe('setSubsetSumArray', () => {
    it('过滤后少于 3 个元素时不更新', () => {
      const store = useAlgorithmInputsStore();
      const initialArray = [...store.subsetSumArray];
      const initialVersion = store.dataVersion;

      store.setSubsetSumArray([1, 2]);
      expect(store.subsetSumArray).toEqual(initialArray);
      expect(store.dataVersion).toBe(initialVersion);
    });

    it('过滤后 >= 3 个元素时更新', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      store.setSubsetSumArray([3, 6, 9]);
      expect(store.subsetSumArray).toEqual([3, 6, 9]);
      expect(store.dataVersion).toBe(initialVersion + 1);
    });
  });

  describe('setSubsetSumTarget', () => {
    it('钳制 >= 1', () => {
      const store = useAlgorithmInputsStore();

      store.setSubsetSumTarget(0);
      expect(store.subsetSumTarget).toBe(1);

      store.setSubsetSumTarget(-5);
      expect(store.subsetSumTarget).toBe(1);

      store.setSubsetSumTarget(42);
      expect(store.subsetSumTarget).toBe(42);
    });
  });

  describe('setNetworkFlowSource / setNetworkFlowSink', () => {
    it('直接设置 source', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      store.setNetworkFlowSource('A');
      expect(store.networkFlowSource).toBe('A');
      expect(store.dataVersion).toBe(initialVersion + 1);
    });

    it('直接设置 sink', () => {
      const store = useAlgorithmInputsStore();
      const initialVersion = store.dataVersion;

      store.setNetworkFlowSink('B');
      expect(store.networkFlowSink).toBe('B');
      expect(store.dataVersion).toBe(initialVersion + 1);
    });
  });

  describe('dataVersion', () => {
    it('初始值为 0', () => {
      const store = useAlgorithmInputsStore();
      expect(store.dataVersion).toBe(0);
    });

    it('数据变更后递增', () => {
      const store = useAlgorithmInputsStore();

      store.setHanoiDiskCount(5);
      expect(store.dataVersion).toBe(1);

      store.setNQueensSize(6);
      expect(store.dataVersion).toBe(2);

      store.setDpKnapsackCapacity(8);
      expect(store.dataVersion).toBe(3);
    });
  });
});
