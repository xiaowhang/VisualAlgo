<script setup lang="ts">
const sizeInput = defineModel<string>('sizeInput', { required: true });
const graphNodeCountInput = defineModel<string>('graphNodeCountInput', { required: true });
const graphStartNodeInput = defineModel<string>('graphStartNodeInput', { required: true });
const customData = defineModel<string>('customData', { required: true });

interface Props {
  isSortingAlgorithm: boolean;
  isGraphAlgorithm: boolean;
  sortingMinSize: number;
  sortingMaxSize: number;
  sizeMessage: string;
  sizeError: boolean;
  graphMinNodes: number;
  graphMaxNodes: number;
  graphSizeMessage: string;
  graphSizeError: boolean;
  graphNodeOptions: string[];
  graphMessage: string;
  graphMessageError: boolean;
  customDataMessage: string;
  customDataError: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'randomize-data'): void;
  (event: 'apply-size'): void;
  (event: 'apply-graph-node-count'): void;
  (event: 'apply-graph-start-node'): void;
  (event: 'apply-custom-data'): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <div class="space-y-5">
    <FieldSet>
      <FieldLegend>数据生成</FieldLegend>
      <FieldContent>
        <Button variant="outline" @click="emit('randomize-data')">随机生成</Button>
      </FieldContent>
    </FieldSet>

    <FieldSet v-if="props.isSortingAlgorithm">
      <FieldLegend>数据规模</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-col gap-2">
          <Input
            v-model="sizeInput"
            type="number"
            :min="props.sortingMinSize"
            :max="props.sortingMaxSize"
            @blur="emit('apply-size')"
          />
          <FieldDescription>
            范围：{{ props.sortingMinSize }} - {{ props.sortingMaxSize }}
          </FieldDescription>
          <span
            v-if="props.sizeMessage"
            class="text-xs"
            :class="props.sizeError ? 'text-destructive' : 'text-muted-foreground'"
          >
            {{ props.sizeMessage }}
          </span>
        </FieldGroup>
      </FieldContent>
    </FieldSet>

    <FieldSet v-if="props.isGraphAlgorithm">
      <FieldLegend>图设置</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-col gap-2">
          <FieldDescription>节点数量</FieldDescription>
          <div class="flex items-center gap-2">
            <Input
              v-model="graphNodeCountInput"
              type="number"
              :min="props.graphMinNodes"
              :max="props.graphMaxNodes"
              @blur="emit('apply-graph-node-count')"
            />
            <Button variant="outline" size="sm" @click="emit('apply-graph-node-count')">
              应用
            </Button>
          </div>
          <FieldDescription
            >范围：{{ props.graphMinNodes }} - {{ props.graphMaxNodes }}</FieldDescription
          >
          <span
            v-if="props.graphSizeMessage"
            class="text-xs"
            :class="props.graphSizeError ? 'text-destructive' : 'text-muted-foreground'"
          >
            {{ props.graphSizeMessage }}
          </span>
        </FieldGroup>

        <FieldGroup class="mt-4 flex flex-col gap-2">
          <FieldDescription>起始节点</FieldDescription>
          <div class="flex items-center gap-2">
            <Select v-model="graphStartNodeInput">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择起始节点" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="nodeId in props.graphNodeOptions" :key="nodeId" :value="nodeId">
                  {{ nodeId }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" @click="emit('apply-graph-start-node')">
              应用
            </Button>
          </div>
        </FieldGroup>

        <span
          v-if="props.graphMessage"
          class="mt-2 block text-xs"
          :class="props.graphMessageError ? 'text-destructive' : 'text-muted-foreground'"
        >
          {{ props.graphMessage }}
        </span>
      </FieldContent>
    </FieldSet>

    <FieldSet v-if="props.isSortingAlgorithm">
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
            <span
              v-if="props.customDataMessage"
              class="text-xs"
              :class="props.customDataError ? 'text-destructive' : 'text-muted-foreground'"
            >
              {{ props.customDataMessage }}
            </span>
          </div>
        </FieldGroup>
      </FieldContent>
    </FieldSet>
  </div>
</template>
