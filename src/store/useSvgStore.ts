import { defineStore } from 'pinia'

export const useSvgStore = defineStore('svg', () => {
  // States
  const svgRef = ref<SVGSVGElement | null>(null)
  const offset = ref<{ x: number; y: number }>({ x: 0, y: 0 })

  // Actions
  function updateOffset(dx: number, dy: number) {
    offset.value.x += dx
    offset.value.y += dy
  }

  return {
    svgRef,
    offset,
    updateOffset,
  }
})
