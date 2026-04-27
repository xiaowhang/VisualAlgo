<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  isSortingAlgorithm: boolean;
  customDataMessage: string;
  customDataError: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'export-json'): void;
  (event: 'import-file', payload: Event): void;
}

const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement | null>(null);

function openImportFileDialog() {
  fileInputRef.value?.click();
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <CardTitle class="text-sm">导入 / 导出</CardTitle>
      <CardDescription>支持 JSON 文件</CardDescription>
    </CardHeader>
    <CardContent class="pt-0">
      <template v-if="props.isSortingAlgorithm">
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="emit('export-json')">导出 JSON</Button>
          <Button size="sm" @click="openImportFileDialog">导入文件</Button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            class="hidden"
            @change="event => emit('import-file', event)"
          />
        </div>
        <p
          v-if="props.customDataMessage"
          class="mt-3 text-xs"
          :class="props.customDataError ? 'text-destructive' : 'text-muted-foreground'"
        >
          {{ props.customDataMessage }}
        </p>
      </template>
      <p v-else class="text-sm text-muted-foreground">当前算法类型暂不支持文件导入导出。</p>
    </CardContent>
  </Card>
</template>
