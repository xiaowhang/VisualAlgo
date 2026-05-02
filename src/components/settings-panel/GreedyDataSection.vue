<script setup lang="ts">
import { ACTIVITY_MIN_INTERVALS, ACTIVITY_MAX_INTERVALS } from '@/stores/algorithmInputs';
import type { ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

interface Props {
  algorithmSlug: string;
  huffmanInput: string;
  activityIntervalCount: number;
  huffmanValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-huffman-input'): void;
  (event: 'update:huffmanInput', value: string): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet v-if="props.algorithmSlug === 'huffman'">
    <FieldLegend>哈夫曼编码设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>输入字符串</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.huffmanInput"
            class="flex-1"
            @update:model-value="(v: string | number) => emit('update:huffmanInput', String(v))"
          />
          <Button variant="outline" size="sm" @click="emit('apply-huffman-input')"> 应用 </Button>
        </div>
        <ValidationMessage :state="props.huffmanValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>

  <FieldSet v-if="props.algorithmSlug === 'activity-selection'">
    <FieldLegend>活动选择设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>活动数量</FieldDescription>
        <FieldDescription class="text-xs text-muted-foreground">
          范围：{{ ACTIVITY_MIN_INTERVALS }} - {{ ACTIVITY_MAX_INTERVALS }}
        </FieldDescription>
      </FieldGroup>
    </FieldContent>
  </FieldSet>
</template>
