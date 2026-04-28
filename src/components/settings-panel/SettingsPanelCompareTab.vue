<script setup lang="ts">
import { isAlgorithmCategory } from '@/algorithms/registry';
import type { AlgorithmCategory } from '@/types/algorithm';
import type { AlgorithmMenuItem } from '@/algorithms/registry/types';

interface Props {
  compareCategory: AlgorithmCategory | null;
  compareDefaultCategory: AlgorithmCategory;
  compareOptions: AlgorithmMenuItem[];
  compareLeftSlug: string;
  compareRightSlug: string;
  compareContinueLonger: boolean;
  totalSteps: number;
  compareLeftCurrentStep: number;
  compareRightCurrentStep: number;
  compareLeftStepsCount: number;
  compareRightStepsCount: number;
  compareLeftStatusText: string;
  compareRightStatusText: string;
}

interface Emits {
  (event: 'update-category', value: AlgorithmCategory): void;
  (event: 'update-left', value: string): void;
  (event: 'update-right', value: string): void;
  (event: 'swap'): void;
  (event: 'update-continue-longer', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function emitCategoryUpdate(value: unknown) {
  if (typeof value !== 'string' || !isAlgorithmCategory(value)) {
    return;
  }

  emit('update-category', value);
}
</script>

<template>
  <div class="space-y-4">
    <FieldSet>
      <FieldLegend>算法组</FieldLegend>
      <FieldContent>
        <Select
          :model-value="props.compareCategory ?? props.compareDefaultCategory"
          @update:model-value="emitCategoryUpdate"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="选择算法组" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sorting">排序算法</SelectItem>
            <SelectItem value="graphs">图算法</SelectItem>
            <SelectItem value="trees">树算法</SelectItem>
            <SelectItem value="divide-conquer">分治算法</SelectItem>
          </SelectContent>
        </Select>
      </FieldContent>
    </FieldSet>

    <FieldSet>
      <FieldLegend>算法选择</FieldLegend>
      <FieldContent class="space-y-3">
        <Field class="gap-2">
          <FieldLabel class="text-sm text-muted-foreground">左侧算法</FieldLabel>
          <Select
            :model-value="props.compareLeftSlug"
            @update:model-value="value => typeof value === 'string' && emit('update-left', value)"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择左侧算法" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="item in props.compareOptions"
                :key="`panel-left-${item.slug}`"
                :value="item.slug"
              >
                {{ item.title }}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Button variant="outline" size="sm" class="w-full" @click="emit('swap')">
          交换左右算法
        </Button>

        <Field class="gap-2">
          <FieldLabel class="text-sm text-muted-foreground">右侧算法</FieldLabel>
          <Select
            :model-value="props.compareRightSlug"
            @update:model-value="value => typeof value === 'string' && emit('update-right', value)"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择右侧算法" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="item in props.compareOptions"
                :key="`panel-right-${item.slug}`"
                :value="item.slug"
              >
                {{ item.title }}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldContent>
    </FieldSet>

    <FieldSet>
      <FieldLegend>执行模式</FieldLegend>
      <FieldContent>
        <Field orientation="responsive" class="gap-2">
          <FieldLabel class="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              :checked="props.compareContinueLonger"
              type="checkbox"
              class="h-4 w-4 rounded border-input accent-primary"
              @change="
                event => emit('update-continue-longer', (event.target as HTMLInputElement).checked)
              "
            />
            继续执行较长算法
          </FieldLabel>
          <FieldDescription>
            {{
              props.compareContinueLonger
                ? '模式：执行到较长算法结束'
                : '模式：同步对比（最短步数）'
            }}
          </FieldDescription>
        </Field>
      </FieldContent>
    </FieldSet>

    <div class="space-y-2 rounded-lg bg-muted/50 p-3 text-xs ring-1 ring-border/70">
      <p class="font-medium text-foreground">对比进度</p>
      <p class="text-muted-foreground">总步数：{{ props.totalSteps }}</p>
      <div class="rounded-md bg-background/80 p-2 ring-1 ring-border/70">
        <p class="text-muted-foreground">
          左侧：{{ props.compareLeftCurrentStep }} / {{ props.compareLeftStepsCount }}
        </p>
        <p class="mt-1 text-foreground">状态：{{ props.compareLeftStatusText }}</p>
      </div>
      <div class="rounded-md bg-background/80 p-2 ring-1 ring-border/70">
        <p class="text-muted-foreground">
          右侧：{{ props.compareRightCurrentStep }} / {{ props.compareRightStepsCount }}
        </p>
        <p class="mt-1 text-foreground">状态：{{ props.compareRightStatusText }}</p>
      </div>
    </div>
  </div>
</template>
