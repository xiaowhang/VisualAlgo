<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'flex flex-col gap-6 rounded-xl bg-card py-6 text-card-foreground shadow-md ring-1 ring-border/70',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
