import * as d3 from 'd3';
import type { DpTableStep } from '@/types/algorithm';
import { resolveCssColorToken } from './resolveCssColorToken';
import { resolveDpCellColor, VISUALIZATION_COLOR_TOKENS } from './colorSemantics';

interface RenderDpTableContext {
  svgElement: SVGSVGElement;
  step: DpTableStep;
  transform: string;
}

interface TableBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const MARGIN = { top: 44, right: 16, bottom: 36, left: 72 };
const VIEWBOX_WIDTH = 760;
const VIEWBOX_HEIGHT = 480;
const MIN_CELL_WIDTH = 28;
const MIN_CELL_HEIGHT = 22;
const ARROW_MARKER_SIZE = 5;

export function getDpTableBounds(step: DpTableStep): TableBounds {
  const rowCount = step.rowLabels.length;
  const colCount = step.colLabels.length;
  const availableWidth = VIEWBOX_WIDTH - MARGIN.left - MARGIN.right;
  const availableHeight = VIEWBOX_HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxCellWidth = Math.max(MIN_CELL_WIDTH, Math.floor(availableWidth / colCount));
  const maxCellHeight = Math.max(MIN_CELL_HEIGHT, Math.floor(availableHeight / rowCount));
  const cellSize = Math.min(maxCellWidth, maxCellHeight);

  const padding = 8;
  return {
    minX: MARGIN.left - padding,
    maxX: MARGIN.left + colCount * cellSize + padding,
    minY: MARGIN.top - padding,
    maxY: MARGIN.top + rowCount * cellSize + MARGIN.bottom - MARGIN.top + padding,
  };
}

export function renderDpTable(context: RenderDpTableContext): void {
  const { svgElement, step, transform } = context;
  const svg = d3.select(svgElement);

  svg.selectAll('g.dp-root').remove();
  const root = svg.append('g').attr('class', 'dp-root').attr('transform', transform);

  const rowCount = step.rowLabels.length;
  const colCount = step.colLabels.length;
  const availableWidth = VIEWBOX_WIDTH - MARGIN.left - MARGIN.right;
  const availableHeight = VIEWBOX_HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxCellWidth = Math.max(MIN_CELL_WIDTH, Math.floor(availableWidth / colCount));
  const maxCellHeight = Math.max(MIN_CELL_HEIGHT, Math.floor(availableHeight / rowCount));
  const cellSize = Math.min(maxCellWidth, maxCellHeight);
  const cellWidth = cellSize;
  const cellHeight = cellSize;

  const svgEl = svgElement;
  const borderColor = resolveCssColorToken(svgEl, 'var(--border)');
  const textColor = resolveCssColorToken(svgEl, 'var(--foreground)');
  const mutedColor = resolveCssColorToken(svgEl, 'var(--muted)');
  const valueFontSize = Math.min(14, Math.floor(cellSize * 0.42));

  function cellX(col: number): number {
    return MARGIN.left + col * cellWidth;
  }

  function cellY(row: number): number {
    return MARGIN.top + row * cellHeight;
  }

  function resolveColor(row: number, col: number): string {
    const token = resolveDpCellColor(step, row, col);
    return resolveCssColorToken(svgEl, token);
  }

  // Arrow marker def
  svg.selectAll('defs').remove();
  const defs = svg.append('defs');
  defs
    .append('marker')
    .attr('id', 'dp-arrow')
    .attr('viewBox', '0 0 8 8')
    .attr('refX', 4)
    .attr('refY', 4)
    .attr('markerWidth', ARROW_MARKER_SIZE)
    .attr('markerHeight', ARROW_MARKER_SIZE)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 0 L 8 4 L 0 8 Z')
    .attr('fill', resolveCssColorToken(svgEl, VISUALIZATION_COLOR_TOKENS.compare));

  // ================================================================
  // Layer 1: Header fills (bottom-most)
  // ================================================================
  const fillGroup = root.append('g').attr('class', 'dp-fills');

  for (let col = 0; col < colCount; col++) {
    fillGroup
      .append('rect')
      .attr('x', cellX(col))
      .attr('y', cellY(0))
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', mutedColor);
  }

  for (let row = 1; row < rowCount; row++) {
    fillGroup
      .append('rect')
      .attr('x', cellX(0))
      .attr('y', cellY(row))
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', mutedColor);
  }

  // ================================================================
  // Layer 2: Grid lines
  // ================================================================
  const gridGroup = root.append('g').attr('class', 'dp-grid');

  for (let row = 0; row <= rowCount; row++) {
    gridGroup
      .append('line')
      .attr('x1', cellX(0))
      .attr('y1', cellY(row))
      .attr('x2', cellX(colCount))
      .attr('y2', cellY(row))
      .attr('stroke', borderColor)
      .attr('stroke-width', row === 0 || row === rowCount ? 1.5 : 0.5);
  }

  for (let col = 0; col <= colCount; col++) {
    gridGroup
      .append('line')
      .attr('x1', cellX(col))
      .attr('y1', cellY(0))
      .attr('x2', cellX(col))
      .attr('y2', cellY(rowCount))
      .attr('stroke', borderColor)
      .attr('stroke-width', col === 0 || col === colCount ? 1.5 : 0.5);
  }

  // ================================================================
  // Layer 3: Data cell background rects
  // ================================================================
  const cellGroup = root.append('g').attr('class', 'dp-cells');

  for (let row = 1; row < rowCount; row++) {
    for (let col = 1; col < colCount; col++) {
      const color = resolveColor(row, col);

      cellGroup
        .append('rect')
        .attr('x', cellX(col) + 1)
        .attr('y', cellY(row) + 1)
        .attr('width', cellWidth - 2)
        .attr('height', cellHeight - 2)
        .attr('fill', color)
        .attr('rx', 3)
        .attr('ry', 3);
    }
  }

  // ================================================================
  // Layer 4: Current cell highlight border
  // ================================================================
  if (step.currentCell) {
    const [cr, cc] = step.currentCell;
    const currentColor = resolveCssColorToken(svgEl, VISUALIZATION_COLOR_TOKENS.current);

    root
      .append('rect')
      .attr('class', 'dp-highlight')
      .attr('x', cellX(cc) + 1)
      .attr('y', cellY(cr) + 1)
      .attr('width', cellWidth - 2)
      .attr('height', cellHeight - 2)
      .attr('fill', 'none')
      .attr('stroke', currentColor)
      .attr('stroke-width', 3)
      .attr('rx', 3);
  }

  // ================================================================
  // Layer 5: Dependency arrows
  // ================================================================
  if (step.currentCell && step.phase === 'compute') {
    const [cr, cc] = step.currentCell;
    const arrowGroup = root.append('g').attr('class', 'dp-arrows');
    const arrowColor = resolveCssColorToken(svgEl, VISUALIZATION_COLOR_TOKENS.compare);

    for (const [key, kind] of Object.entries(step.highlights)) {
      if (kind !== 'dependency') continue;
      const [dr, dc] = key.split(',').map(Number);
      if (dr == null || dc == null) continue;

      arrowGroup
        .append('line')
        .attr('x1', cellX(cc) + cellWidth / 2)
        .attr('y1', cellY(cr) + cellHeight / 2)
        .attr('x2', cellX(dc) + cellWidth / 2)
        .attr('y2', cellY(dr) + cellHeight / 2)
        .attr('stroke', arrowColor)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,3')
        .attr('marker-end', 'url(#dp-arrow)');
    }
  }

  // ================================================================
  // Layer 6: Backtrack path
  // ================================================================
  if (step.backtrackPath && step.backtrackPath.length > 1) {
    const backtrackColor = resolveCssColorToken(svgEl, VISUALIZATION_COLOR_TOKENS.swap);
    const points = step.backtrackPath
      .map(([r, c]) => `${cellX(c) + cellWidth / 2},${cellY(r) + cellHeight / 2}`)
      .join(' ');

    root
      .append('polyline')
      .attr('class', 'dp-backtrack')
      .attr('points', points)
      .attr('fill', 'none')
      .attr('stroke', backtrackColor)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-dasharray', '6,3');

    // Endpoint dots on backtrack path
    for (const [r, c] of step.backtrackPath) {
      root
        .append('circle')
        .attr('class', 'dp-backtrack-dot')
        .attr('cx', cellX(c) + cellWidth / 2)
        .attr('cy', cellY(r) + cellHeight / 2)
        .attr('r', 3)
        .attr('fill', backtrackColor);
    }
  }

  // ================================================================
  // Layer 7: All text (top-most)
  // ================================================================
  const textGroup = root.append('g').attr('class', 'dp-values');

  // Column headers
  for (let col = 1; col < colCount; col++) {
    textGroup
      .append('text')
      .attr('x', cellX(col) + cellWidth / 2)
      .attr('y', cellY(0) + cellHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 12)
      .attr('font-weight', '600')
      .attr('fill', textColor)
      .text(step.colLabels[col] ?? '');
  }

  // Row headers
  for (let row = 1; row < rowCount; row++) {
    textGroup
      .append('text')
      .attr('x', cellX(0) + cellWidth / 2)
      .attr('y', cellY(row) + cellHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 12)
      .attr('font-weight', '600')
      .attr('fill', textColor)
      .text(step.rowLabels[row] ?? '');
  }

  // Data cell values
  for (let row = 1; row < rowCount; row++) {
    for (let col = 1; col < colCount; col++) {
      const value = step.table[row]?.[col];
      if (value === null || value === undefined) continue;

      textGroup
        .append('text')
        .attr('x', cellX(col) + cellWidth / 2)
        .attr('y', cellY(row) + cellHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', valueFontSize)
        .attr('font-weight', '500')
        .attr('fill', textColor)
        .text(String(value));
    }
  }
}
