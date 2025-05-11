<template>
  <slot />
  <svg ref="svgRef" width="100%" height="100%" class="select-none"></svg>
</template>

<script setup lang="ts">
import { useSvgStore } from '@/store'

defineOptions({
  name: 'AlgorithmBase',
})

const svgStore = useSvgStore()
const svgRef = ref<SVGSVGElement | null>(null)

onMounted(() => {
  svgStore.svgRef = svgRef.value
})
</script>
