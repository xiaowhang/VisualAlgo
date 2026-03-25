<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { findAlgorithm } from '@/algorithms/registry';
import {
  SORTING_MAX_SIZE,
  SORTING_MIN_SIZE,
  useAlgorithmInputsStore,
} from '@/stores/algorithmInputs';
import { useAlgorithmPlaybackStore } from '@/stores/algorithmPlayback';

const algorithmInputsStore = useAlgorithmInputsStore();
const playbackStore = useAlgorithmPlaybackStore();
const route = useRoute();
const algorithmInputsRefs = storeToRefs(algorithmInputsStore);
const playbackRefs = storeToRefs(playbackStore);

const algorithmInputs = {
  ...algorithmInputsRefs,
  randomizeAlgorithmInput: algorithmInputsStore.randomizeAlgorithmInput,
  applyCustomSortingInput: algorithmInputsStore.applyCustomSortingInput,
  exportSortingAsJsonText: algorithmInputsStore.exportSortingAsJsonText,
  importSortingFromJsonText: algorithmInputsStore.importSortingFromJsonText,
};
const playback = {
  ...playbackRefs,
};

const activeAlgorithm = computed(() => {
  const category = String(route.params.category ?? '');
  const slug = String(route.params.slug ?? '');
  return findAlgorithm(category, slug);
});

const steps = computed(() => activeAlgorithm.value?.createSteps() ?? []);

const currentStepData = computed(() => {
  if (steps.value.length === 0) {
    return null;
  }
  return steps.value[playback.currentStep.value] ?? steps.value[0];
});

const sortingSize = computed(() => algorithmInputs.sortingInput.value.length);
const sizeInput = ref(String(sortingSize.value));
const sizeMessage = ref('');
const sizeError = ref(false);
const customData = ref(algorithmInputs.sortingInput.value.join(', '));
const customDataMessage = ref('');
const customDataError = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

watch(sortingSize, value => {
  sizeInput.value = String(value);
});

function normalizeSizeInput(rawValue: string) {
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return {
      normalized: sortingSize.value,
      adjusted: true,
    };
  }

  const integerSize = Math.trunc(parsed);
  const clamped = Math.min(SORTING_MAX_SIZE, Math.max(SORTING_MIN_SIZE, integerSize));

  return {
    normalized: clamped,
    adjusted: clamped !== integerSize,
  };
}

function applySizeFromInput() {
  const { normalized, adjusted } = normalizeSizeInput(sizeInput.value);

  sizeInput.value = String(normalized);
  sizeError.value = adjusted;
  sizeMessage.value = adjusted
    ? `长度范围为 ${SORTING_MIN_SIZE}-${SORTING_MAX_SIZE}，已自动调整。`
    : '';

  return normalized;
}

function applyCustomData() {
  const result = algorithmInputs.applyCustomSortingInput(customData.value);
  customDataMessage.value = result.message;
  customDataError.value = !result.ok;

  if (result.ok) {
    customData.value = algorithmInputs.sortingInput.value.join(', ');
  }
}

function randomizeData() {
  const size = applySizeFromInput();
  algorithmInputs.randomizeAlgorithmInput(size);
  customData.value = algorithmInputs.sortingInput.value.join(', ');
  customDataError.value = false;
  customDataMessage.value = `已按 ${size} 个元素生成随机输入。`;
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

function exportJsonFile() {
  const text = algorithmInputs.exportSortingAsJsonText();
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const fileName = `sorting-input-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;
  downloadTextFile(fileName, text, 'application/json;charset=utf-8');
  customDataError.value = false;
  customDataMessage.value = '已导出 JSON 文件。';
}

function openImportFileDialog() {
  fileInputRef.value?.click();
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const lowerCaseName = file.name.toLowerCase();
    const result = lowerCaseName.endsWith('.json')
      ? algorithmInputs.importSortingFromJsonText(text)
      : {
          ok: false,
          message: '仅支持 .json 文件。',
        };

    customDataError.value = !result.ok;
    customDataMessage.value = result.message;

    if (result.ok) {
      customData.value = algorithmInputs.sortingInput.value.join(', ');
    }
  } catch {
    customDataError.value = true;
    customDataMessage.value = '读取文件失败，请重试。';
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <div class="flex w-80 flex-col gap-8 border-l border-sidebar-border bg-sidebar p-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ activeAlgorithm?.title ?? '算法未找到' }}</CardTitle>
        <CardDescription>
          {{ activeAlgorithm?.description ?? '请从左侧重新选择算法。' }}
        </CardDescription>
      </CardHeader>
      <CardContent v-if="activeAlgorithm">
        <p class="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          {{ currentStepData?.description ?? '暂无步骤数据' }}
        </p>
      </CardContent>
    </Card>

    <Fieldset>
      <FieldLegend>Generation</FieldLegend>
      <FieldContent>
        <Button variant="outline" @click="randomizeData">Random</Button>
      </FieldContent>
    </Fieldset>

    <Fieldset>
      <FieldLegend>Size</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-col gap-2">
          <Input
            v-model="sizeInput"
            type="number"
            :min="SORTING_MIN_SIZE"
            :max="SORTING_MAX_SIZE"
            @blur="applySizeFromInput"
          />
          <FieldDescription>范围：{{ SORTING_MIN_SIZE }} - {{ SORTING_MAX_SIZE }}</FieldDescription>
          <span
            v-if="sizeMessage"
            class="text-xs"
            :class="sizeError ? 'text-destructive' : 'text-muted-foreground'"
          >
            {{ sizeMessage }}
          </span>
        </FieldGroup>
      </FieldContent>
    </Fieldset>
    <Fieldset>
      <FieldLegend>Custom Data</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-col gap-2">
          <FieldDescription>Enter comma separated numbers</FieldDescription>
          <Textarea
            v-model="customData"
            placeholder="12, 5, 8, 30, 2..."
            class="min-h-30 resize-none"
          />
          <div class="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" @click="applyCustomData">Apply</Button>
            <span
              v-if="customDataMessage"
              class="text-xs"
              :class="customDataError ? 'text-destructive' : 'text-muted-foreground'"
            >
              {{ customDataMessage }}
            </span>
          </div>
        </FieldGroup>
      </FieldContent>
    </Fieldset>

    <Fieldset>
      <FieldLegend>Import / Export</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-col gap-2">
          <FieldDescription>支持 JSON 文件</FieldDescription>
          <div class="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" @click="exportJsonFile">Export JSON</Button>
            <Button size="sm" @click="openImportFileDialog">Import File</Button>
            <input
              ref="fileInputRef"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleImportFile"
            />
          </div>
        </FieldGroup>
      </FieldContent>
    </Fieldset>
  </div>
</template>
