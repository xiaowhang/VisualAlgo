<script setup lang="ts">
import type { NumericRange, ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

const sizeInput = defineModel<string>('sizeInput', { required: true });
const customData = defineModel<string>('customData', { required: true });

interface Props {
  sizeRange: NumericRange;
  sizeValidation: ValidationState;
  customValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-size'): void;
  (event: 'apply-custom-data'): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet>
    <FieldLegend>数据规模</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <Input
          v-model="sizeInput"
          type="number"
          :min="props.sizeRange.min"
          :max="props.sizeRange.max"
          @blur="emit('apply-size')"
        />
        <FieldDescription>
          范围：{{ props.sizeRange.min }} - {{ props.sizeRange.max }}
        </FieldDescription>
        <ValidationMessage :state="props.sizeValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>

  <FieldSet>
    <FieldLegend>自定义数据</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>请输入逗号分隔的整数</FieldDescription>
        <Textarea
          v-model="customData"
          placeholder="12, 5, 8, 30, 2..."
          class="min-h-30 resize-none"
        />
        <div class="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" @click="emit('apply-custom-data')">应用</Button>
          <ValidationMessage :state="props.customValidation" />
        </div>
      </FieldGroup>
    </FieldContent>
  </FieldSet>
</template>
