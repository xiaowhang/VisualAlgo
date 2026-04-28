<script setup lang="ts">
import type { NumericRange, ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

const nodeCountInput = defineModel<string>('nodeCountInput', { required: true });
const minValueInput = defineModel<string>('minValueInput', { required: true });
const maxValueInput = defineModel<string>('maxValueInput', { required: true });
const targetValueInput = defineModel<string>('targetValueInput', { required: true });

interface Props {
  nodeCountRange: NumericRange;
  valueRange: NumericRange;
  sizeValidation: ValidationState;
  valueValidation: ValidationState;
  generalValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-node-count'): void;
  (event: 'apply-value-range'): void;
  (event: 'apply-target-value'): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet>
    <FieldLegend>树设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>节点数量</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            v-model="nodeCountInput"
            type="number"
            :min="props.nodeCountRange.min"
            :max="props.nodeCountRange.max"
            @blur="emit('apply-node-count')"
          />
          <Button variant="outline" size="sm" @click="emit('apply-node-count')"> 应用 </Button>
        </div>
        <FieldDescription
          >范围：{{ props.nodeCountRange.min }} - {{ props.nodeCountRange.max }}</FieldDescription
        >
        <ValidationMessage :state="props.sizeValidation" />
      </FieldGroup>

      <FieldGroup class="mt-4 flex flex-col gap-2">
        <FieldDescription>数值范围</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            v-model="minValueInput"
            type="number"
            :min="props.valueRange.min"
            :max="props.valueRange.max"
            placeholder="最小值"
            @blur="emit('apply-value-range')"
          />
          <span class="text-sm text-muted-foreground">-</span>
          <Input
            v-model="maxValueInput"
            type="number"
            :min="props.valueRange.min"
            :max="props.valueRange.max"
            placeholder="最大值"
            @blur="emit('apply-value-range')"
          />
          <Button variant="outline" size="sm" @click="emit('apply-value-range')"> 应用 </Button>
        </div>
        <ValidationMessage :state="props.valueValidation" />
      </FieldGroup>

      <FieldGroup class="mt-4 flex flex-col gap-2">
        <FieldDescription>查找目标值</FieldDescription>
        <div class="flex items-center gap-2">
          <Input v-model="targetValueInput" type="text" @blur="emit('apply-target-value')" />
          <Button variant="outline" size="sm" @click="emit('apply-target-value')"> 应用 </Button>
        </div>
      </FieldGroup>

      <ValidationMessage class="mt-2 block" :state="props.generalValidation" />
    </FieldContent>
  </FieldSet>
</template>
