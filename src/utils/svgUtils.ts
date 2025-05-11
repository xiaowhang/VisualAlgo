export function createSvgCenterer(svgNode: SVGSVGElement, drawFunction: () => void) {
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

export function centerSvg(
  svgNode: SVGSVGElement,
  drawFunction: () => void,
  offset = { x: 0, y: 0 },
) {
  return createSvgCenterer(svgNode, drawFunction)(offset)
}
