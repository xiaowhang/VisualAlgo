import * as d3 from 'd3';
import type { LpTableauStep } from '@/types/algorithm';
import { resolveCssColorToken } from './resolveCssColorToken';
import { resolveLpTableauCellColor, VISUALIZATION_COLOR_TOKENS } from './colorSemantics';

interface LpTableauRenderContext {
  svgElement: SVGSVGElement;
  step: LpTableauStep;
  transform: string;
}

const MARGIN = { top: 44, right: 16, bottom: 36, left: 72 };
const MIN_CELL_WIDTH = 60;
const MIN_CELL_HEIGHT = 28;

export function getLpTableauBounds(step: LpTableauStep) {
  const colCount = step.variableNames.length;
  const rowCount = step.rowLabels.length;
  const cellWidth = Math.max(MIN_CELL_WIDTH, 50);
  const cellHeight = Math.max(MIN_CELL_HEIGHT, 26);

  return {
    minX: MARGIN.left - 8,
    maxX: MARGIN.left + colCount * cellWidth + 8,
    minY: MARGIN.top - 8,
    maxY: MARGIN.top + rowCount * cellHeight + MARGIN.bottom,
  };
}

export function renderLpTableau(context: LpTableauRenderContext): void {
  const { svgElement, step, transform } = context;
  const svg = d3.select(svgElement);

  svg.selectAll('g.lp-root').remove();
  const root = svg.append('g').attr('class', 'lp-root');
  root.attr('transform', transform);

  const colCount = step.variableNames.length;
  const rowCount = step.rowLabels.length;
  const cellWidth = Math.max(MIN_CELL_WIDTH, 50);
  const cellHeight = Math.max(MIN_CELL_HEIGHT, 26);

  const textColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.text);
  const borderColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.border);

  // Column headers
  for (let j = 0; j < colCount; j++) {
    const x = MARGIN.left + j * cellWidth;
    root
      .append('text')
      .attr('x', x + cellWidth / 2)
      .attr('y', MARGIN.top - 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .attr('fill', textColor)
      .text(step.variableNames[j]);
  }

  // Row labels + cells
  for (let i = 0; i < rowCount; i++) {
    // Row label
    root
      .append('text')
      .attr('x', MARGIN.left - 12)
      .attr('y', MARGIN.top + i * cellHeight + cellHeight / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('fill', textColor)
      .text(step.rowLabels[i]);

    for (let j = 0; j < colCount; j++) {
      const x = MARGIN.left + j * cellWidth;
      const y = MARGIN.top + i * cellHeight;
      const key = `${i},${j}`;
      const cellColor = resolveCssColorToken(svgElement, resolveLpTableauCellColor(step, key));

      root
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('fill', cellColor)
        .attr('stroke', borderColor)
        .attr('stroke-width', 0.5);

      const value = step.tableau[i]?.[j];
      if (value != null) {
        root
          .append('text')
          .attr('x', x + cellWidth / 2)
          .attr('y', y + cellHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 12)
          .attr('fill', textColor)
          .text(Number.isInteger(value) ? String(value) : value.toFixed(2));
      }
    }
  }

  // Objective value display
  const bounds = getLpTableauBounds(step);
  const phaseText =
    step.phase === 'optimal'
      ? '最优解'
      : step.phase === 'unbounded'
        ? '无界'
        : step.phase === 'infeasible'
          ? '无可行解'
          : '迭代中';

  root
    .append('text')
    .attr('x', (bounds.minX + bounds.maxX) / 2)
    .attr('y', bounds.maxY - 8)
    .attr('text-anchor', 'middle')
    .attr('font-size', 13)
    .attr('font-weight', 700)
    .attr('fill', textColor)
    .text(`${phaseText} | Z = ${step.objectiveValue.toFixed(2)}`);
}
