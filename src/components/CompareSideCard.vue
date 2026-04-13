<script setup lang="ts">
import GraphTraversalView from '@/components/visualization/GraphTraversalView.vue';
import SortingChart from '@/components/visualization/SortingChart.vue';
import type { GraphStep, SortingStep, VisualizationKind } from '@/types/algorithm';

interface Props {
  title: string;
  statusText: string;
  description: string;
  visualization: VisualizationKind;
  sortingStep: SortingStep | null;
  graphStep: GraphStep | null;
  graphAlgorithmKey: string | null;
  isPlaying: boolean;
}

defineProps<Props>();
</script>

<template>
  <Card class="min-h-70">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-base">
        <span>{{ title }}</span>
        <span
          class="rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border/70"
        >
          {{ statusText }}
        </span>
      </CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="h-full">
      <SortingChart
        v-if="visualization === 'sorting'"
        :step="sortingStep"
        :is-playing-override="isPlaying"
      />
      <GraphTraversalView v-else :step="graphStep" :algorithm-key="graphAlgorithmKey" />
    </CardContent>
  </Card>
</template>
