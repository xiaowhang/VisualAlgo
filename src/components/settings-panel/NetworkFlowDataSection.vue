<script setup lang="ts">
import type { ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

interface Props {
  networkFlowNodeCount: string;
  networkFlowNodeCountRange: { min: number; max: number };
  networkFlowNodeIds: string;
  networkFlowSource: string;
  networkFlowSink: string;
  networkFlowValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-network-flow-node-count'): void;
  (event: 'apply-network-flow-source'): void;
  (event: 'apply-network-flow-sink'): void;
  (event: 'update:networkFlowNodeCount', value: string): void;
  (event: 'update:networkFlowSource', value: string): void;
  (event: 'update:networkFlowSink', value: string): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet>
    <FieldLegend>网络流设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>节点数量</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.networkFlowNodeCount"
            type="number"
            :min="props.networkFlowNodeCountRange.min"
            :max="props.networkFlowNodeCountRange.max"
            class="h-9 w-20"
            @update:model-value="
              (v: string | number) => emit('update:networkFlowNodeCount', String(v))
            "
            @keydown.enter="emit('apply-network-flow-node-count')"
          />
          <Button variant="outline" size="sm" @click="emit('apply-network-flow-node-count')">
            应用
          </Button>
        </div>
        <FieldDescription>
          范围：{{ props.networkFlowNodeCountRange.min }} -
          {{ props.networkFlowNodeCountRange.max }}
        </FieldDescription>
        <FieldDescription>源点</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.networkFlowSource"
            class="h-9 w-20"
            @update:model-value="
              (v: string | number) => emit('update:networkFlowSource', String(v))
            "
          />
          <Button variant="outline" size="sm" @click="emit('apply-network-flow-source')">
            应用
          </Button>
        </div>
        <FieldDescription>汇点</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.networkFlowSink"
            class="h-9 w-20"
            @update:model-value="(v: string | number) => emit('update:networkFlowSink', String(v))"
          />
          <Button variant="outline" size="sm" @click="emit('apply-network-flow-sink')">
            应用
          </Button>
        </div>
        <FieldDescription class="text-xs text-muted-foreground">
          可用节点：{{ props.networkFlowNodeIds }}
        </FieldDescription>
        <ValidationMessage :state="props.networkFlowValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>
</template>
