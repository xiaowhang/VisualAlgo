<template>
  <slot v-if="svgRef" />
  <svg ref="svgRef" width="100%" height="100%" class="select-none">
    <g :transform="`translate(${offset.x}, ${offset.y})`" />
  </svg>
</template>

<script setup lang="ts">
import { useSvgStore } from '@/store'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'AlgorithmBase',
})

const svgStore = useSvgStore()
const { svgRef, offset } = storeToRefs(svgStore)
</script>
