import * as d3 from 'd3';
import type { SortingStep } from '@/types/algorithm';
import { resolveSortingBarColor, VISUALIZATION_COLOR_TOKENS } from './colorSemantics';

interface RenderSortingBarsContext {
  svgElement: SVGSVGElement;
  step: SortingStep;
  transform?: string;
}

export function renderSortingBars(context: RenderSortingBarsContext) {
  const { svgElement, step, transform } = context;

  const width = 760;
  const height = 300;
  const margin = { top: 16, right: 80, bottom: 16, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('class', 'h-full w-full');

  const group = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top}) ${transform ?? ''}`.trim());

  const xScale = d3
    .scaleBand<number>()
    .domain(d3.range(step.values.length))
    .range([0, chartWidth])
    .padding(0.16);

  const barBandwidth = xScale.bandwidth();
  const labelFontSize = Math.max(8, Math.min(12, Math.round(barBandwidth * 0.6)));

  const maxValue = d3.max(step.values) ?? 1;
  const yScale = d3.scaleLinear().domain([0, maxValue]).range([chartHeight, 0]).nice();

  group
    .selectAll('rect')
    .data(step.values)
    .join('rect')
    .attr('x', (_: number, index: number) => xScale(index) ?? 0)
    .attr('y', (value: number) => yScale(value))
    .attr('width', xScale.bandwidth())
    .attr('height', (value: number) => chartHeight - yScale(value))
    .attr('rx', 4)
    .attr('fill', (_: number, index: number) => resolveSortingBarColor(step, index));

  group
    .selectAll('text.value')
    .data(step.values.map((value, index) => ({ value, index })))
    .join('text')
    .attr('class', 'value')
    .attr('x', item => (xScale(item.index) ?? 0) + xScale.bandwidth() / 2)
    .attr('y', item => yScale(item.value) - Math.max(6, labelFontSize * 0.7))
    .attr('text-anchor', 'middle')
    .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
    .attr('font-size', labelFontSize)
    .attr('pointer-events', 'none')
    .style('user-select', 'none')
    .style('-webkit-user-select', 'none')
    .text(item => item.value);
}
