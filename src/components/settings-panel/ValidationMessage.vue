<script setup lang="ts">
import type { ValidationState } from '@/features/settings/types';

interface Props {
  state: ValidationState;
}

const props = defineProps<Props>();
</script>

<template>
  <span
    v-if="props.state.message"
    class="text-xs"
    :class="props.state.error ? 'text-destructive' : 'text-muted-foreground'"
  >
    {{ props.state.message }}
  </span>
</template>
