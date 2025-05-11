import { useSvgStore, usePlayerStore } from '@/store'
import { storeToRefs } from 'pinia'
import * as d3 from 'd3'

/**
 * SVG居中功能组合式函数
 *
 * @param drawCallback - 绘制SVG的回调函数
 * @returns 居中相关的方法
 */
export function useSvgCenter(drawCallback: () => void) {
  const svgStore = useSvgStore()
  const { svgRef, offset } = storeToRefs(svgStore)

  const playerStore = usePlayerStore()
  const { playerInterval: duration } = storeToRefs(playerStore)

  let isFirstCenter = true

  /**
   * 计算并应用居中偏移量，带有动画效果
   */
  function centerSvg() {
    if (!svgRef.value) return

    // 绘制SVG确定大小
    drawCallback()

    // 获取SVG元素的尺寸
    const { clientHeight: svgHeight, clientWidth: svgWidth } = svgRef.value
    const { width: gWidth, height: gHeight } = svgRef.value.getBBox()

    // 计算目标偏移量
    const targetOffset = {
      x: (svgWidth - gWidth) / 2,
      y: (svgHeight - gHeight) / 2,
    }

    // 如果是第一次居中，直接设置偏移量
    if (isFirstCenter) {
      offset.value = targetOffset
      isFirstCenter = false
      return
    }

    // 获取当前偏移量
    const currentOffset = { ...offset.value }

    // 创建动画补间函数
    const interpolateX = d3.interpolateNumber(currentOffset.x, targetOffset.x)
    const interpolateY = d3.interpolateNumber(currentOffset.y, targetOffset.y)

    // 应用动画
    d3.selection()
      .transition()
      .duration(duration.value)
      .tween('centerSvg', () => (t: number) => {
        offset.value = {
          x: interpolateX(t),
          y: interpolateY(t),
        }
      })
  }

  return {
    centerSvg,
  }
}
