import * as d3 from 'd3';
import type { SortingStep } from '@/types/algorithm';
import { resolveSortingBarColor, VISUALIZATION_COLOR_TOKENS } from './colorSemantics';

interface RenderSortingBarsContext {
  svgElement: SVGSVGElement;
  step: SortingStep;
}

export function renderSortingBars(context: RenderSortingBarsContext) {
  const { svgElement, step } = context;

  const width = 760;
  const height = 300;
  const margin = { top: 20, right: 24, bottom: 30, left: 24 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('class', 'h-full w-full');

  const group = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleBand<number>()
    .domain(d3.range(step.values.length))
    .range([0, chartWidth])
    .padding(0.16);

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
    .data(step.values)
    .join('text')
    .attr('class', 'value')
    .attr('x', (_: number, index: number) => (xScale(index) ?? 0) + xScale.bandwidth() / 2)
    .attr('y', (value: number) => yScale(value) - 8)
    .attr('text-anchor', 'middle')
    .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
    .attr('font-size', 12)
    .text((value: number) => value);
}
