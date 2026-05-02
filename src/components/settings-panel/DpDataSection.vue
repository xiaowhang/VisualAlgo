<script setup lang="ts">
import {
  DP_INVESTMENT_MIN,
  DP_INVESTMENT_MAX,
  DP_RESOURCES_MIN,
  DP_RESOURCES_MAX,
  DP_KNAPSACK_CAPACITY_MIN,
  DP_KNAPSACK_CAPACITY_MAX,
  DP_KNAPSACK_ITEMS_MIN,
  DP_KNAPSACK_ITEMS_MAX,
  DP_LCS_STRING_LEN_MIN,
  DP_LCS_STRING_LEN_MAX,
} from '@/stores/algorithmInputs';
import type { ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

interface Props {
  algorithmSlug: string;
  dpLcsStringX: string;
  dpLcsStringY: string;
  dpKnapsackCapacity: string;
  dpKnapsackItemCount: string;
  dpInvestmentCount: string;
  dpInvestmentResources: string;
  dpValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-dp-lcs'): void;
  (event: 'apply-dp-knapsack'): void;
  (event: 'apply-dp-investment'): void;
  (event: 'update:dpLcsStringX', value: string): void;
  (event: 'update:dpLcsStringY', value: string): void;
  (event: 'update:dpKnapsackCapacity', value: string): void;
  (event: 'update:dpKnapsackItemCount', value: string): void;
  (event: 'update:dpInvestmentCount', value: string): void;
  (event: 'update:dpInvestmentResources', value: string): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet v-if="props.algorithmSlug === 'lcs'">
    <FieldLegend>LCS 设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>字符串 X</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.dpLcsStringX"
            class="flex-1"
            @update:model-value="(v: string | number) => emit('update:dpLcsStringX', String(v))"
          />
        </div>
        <FieldDescription>字符串 Y</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.dpLcsStringY"
            class="flex-1"
            @update:model-value="(v: string | number) => emit('update:dpLcsStringY', String(v))"
          />
          <Button variant="outline" size="sm" @click="emit('apply-dp-lcs')"> 应用 </Button>
        </div>
        <FieldDescription class="text-xs text-muted-foreground">
          长度范围：{{ DP_LCS_STRING_LEN_MIN }} - {{ DP_LCS_STRING_LEN_MAX }}
        </FieldDescription>
        <ValidationMessage :state="props.dpValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>

  <FieldSet v-if="props.algorithmSlug === 'knapsack'">
    <FieldLegend>背包设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>背包容量</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.dpKnapsackCapacity"
            type="number"
            :min="DP_KNAPSACK_CAPACITY_MIN"
            :max="DP_KNAPSACK_CAPACITY_MAX"
            class="h-9 w-24"
            @update:model-value="
              (v: string | number) => emit('update:dpKnapsackCapacity', String(v))
            "
          />
        </div>
        <FieldDescription>物品数量</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.dpKnapsackItemCount"
            type="number"
            :min="DP_KNAPSACK_ITEMS_MIN"
            :max="DP_KNAPSACK_ITEMS_MAX"
            class="h-9 w-24"
            @update:model-value="
              (v: string | number) => emit('update:dpKnapsackItemCount', String(v))
            "
          />
          <Button variant="outline" size="sm" @click="emit('apply-dp-knapsack')"> 应用 </Button>
        </div>
        <FieldDescription class="text-xs text-muted-foreground">
          容量：{{ DP_KNAPSACK_CAPACITY_MIN }}-{{ DP_KNAPSACK_CAPACITY_MAX }}， 物品：{{
            DP_KNAPSACK_ITEMS_MIN
          }}-{{ DP_KNAPSACK_ITEMS_MAX }}
        </FieldDescription>
        <ValidationMessage :state="props.dpValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>

  <FieldSet v-if="props.algorithmSlug === 'investment'">
    <FieldLegend>投资问题设置</FieldLegend>
    <FieldContent>
      <FieldGroup class="flex flex-col gap-2">
        <FieldDescription>投资项目数</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.dpInvestmentCount"
            type="number"
            :min="DP_INVESTMENT_MIN"
            :max="DP_INVESTMENT_MAX"
            class="h-9 w-24"
            @update:model-value="
              (v: string | number) => emit('update:dpInvestmentCount', String(v))
            "
          />
        </div>
        <FieldDescription>资源总量</FieldDescription>
        <div class="flex items-center gap-2">
          <Input
            :model-value="props.dpInvestmentResources"
            type="number"
            :min="DP_RESOURCES_MIN"
            :max="DP_RESOURCES_MAX"
            class="h-9 w-24"
            @update:model-value="
              (v: string | number) => emit('update:dpInvestmentResources', String(v))
            "
          />
          <Button variant="outline" size="sm" @click="emit('apply-dp-investment')"> 应用 </Button>
        </div>
        <FieldDescription class="text-xs text-muted-foreground">
          投资：{{ DP_INVESTMENT_MIN }}-{{ DP_INVESTMENT_MAX }}， 资源：{{ DP_RESOURCES_MIN }}-{{
            DP_RESOURCES_MAX
          }}
        </FieldDescription>
        <ValidationMessage :state="props.dpValidation" />
      </FieldGroup>
    </FieldContent>
  </FieldSet>
</template>
