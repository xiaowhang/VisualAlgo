<script setup lang="ts">
import type { NumericRange, ValidationState } from '@/features/settings/types';
import ValidationMessage from './ValidationMessage.vue';

const nodeCountInput = defineModel<string>('nodeCountInput', { required: true });
const startNodeInput = defineModel<string>('startNodeInput', { required: true });

interface Props {
  nodeCountRange: NumericRange;
  sizeValidation: ValidationState;
  nodeOptions: string[];
  generalValidation: ValidationState;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'apply-node-count'): void;
  (event: 'apply-start-node'): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <FieldSet>
    <FieldLegend>图设置</FieldLegend>
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
        <FieldDescription>起始节点</FieldDescription>
        <div class="flex items-center gap-2">
          <Select v-model="startNodeInput">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择起始节点" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="nodeId in props.nodeOptions" :key="nodeId" :value="nodeId">
                {{ nodeId }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" @click="emit('apply-start-node')"> 应用 </Button>
        </div>
      </FieldGroup>

      <ValidationMessage class="mt-2 block" :state="props.generalValidation" />
    </FieldContent>
  </FieldSet>
</template>
