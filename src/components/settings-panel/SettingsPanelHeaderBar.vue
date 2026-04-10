<script setup lang="ts">
interface Props {
  title: string;
  modeLabel: string;
}

defineProps<Props>();
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-lg border border-border/80 bg-background/70 px-3 py-2"
  >
    <span class="min-w-0 flex-1 truncate text-base font-bold text-foreground xl:text-lg">{{
      title
    }}</span>
    <span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{{
      modeLabel
    }}</span>
  </div>
</template>
