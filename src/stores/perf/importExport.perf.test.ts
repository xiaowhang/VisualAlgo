import { describe, bench, beforeAll } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import {
  parseSortingImportJson,
  SORTING_SNAPSHOT_FORMAT_VERSION,
} from '@/lib/validation/sortingInput';
import { parseGraphImportJson, GRAPH_SNAPSHOT_FORMAT_VERSION } from '@/lib/validation/graphInput';
import { parseDpImportJson, DP_SNAPSHOT_FORMAT_VERSION } from '@/lib/validation/dpInput';

describe('导入导出往返性能', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  describe('sorting round-trip', () => {
    bench('14 元素', () => {
      const store = useAlgorithmInputsStore();
      store.sortingInput = Array.from({ length: 14 }, (_, i) => i + 1).sort(
        () => Math.random() - 0.5
      );
      const exported = JSON.stringify({
        formatVersion: SORTING_SNAPSHOT_FORMAT_VERSION,
        sortingInput: store.sortingInput,
      });
      const result = parseSortingImportJson(exported);
      void result;
    });

    bench('50 元素', () => {
      const store = useAlgorithmInputsStore();
      store.sortingInput = Array.from({ length: 50 }, (_, i) => i + 1).sort(
        () => Math.random() - 0.5
      );
      const exported = JSON.stringify({
        formatVersion: SORTING_SNAPSHOT_FORMAT_VERSION,
        sortingInput: store.sortingInput,
      });
      const result = parseSortingImportJson(exported);
      void result;
    });
  });

  describe('graph round-trip', () => {
    bench('8 节点', () => {
      const nodeIds = Array.from({ length: 8 }, (_, i) => String.fromCharCode(65 + i));
      const edges: [string, string][] = [];
      for (let i = 0; i < nodeIds.length - 1; i++) {
        edges.push([nodeIds[i], nodeIds[i + 1]]);
      }
      const exported = JSON.stringify({
        formatVersion: GRAPH_SNAPSHOT_FORMAT_VERSION,
        nodes: nodeIds,
        edges,
      });
      const result = parseGraphImportJson(exported);
      void result;
    });

    bench('14 节点', () => {
      const nodeIds = Array.from({ length: 14 }, (_, i) => `N${i}`);
      const edges: [string, string][] = [];
      for (let i = 0; i < nodeIds.length - 1; i++) {
        edges.push([nodeIds[i], nodeIds[i + 1]]);
      }
      const exported = JSON.stringify({
        formatVersion: GRAPH_SNAPSHOT_FORMAT_VERSION,
        nodes: nodeIds,
        edges,
      });
      const result = parseGraphImportJson(exported);
      void result;
    });
  });

  describe('dp round-trip', () => {
    bench('LCS 8x8', () => {
      const exported = JSON.stringify({
        formatVersion: DP_SNAPSHOT_FORMAT_VERSION,
        type: 'lcs',
        x: 'ABCBDAB',
        y: 'BDCABA',
      });
      const result = parseDpImportJson(exported);
      void result;
    });
  });
});
