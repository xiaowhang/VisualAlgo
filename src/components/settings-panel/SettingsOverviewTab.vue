<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  panelDescription: string;
  stepDescription: string;
  isCompareView: boolean;
}

const props = defineProps<Props>();

const formattedStepDescription = computed(() => {
  const raw = props.stepDescription;
  if (!raw) return '';

  return raw.replace(/\n/g, '<br>');
});
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm">算法说明</CardTitle>
        <CardDescription>{{ panelDescription }}</CardDescription>
      </CardHeader>
      <CardContent class="pt-0">
        <p
          class="rounded-lg bg-muted/50 p-3 text-sm leading-6 text-muted-foreground shadow-sm ring-1 ring-border/70"
          v-html="formattedStepDescription"
        />
      </CardContent>
    </Card>

    <Card v-if="isCompareView">
      <CardHeader class="pb-3">
        <CardTitle class="text-sm">对比模式提示</CardTitle>
      </CardHeader>
      <CardContent class="pt-0 text-sm text-muted-foreground">
        左右算法共享同一份输入，修改后会同步影响两侧结果。
      </CardContent>
    </Card>
  </div>
</template>
