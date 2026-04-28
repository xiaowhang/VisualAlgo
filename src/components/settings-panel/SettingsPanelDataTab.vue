<script setup lang="ts">
import { computed } from 'vue';
import type {
  GraphSectionData,
  SortingSectionData,
  TreeSectionData,
  ValidationState,
} from '@/features/settings/types';
import { HANOI_MAX_DISKS, HANOI_MIN_DISKS } from '@/stores/algorithmInputs';
import GraphDataSection from './GraphDataSection.vue';
import SortingDataSection from './SortingDataSection.vue';
import TreeDataSection from './TreeDataSection.vue';

const sizeInput = defineModel<string>('sizeInput', { required: true });
const graphNodeCountInput = defineModel<string>('graphNodeCountInput', { required: true });
const graphStartNodeInput = defineModel<string>('graphStartNodeInput', { required: true });
const treeNodeCountInput = defineModel<string>('treeNodeCountInput', { required: true });
const treeMinValueInput = defineModel<string>('treeMinValueInput', { required: true });
const treeMaxValueInput = defineModel<string>('treeMaxValueInput', { required: true });
const treeTargetValueInput = defineModel<string>('treeTargetValueInput', { required: true });
const hanoiDiskCountInput = defineModel<string>('hanoiDiskCountInput', { required: true });
const customData = defineModel<string>('customData', { required: true });

interface Props {
  isSortingAlgorithm: boolean;
  isGraphAlgorithm: boolean;
  isTreeAlgorithm: boolean;
  isHanoiAlgorithm: boolean;
  sortingData: SortingSectionData;
  graphData: GraphSectionData;
  treeData: TreeSectionData;
  hanoiMessage: string;
  hanoiMessageError: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'randomize-data'): void;
  (event: 'apply-size'): void;
  (event: 'apply-graph-node-count'): void;
  (event: 'apply-graph-start-node'): void;
  (event: 'apply-tree-node-count'): void;
  (event: 'apply-tree-value-range'): void;
  (event: 'apply-tree-target-value'): void;
  (event: 'apply-hanoi-disk-count'): void;
  (event: 'apply-custom-data'): void;
}

const emit = defineEmits<Emits>();

const hanoiState = computed<ValidationState>(() => ({
  message: props.hanoiMessage,
  error: props.hanoiMessageError,
}));
</script>

<template>
  <div class="space-y-5">
    <FieldSet>
      <FieldLegend>数据生成</FieldLegend>
      <FieldContent>
        <Button variant="outline" @click="emit('randomize-data')">随机生成</Button>
      </FieldContent>
    </FieldSet>

    <SortingDataSection
      v-if="props.isSortingAlgorithm"
      v-model:size-input="sizeInput"
      v-model:custom-data="customData"
      :size-range="props.sortingData.sizeRange"
      :size-validation="props.sortingData.sizeValidation"
      :custom-validation="props.sortingData.customValidation"
      @apply-size="emit('apply-size')"
      @apply-custom-data="emit('apply-custom-data')"
    />

    <GraphDataSection
      v-if="props.isGraphAlgorithm"
      v-model:node-count-input="graphNodeCountInput"
      v-model:start-node-input="graphStartNodeInput"
      :node-count-range="props.graphData.nodeCountRange"
      :size-validation="props.graphData.sizeValidation"
      :node-options="props.graphData.nodeOptions"
      :general-validation="props.graphData.generalValidation"
      @apply-node-count="emit('apply-graph-node-count')"
      @apply-start-node="emit('apply-graph-start-node')"
    />

    <TreeDataSection
      v-if="props.isTreeAlgorithm"
      v-model:node-count-input="treeNodeCountInput"
      v-model:min-value-input="treeMinValueInput"
      v-model:max-value-input="treeMaxValueInput"
      v-model:target-value-input="treeTargetValueInput"
      :node-count-range="props.treeData.nodeCountRange"
      :value-range="props.treeData.valueRange"
      :size-validation="props.treeData.sizeValidation"
      :value-validation="props.treeData.valueValidation"
      :general-validation="props.treeData.generalValidation"
      @apply-node-count="emit('apply-tree-node-count')"
      @apply-value-range="emit('apply-tree-value-range')"
      @apply-target-value="emit('apply-tree-target-value')"
    />

    <FieldSet v-if="props.isHanoiAlgorithm">
      <FieldLegend>汉诺塔设置</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-col gap-2">
          <FieldDescription>圆盘数量</FieldDescription>
          <div class="flex items-center gap-2">
            <Input
              v-model="hanoiDiskCountInput"
              type="number"
              :min="HANOI_MIN_DISKS"
              :max="HANOI_MAX_DISKS"
              class="h-9 w-20"
              @keydown.enter="emit('apply-hanoi-disk-count')"
            />
            <Button variant="outline" size="sm" @click="emit('apply-hanoi-disk-count')">
              应用
            </Button>
          </div>
          <FieldDescription>范围：{{ HANOI_MIN_DISKS }} - {{ HANOI_MAX_DISKS }}</FieldDescription>
          <ValidationMessage :state="hanoiState" />
        </FieldGroup>
      </FieldContent>
    </FieldSet>
  </div>
</template>
