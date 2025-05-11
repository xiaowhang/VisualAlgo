import * as d3 from 'd3'
import type { DataType } from '@/algorithms/types'

export interface VisualizerContext {
  svgElement: SVGSVGElement
  data: DataType[]
  highlight: number[]
  isAnimating: boolean
  animationAction: string | null
  offset: { x: number; y: number }
}

/**
 * 创建条形图可视化器
 * @param squareSize 条形图单位大小
 * @returns 绘制函数
 */
export function createBarChartVisualizer(squareSize: number = 20) {
  return function drawBarChart(context: VisualizerContext) {
    const { svgElement, data, highlight, isAnimating, animationAction, offset } = context

    const svg = d3.select(svgElement)
    if (!data) {
      svg.selectAll('*').remove()
      return
    }

    const isSwapAnimating = isAnimating && animationAction === 'swap'
    const animationDuration = isSwapAnimating ? 300 : 0

    const maxHeightValue = data.length > 0 ? Math.max(0, ...data.map((d) => d.value)) : 0
    const maxHeight = maxHeightValue > 0 ? maxHeightValue * squareSize : squareSize

    // 创建或选择主组
    let g = svg.select<SVGGElement>('g.main-group')
    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-group')
    }
    g.attr('transform', `translate(${offset.x},${offset.y})`)

    // 绘制矩形
    const rectSelection = g.selectAll<SVGRectElement, DataType>('rect.bar').data(data, (d) => d.id)

    rectSelection
      .exit()
      .transition()
      .duration(animationDuration)
      .attr('opacity', 0)
      .attr('height', 0)
      .attr('y', maxHeight)
      .remove()

    const enterRects = rectSelection
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('data-id', (d) => d.id)
      .attr('y', (d) => maxHeight - d.value * squareSize)
      .attr('width', squareSize)
      .attr('height', (d) =>
        d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0,
      )
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', (d, i) => i * (squareSize + squareSize / 10))
      .attr('fill', (d, i) => (highlight.includes(i) ? '#FF9800' : '#4CAF50'))

    rectSelection
      .merge(enterRects)
      .transition()
      .duration(animationDuration)
      .attr('x', (d, i) => i * (squareSize + squareSize / 10))
      .attr('y', (d) => maxHeight - d.value * squareSize)
      .attr('height', (d) =>
        d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0,
      )
      .attr('fill', (d, i) => (highlight.includes(i) ? '#FF9800' : '#4CAF50'))

    // 绘制文本标签
    const textSelection = g
      .selectAll<SVGTextElement, DataType>('text.value-label')
      .data(data, (d) => d.id)

    textSelection.exit().transition().duration(animationDuration).attr('opacity', 0).remove()

    const enterTexts = textSelection
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('data-id', (d) => d.id)
      .attr('y', maxHeight + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
      .attr('fill', (d, i) => (highlight.includes(i) ? '#FF9800' : '#4CAF50'))
      .text((d) => d.value)

    textSelection
      .merge(enterTexts)
      .transition()
      .duration(animationDuration)
      .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
      .attr('fill', (d, i) => (highlight.includes(i) ? '#FF9800' : '#4CAF50'))
      .text((d) => d.value)
  }
}
