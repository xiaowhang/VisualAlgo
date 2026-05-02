<script setup lang="ts">
import { NQUEENS_MIN_SIZE, NQUEENS_MAX_SIZE } from '@/stores/algorithmInputs';
import type { ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

interface Props {
  algorithmSlug: string;
  nQueensSize: string;
  subsetSumArray: string;
  subsetSumTarget: string;
  backtrackingValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-n-queens-size'): void;
  (event: 'apply-subset-sum'): void;
  (event: 'update:nQueensSize', value: string): void;
  (event: 'update:subsetSumArray', value: string): void;
  (event: 'update:subsetSumTarget', value: string): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet v-if="props.algorithmSlug === 'n-queens'">
    <FieldLegend>N 皇后设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>棋盘大小 N</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.nQueensSize"
            type="number"
            :min="NQUEENS_MIN_SIZE"
            :max="NQUEENS_MAX_SIZE"
            class="h-9 w-20"
            @update:model-value="(v: string | number) => emit('update:nQueensSize', String(v))"
          />
          <Button variant="outline" size="sm" @click="emit('apply-n-queens-size')"> 应用 </Button>
        </div>
        <FieldDescription class="text-xs text-muted-foreground">
          范围：{{ NQUEENS_MIN_SIZE }} - {{ NQUEENS_MAX_SIZE }}
        </FieldDescription>
        <ValidationMessage :state="props.backtrackingValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>

  <FieldSet v-if="props.algorithmSlug === 'subset-sum'">
    <FieldLegend>子集和设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>数字数组（逗号分隔）</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.subsetSumArray"
            class="flex-1"
            @update:model-value="(v: string | number) => emit('update:subsetSumArray', String(v))"
          />
        </div>
        <FieldDescription>目标和</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.subsetSumTarget"
            type="number"
            :min="1"
            class="h-9 w-24"
            @update:model-value="(v: string | number) => emit('update:subsetSumTarget', String(v))"
          />
          <Button variant="outline" size="sm" @click="emit('apply-subset-sum')"> 应用 </Button>
        </div>
        <ValidationMessage :state="props.backtrackingValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>
</template>
