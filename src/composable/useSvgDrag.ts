import * as d3 from 'd3'
import { useSvgStore, usePlayerStore } from '@/store'
import { storeToRefs } from 'pinia'

/**
 * SVG拖动功能组合式函数
 *
 * @param onDrag - 拖动时的回调函数
 * @returns 拖动相关的方法
 */
export function useSvgDrag(onDrag?: () => void) {
  // 引入Pinia状态管理
  const playerStore = usePlayerStore()
  const { isPlaying: disabled } = storeToRefs(playerStore)

  // 引入SVG状态管理
  const svgStore = useSvgStore()
  const { svgRef } = storeToRefs(svgStore)
  const { updateOffset } = svgStore

  /**
   * 设置拖动事件
   */
  function setupDragEvents() {
    if (!svgRef.value || disabled.value) return

    d3.select(svgRef.value).call(
      d3
        .drag<SVGSVGElement, unknown>()
        .on('drag', (event: d3.D3DragEvent<SVGSVGElement, unknown, unknown>) => {
          // 使用store的action更新偏移量
          updateOffset(event.dx, event.dy)

          // 如果提供了回调，则调用回调
          if (onDrag) {
            requestAnimationFrame(onDrag)
          }
        }),
    )
  }

  /**
   * 移除拖动事件
   */
  function removeDragEvents() {
    if (!svgRef.value) return
    d3.select(svgRef.value).on('.drag', null)
  }

  /**
   * 组件挂载时设置拖动事件
   */
  onMounted(() => {
    if (!disabled.value) {
      setupDragEvents()
    }
  })

  /**
   * 监听禁用状态的变化
   */
  watch(
    () => disabled.value,
    (isDisabled) => {
      if (isDisabled) {
        removeDragEvents()
      } else {
        setupDragEvents()
      }
    },
  )

  /**
   * 监听SVG引用的变化
   */
  watch(
    () => svgRef.value,
    () => {
      removeDragEvents()
      if (!disabled.value) {
        setupDragEvents()
      }
    },
  )

  /**
   * 组件卸载时移除拖动事件
   */
  onUnmounted(() => {
    removeDragEvents()
  })

  return {
    setupDragEvents,
    removeDragEvents,
  }
}
