<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { findAlgorithm } from '@/algorithms/registry';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
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
const customData = ref(algorithmInputs.sortingInput.value.join(', '));
const customDataMessage = ref('');
const customDataError = ref(false);

function applyCustomData() {
  const result = algorithmInputs.applyCustomSortingInput(customData.value);
  customDataMessage.value = result.message;
  customDataError.value = !result.ok;

  if (result.ok) {
    customData.value = algorithmInputs.sortingInput.value.join(', ');
  }
}

function randomizeData() {
  algorithmInputs.randomizeAlgorithmInput();
  customData.value = algorithmInputs.sortingInput.value.join(', ');
  customDataError.value = false;
  customDataMessage.value = '已生成随机输入。';
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
        <FieldGroup class="flex flex-row items-center gap-4">
          <div
            class="flex h-8 w-10 items-center justify-center rounded border bg-muted/30 font-mono text-sm"
          >
            {{ sortingSize }}
          </div>
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
  </div>
</template>
