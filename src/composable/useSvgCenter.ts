import { useSvgStore } from '@/store'
import { storeToRefs } from 'pinia'

/**
 * SVG居中功能组合式函数
 *
 * @param drawCallback - 绘制SVG的回调函数
 * @returns 居中相关的方法
 */
export function useSvgCenter(drawCallback: () => void) {
  // 引入SVG状态管理
  const svgStore = useSvgStore()
  const { svgRef, offset } = storeToRefs(svgStore)

  /**
   * 计算并应用居中偏移量
   */
  function centerSvg() {
    if (!svgRef.value) return

    // 绘制SVG确定大小
    drawCallback()

    // 获取SVG元素的尺寸
    const { clientHeight: svgHeight, clientWidth: svgWidth } = svgRef.value
    const { x, y, width: gWidth, height: gHeight } = svgRef.value.getBBox()

    offset.value = {
      x: (svgWidth - gWidth) / 2 - x,
      y: (svgHeight - gHeight) / 2 - y,
    }
  }

  return {
    centerSvg,
  }
}
