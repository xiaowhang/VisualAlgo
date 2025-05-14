import * as d3 from 'd3'
import type { DataType, HighlightType } from '@/types'
import { COLORS, DEFAULT_SQUARE_SIZE } from '@/constants'

export interface VisualizerContext {
  svgElement: SVGSVGElement
  data: DataType[]
  highlight: HighlightType
  animationDuration: number
}

/**
 * 创建条形图可视化器
 * @param squareSize 条形图单位大小
 * @returns 绘制函数
 */
export function createBarChartVisualizer(squareSize: number = DEFAULT_SQUARE_SIZE) {
  return function drawBarChart(context: VisualizerContext) {
    const { svgElement, data, highlight, animationDuration } = context

    const maxHeightValue = Math.max(...data.map((d) => d.value))
    const maxHeight = maxHeightValue * squareSize

    // 创建或选择主组
    const g = d3.select(svgElement).select<SVGGElement>('g')

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
      .attr('x', (d, i) => i * (squareSize + squareSize / 10))
      .attr('y', (d) => maxHeight - d.value * squareSize)
      .attr('width', squareSize)
      .attr('height', (d) =>
        d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0,
      )
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', (d, i) => {
        const colorKey = highlight.get(i)
        return colorKey !== undefined ? COLORS[colorKey][5] : COLORS.default[5]
      })

    rectSelection
      .merge(enterRects)
      .transition()
      .duration(animationDuration)
      .attr('x', (d, i) => i * (squareSize + squareSize / 10))
      .attr('y', (d) => maxHeight - d.value * squareSize)
      .attr('height', (d) =>
        d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0,
      )
      .attr('fill', (d, i) => {
        const colorKey = highlight.get(i)
        return colorKey !== undefined ? COLORS[colorKey][5] : COLORS.default[5]
      })

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
      .attr('fill', (d, i) => {
        const colorKey = highlight.get(i)
        return colorKey !== undefined ? COLORS[colorKey][6] : COLORS.default[6]
      })
      .text((d) => d.value)

    textSelection
      .merge(enterTexts)
      .transition()
      .duration(animationDuration)
      .attr('y', maxHeight + 15)
      .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
      .attr('fill', (d, i) => {
        const colorKey = highlight.get(i)
        return colorKey !== undefined ? COLORS[colorKey][6] : COLORS.default[6]
      })
      .text((d) => d.value)
  }
}
