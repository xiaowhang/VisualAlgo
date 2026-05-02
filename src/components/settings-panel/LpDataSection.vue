<script setup lang="ts">
import type { ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

interface Props {
  algorithmSlug: string;
  lpObjective: string;
  lpConstraints: string;
  lpConstraintLabels: string;
  lpValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-lp-problem'): void;
  (event: 'update:lpObjective', value: string): void;
  (event: 'update:lpConstraints', value: string): void;
  (event: 'update:lpConstraintLabels', value: string): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet>
    <FieldLegend>线性规划设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>目标函数系数（逗号分隔）</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.lpObjective"
            class="flex-1"
            placeholder="例如：3, 5"
            @update:model-value="(v: string | number) => emit('update:lpObjective', String(v))"
          />
        </div>
        <FieldDescription>约束矩阵（每行用分号分隔）</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.lpConstraints"
            class="flex-1"
            placeholder="例如：1,0,4; 0,2,12; 3,5,30"
            @update:model-value="(v: string | number) => emit('update:lpConstraints', String(v))"
          />
        </div>
        <FieldDescription>约束标签（逗号分隔）</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.lpConstraintLabels"
            class="flex-1"
            placeholder="例如：x₁≤4, 2x₂≤12"
            @update:model-value="
              (v: string | number) => emit('update:lpConstraintLabels', String(v))
            "
          />
          <Button variant="outline" size="sm" @click="emit('apply-lp-problem')"> 应用 </Button>
        </div>
        <FieldDescription class="text-xs text-muted-foreground">
          格式：目标函数 max cᵀx，约束 Ax ≤ b
        </FieldDescription>
        <ValidationMessage :state="props.lpValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>
</template>
