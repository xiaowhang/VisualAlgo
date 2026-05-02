<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import GraphTraversalView from '@/components/visualization/GraphTraversalView.vue';
import DpTableVisualizer from '@/components/visualization/DpTableVisualizer.vue';
import HanoiVisualizer from '@/components/visualization/HanoiVisualizer.vue';
import HuffmanTreeVisualizer from '@/components/visualization/HuffmanTreeVisualizer.vue';
import TimelineVisualizer from '@/components/visualization/TimelineVisualizer.vue';
import SortingChart from '@/components/visualization/SortingChart.vue';
import TreeVisualizer from '@/components/visualization/TreeVisualizer.vue';
import ChessboardView from '@/components/visualization/ChessboardView.vue';
import DecisionTreeView from '@/components/visualization/DecisionTreeView.vue';
import NetworkFlowView from '@/components/visualization/NetworkFlowView.vue';
import LpTableauView from '@/components/visualization/LpTableauView.vue';
import LpGraphicalView from '@/components/visualization/LpGraphicalView.vue';
import { findAlgorithm } from '@/algorithms/registry';
import { useAlgorithmStepSelection } from '@/composables/useAlgorithmStepSelection';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';
import { heapArrayToTree } from '@/algorithms/shared/tree/heapToTree';
import { computeTreeLayout } from '@/algorithms/shared/tree/computeTreeLayout';
import { createTreeStep } from '@/algorithms/shared/tree/createTreeStep';
import type { SortingHighlightKind, SortingStep, TreeStep } from '@/types/algorithm';

const route = useRoute();
const playbackStore = useAlgorithmPlaybackStore();
const algorithmInputsStore = useAlgorithmInputsStore();

const playbackRefs = storeToRefs(playbackStore);
const algorithmInputsRefs = storeToRefs(algorithmInputsStore);

const playback = {
  ...playbackRefs,
  reset: playbackStore.reset,
  setTotalSteps: playbackStore.setTotalSteps,
};

const algorithmInputs = {
  ...algorithmInputsRefs,
};

const activeAlgorithm = computed(() => {
  const category = String(route.params.category ?? '');
  const slug = String(route.params.slug ?? '');
  return findAlgorithm(category, slug);
});

const steps = computed(() => activeAlgorithm.value?.createSteps() ?? []);

const {
  sortingStep,
  graphStep,
  treeStep,
  hanoiStep,
  dpTableStep,
  huffmanStep,
  timelineStep,
  chessboardStep,
  decisionTreeStep,
  networkFlowStep,
  lpTableauStep,
  lpGraphicalStep,
} = useAlgorithmStepSelection({
  steps,
  currentStep: playback.currentStep,
});

const graphAlgorithmKey = computed(() => {
  if (!activeAlgorithm.value || activeAlgorithm.value.visualization !== 'graph') {
    return null;
  }
  return `${activeAlgorithm.value.category}:${activeAlgorithm.value.id}`;
});

const isHeapSort = computed(
  () => activeAlgorithm.value?.slug === 'heap-sort' && activeAlgorithm.value?.category === 'sorting'
);

const showTreeView = ref(false);

function highlightKindToTreeKind(kind: SortingHighlightKind): string {
  switch (kind) {
    case 'compare':
      return 'compare';
    case 'swap':
      return 'swap';
    case 'pivot':
      return 'current';
    case 'done':
      return 'done';
    default:
      return 'default';
  }
}

const heapSortTreeSteps = computed<TreeStep[]>(() => {
  if (!isHeapSort.value) return [];

  return (steps.value as SortingStep[]).map(sortingStep => {
    const { nodes, edges, nodeLabels } = heapArrayToTree(sortingStep.values);
    const laidOutNodes = computeTreeLayout(nodes, edges);

    const treeHighlights: Partial<Record<string, string>> = {};
    for (const [indexStr, kind] of Object.entries(sortingStep.highlights)) {
      if (kind) {
        treeHighlights[indexStr] = highlightKindToTreeKind(kind);
      }
    }

    return createTreeStep({
      nodes: laidOutNodes.length > 0 ? laidOutNodes : nodes,
      edges,
      nodeLabels,
      description: sortingStep.description,
      currentIndices: Object.keys(treeHighlights).filter(id => treeHighlights[id] === 'current'),
      compareIndices: Object.keys(treeHighlights).filter(id => treeHighlights[id] === 'compare'),
      swapIndices: Object.keys(treeHighlights).filter(id => treeHighlights[id] === 'swap'),
      doneIndices: Object.keys(treeHighlights).filter(id => treeHighlights[id] === 'done'),
    });
  });
});

const heapSortTreeStep = computed<TreeStep | null>(() => {
  if (!isHeapSort.value || steps.value.length === 0) return null;
  const idx = Math.min(playback.currentStep.value, heapSortTreeSteps.value.length - 1);
  return heapSortTreeSteps.value[idx] ?? null;
});

watch(
  [() => activeAlgorithm.value?.id, () => algorithmInputs.dataVersion.value],
  () => {
    showTreeView.value = false;
    playback.reset();
    playback.setTotalSteps(steps.value.length);
  },
  { immediate: true }
);
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-300 flex-col px-6 py-6 md:px-10 md:py-8">
    <Card v-if="activeAlgorithm" class="relative min-h-0 flex-1 px-0 py-0">
      <button
        v-if="isHeapSort"
        type="button"
        class="absolute top-3 right-4 z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="showTreeView = !showTreeView"
      >
        {{ showTreeView ? '切换为柱状图' : '切换为二叉树' }}
      </button>
      <div class="min-h-0 flex-1 overflow-hidden rounded-[inherit]">
        <SortingChart
          v-if="isHeapSort && !showTreeView"
          class="h-full w-full"
          :step="sortingStep"
        />
        <TreeVisualizer
          v-else-if="isHeapSort && showTreeView"
          class="h-full w-full"
          :step="heapSortTreeStep"
        />
        <SortingChart
          v-else-if="activeAlgorithm.visualization === 'sorting'"
          class="h-full w-full"
          :step="sortingStep"
        />
        <GraphTraversalView
          v-else-if="activeAlgorithm.visualization === 'graph'"
          class="h-full w-full"
          :step="graphStep"
          :algorithm-key="graphAlgorithmKey"
        />
        <TreeVisualizer
          v-else-if="activeAlgorithm.visualization === 'tree'"
          class="h-full w-full"
          :step="treeStep"
        />
        <HanoiVisualizer
          v-else-if="activeAlgorithm.visualization === 'hanoi'"
          class="h-full w-full"
          :step="hanoiStep"
        />
        <DpTableVisualizer
          v-else-if="activeAlgorithm.visualization === 'dp-table'"
          class="h-full w-full"
          :step="dpTableStep"
        />
        <HuffmanTreeVisualizer
          v-else-if="activeAlgorithm.visualization === 'huffman'"
          class="h-full w-full"
          :step="huffmanStep"
        />
        <TimelineVisualizer
          v-else-if="activeAlgorithm.visualization === 'timeline'"
          class="h-full w-full"
          :step="timelineStep"
        />
        <ChessboardView
          v-else-if="activeAlgorithm.visualization === 'chessboard'"
          class="h-full w-full"
          :step="chessboardStep"
        />
        <DecisionTreeView
          v-else-if="activeAlgorithm.visualization === 'decision-tree'"
          class="h-full w-full"
          :step="decisionTreeStep"
        />
        <NetworkFlowView
          v-else-if="activeAlgorithm.visualization === 'network-flow'"
          class="h-full w-full"
          :step="networkFlowStep"
        />
        <LpTableauView
          v-else-if="activeAlgorithm.visualization === 'lp-tableau'"
          class="h-full w-full"
          :step="lpTableauStep"
        />
        <LpGraphicalView
          v-else-if="activeAlgorithm.visualization === 'lp-graphical'"
          class="h-full w-full"
          :step="lpGraphicalStep"
        />
      </div>
    </Card>

    <div
      v-else
      class="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground shadow-sm ring-1 ring-border/60"
    >
      算法未找到，请从左侧重新选择算法。
    </div>
  </div>
</template>
