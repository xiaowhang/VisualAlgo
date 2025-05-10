/**
 * 创建SVG居中函数
 * @param {HTMLElement} svgNode - SVG DOM节点
 * @param {Function} drawFunction - 绘制函数，在计算大小前调用
 * @returns {Function} 返回一个接收offset参数并返回新offset的函数
 */
export function createSvgCenterer(svgNode: SVGSVGElement, drawFunction:() => void) {
  /**
   * 居中SVG内容
   * @param {Object} offset - 偏移对象，包含x和y属性
   * @returns {Object} 更新后的偏移对象
   */
  return function (offset = { x: 0, y: 0 }) {
    if (!svgNode) return offset

    // 确保在计算大小之前绘制一次
    drawFunction()

    const { clientHeight: svgHeight, clientWidth: svgWidth } = svgNode
    const { x, y, width: gWidth, height: gHeight } = svgNode.getBBox()

    const newOffset = { ...offset }
    newOffset.x = (svgWidth - gWidth) / 2 - x
    newOffset.y = (svgHeight - gHeight) / 2 - y

    return newOffset
  }
}

/**
 * 居中SVG内容（直接调用版本）
 * @param {HTMLElement} svgNode - SVG DOM节点
 * @param {Function} drawFunction - 绘制函数，在计算大小前调用
 * @param {Object} offset - 偏移对象，包含x和y属性
 * @returns {Object} 更新后的偏移对象
 */
export function centerSvg(svgNode: SVGSVGElement, drawFunction:() => void, offset = { x: 0, y: 0 }) {
  return createSvgCenterer(svgNode, drawFunction)(offset)
}
